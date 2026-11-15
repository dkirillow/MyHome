import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';                 // тип сервера, нужен только для подсказок
import { DEMO_TODAY, household, inventory, payments, tasks } from '../data/mock-data.js'; // демо-данные
import { textResult } from './result.js';                                                 // обёртка для ответа

export function getHouseholdOverview() { // собираем сводку Вход: ничего. Выход: объект со сводкой по дому
  const openTasks = tasks.filter((task) => task.status === 'open'); // оставляем только незавершённые задачи
  const nextPayment = payments
    .filter((payment) => payment.dueDate >= DEMO_TODAY)     // платежи, срок которых ещё не прошёл
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]; // самый ранний из них (или undefined, если нет)
  return {
    demoNotice: 'Демонстрационные данные, не данные реальных людей', // напоминание, что всё выдумано
    today: DEMO_TODAY,                                               // от какой даты считаем
    householdName: household.name,                                   // название дома
    members: household.members,                                      // жильцы
    currency: 'RUB',                                                 // валюта сумм
    inventoryCount: inventory.length,                                // сколько предметов в списке имущества
    openTasksCount: openTasks.length,                                // сколько открытых задач
    nextPayment: nextPayment ?                                       // ближайший платёж
        { title: nextPayment.title, 
          dueDate: nextPayment.dueDate, 
          amountRub: nextPayment.amountRub }                         // если он есть — коротко о нём
      : null,                                                        // если платежей нет — null
  };
}

export function registerHouseholdOverviewTool(server: McpServer): void { // регистрируем инструмент Вход: сервер. Выход: ничего
  server.registerTool(
    'get_household_overview',                                            // имя инструмента: глагол_существительное, snake_case
    {
      title: 'Сводка по дому',                                           // человекочитаемое название
      description:                                                       // по этому тексту AI решает, вызывать ли инструмент
        'Показывает краткую сводку демонстрационного домашнего пространства: название, жильцов, ' +
        'сколько предметов в списке имущества, сколько открытых задач и какой платёж ближайший. ' +
        'Вызывай, когда пользователь просит общий обзор дома или спрашивает, что у них дома происходит. ' +
        'Не ищет конкретные вещи, не считает расходы, не показывает полный список платежей, ' +
        'ничего не создаёт и не изменяет.' + 'Для подробностей вызывай search_home_inventory (имущество),' + 
        'get_household_expenses (расходы), get_upcoming_payments (платежи).',                              // три вопроса README: что делает, когда вызывать, чего не делает
      annotations: {
        readOnlyHint: true,     // инструмент только читает
        destructiveHint: false, // ничего не удаляет и не перезаписывает
        idempotentHint: true,   // повторный вызов даёт тот же результат
        openWorldHint: false,   // в интернет и чужие системы не ходит
      },
    },
    async () => textResult(getHouseholdOverview()), // при вызове отдаём сводку; аргументов у инструмента нет
  );
}