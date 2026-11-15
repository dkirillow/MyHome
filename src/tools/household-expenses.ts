import { z } from 'zod';                                                               // проверка аргументов
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';              // тип сервера
import { expenses, MONEY_CATEGORIES, type MoneyCategory } from '../data/mock-data.js'; // данные
import { textResult, errorResult } from './result.js';                                 // обычный ответ и ошибка

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // формат ГГГГ-ММ-ДД

// Вход: строка даты. Выход: true, если такая дата бывает в календаре.
function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);                                       // строим дату
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; // 2026-02-31 не пройдёт
}

// Вход: dateFrom, dateTo, category. Выход: ошибка с именем поля или расходы с итогами.
export function getHouseholdExpenses(args: { dateFrom: string; dateTo: string; category?: MoneyCategory }) {
  if (!isRealDate(args.dateFrom)) 
    return { error: 'dateFrom: нет такой даты, нужен формат ГГГГ-ММ-ДД' }; // ошибка первой даты
  if (!isRealDate(args.dateTo)) 
    return { error: 'dateTo: нет такой даты, нужен формат ГГГГ-ММ-ДД' };   // ошибка второй даты
  if (args.dateFrom > args.dateTo) 
    return { error: 'dateFrom: начало периода позже конца (dateTo)' };     // строки в этом формате можно сравнивать как строки
  const items = expenses.filter(
    (e) => e.date >= args.dateFrom && e.date <= args.dateTo && (!args.category || e.category === args.category), // период + категория
  );
  const totalRub = items.reduce((sum, e) => sum + e.amountRub, 0); // общая сумма
  const byCategory: Record<string, number> = {};                                               // суммы по категориям
  for (const e of items) byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amountRub; // накапливаем
  return { currency: 'RUB', 
           dateFrom: args.dateFrom, 
           dateTo: args.dateTo, 
           count: items.length, 
           totalRub, 
           byCategory, 
           items 
        }; // пустой период — нормальный ответ
}

// Вход: server. Выход: ничего, инструмент добавлен на сервер.
export function registerHouseholdExpensesTool(server: McpServer) {
  server.registerTool(
    'get_household_expenses',
    {
      title: 'Расходы за период',
      description:
        'Возвращает уже совершённые расходы дома за период с итоговой суммой и суммами по категориям, в рублях. ' + // что делает
        'Вызывай, когда спрашивают, сколько потратили за месяц или на что уходят деньги. ' +                        // когда звать
        'Не показывает будущие платежи (для этого get_upcoming_payments) и ничего не меняет.',                      // чего не делает
      inputSchema: {
        dateFrom: z.string().regex(DATE_RE, 'нужен формат ГГГГ-ММ-ДД').describe('Начало периода включительно, гггг-мм-дд, например 2026-10-01'), // от
        dateTo: z.string().regex(DATE_RE, 'нужен формат ГГГГ-ММ-ДД').describe('Конец периода включительно, гггг-мм-дд, например 2026-10-31'),    // до
        category: z.enum(MONEY_CATEGORIES).optional().describe('Категория расходов. Без неё берутся все категории'),                             // необязательно
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }, // только читает
    },
    async (args) => {
      const result = getHouseholdExpenses(args);               // считаем
      if (result.error !== undefined) return errorResult(result.error); // неверные аргументы — isError
      return textResult(result);                               // обычный ответ
    },
  );
}