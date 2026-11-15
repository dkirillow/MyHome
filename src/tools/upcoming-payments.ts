import { z } from 'zod';                                                  // проверка аргументов
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // тип сервера
import { payments, DEMO_TODAY } from '../data/mock-data.js';              // данные и демо-«сегодня»
import { textResult } from './result.js';                                 // готовый ответ

// Вход: today — дата, days — число дней. Выход: дата через days дней в формате ГГГГ-ММ-ДД.
function addDays(today: string, days: number): string {
  const date = new Date(`${today}T00:00:00Z`); // берём дату
  date.setUTCDate(date.getUTCDate() + days);   // добавляем дни
  return date.toISOString().slice(0, 10);      // обратно в строку
}

// Вход: days — сколько дней вперёд. Выход: платежи от «сегодня» до «сегодня + days» с итогом.
export function getUpcomingPayments(args: { days: number }) {
  const until = addDays(DEMO_TODAY, args.days);                   // конец окна
  const items = payments
    .filter((p) => p.dueDate >= DEMO_TODAY && p.dueDate <= until) // только будущие в окне
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));          // ближайшие первыми
  const totalRub = items.reduce((sum, p) => sum + p.amountRub, 0);// сумма к оплате
  return { currency: 'RUB', 
           today: DEMO_TODAY, 
           until, 
           count: items.length, 
           totalRub, 
           items }; // пустой список — нормальный ответ
}

// Вход: server. Выход: ничего, инструмент добавлен на сервер.
export function registerUpcomingPaymentsTool(server: McpServer) {
  server.registerTool(
    'get_upcoming_payments',
    {
      title: 'Ближайшие платежи',
      description:
        'Возвращает предстоящие платежи (коммуналка, интернет, страховка, подписки) на ближайшие N дней с датами, суммами и итогом. ' +     // что делает
        'Вызывай, когда спрашивают, что и когда надо оплатить. ' +                                                                          // когда звать
        'Не показывает уже сделанные расходы (для этого get_household_expenses), не оплачивает платежи и ничего не меняет.',                // чего не делает
      inputSchema: {
        days: z.number().int().min(1).max(365).default(30).describe('На сколько дней вперёд смотреть, целое от 1 до 365. По умолчанию 30'), // границы и значение по умолчанию
      },
      annotations: { readOnlyHint: true, 
                     destructiveHint: false, 
                     idempotentHint: true, 
                     openWorldHint: false },               // только читает
    },
    async (args) => textResult(getUpcomingPayments(args)), // считаем и отвечаем
  );
}