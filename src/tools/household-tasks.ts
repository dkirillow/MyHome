
import { z } from 'zod';                                                                         // проверка аргументов
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';                        // тип сервера
import { tasks, DEMO_TODAY, type HouseholdTask, type TaskPriority } from '../data/mock-data.js'; // данные
import { textResult, errorResult } from './result.js';                                           // ответы

// Вход: title, description, dueDate, priority. Выход: созданная задача или ошибка с именем поля.
export function createHouseholdTask(args: { title: string; description?: string; dueDate?: string; priority: TaskPriority }) {
  const title = args.title.trim();                                           // убираем пробелы по краям
  if (title.length === 0) 
    return { error: 'title: название задачи не должно быть пустым' };        // пустое название
  if (args.dueDate !== undefined) {
    const date = new Date(`${args.dueDate}T00:00:00Z`);                      // пробуем собрать дату
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.dueDate) 
        || Number.isNaN(date.getTime()) 
        || date.toISOString().slice(0, 10) !== args.dueDate) {
      return { error: 'dueDate: нужна реальная дата в формате ГГГГ-ММ-ДД' }; // неверная дата
    }
    if (args.dueDate < DEMO_TODAY) 
        return { error: `dueDate: срок уже прошёл, сегодня ${DEMO_TODAY}` }; // срок в прошлом
  }
  const task: HouseholdTask = {
    id: `task-${tasks.length + 1}`,              // следующий номер: task-4, task-5 ...
    title,                                       // название
    description: args.description?.trim() ?? '', // без описания — пустая строка
    dueDate: args.dueDate ?? null,               // без срока — null
    priority: args.priority,                     // важность
    status: 'open',                              // новая задача всегда открыта
    createdAt: DEMO_TODAY,                       // дата создания — демо-«сегодня»
  };
  tasks.push(task);                              // добавляем в массив в памяти сервера
  return { created: task, 
           openTasksCount: tasks.filter((t) => t.status === 'open').length }; // возвращаем созданное
}

// Вход: server. Выход: ничего, инструмент добавлен на сервер.
export function registerHouseholdTasksTool(server: McpServer) {
  server.registerTool(
    'create_household_task',
    {
      title: 'Создать бытовую задачу',
      description:
        'Создаёт новую бытовую задачу (купить, починить, вызвать мастера) с названием, важностью и необязательным сроком. ' +                // что делает
        'Вызывай только когда пользователь явно просит записать, добавить или напомнить о задаче. ' +                                        // когда звать
        'Не удаляет и не меняет существующие задачи, не отправляет уведомления и не оплачивает платежи. Каждый вызов создаёт новую задачу.', // чего не делает
      inputSchema: {
        title: z.string().describe('Короткое название задачи, например «Купить фильтр для воды»'),                                                               // обязательно
        description: z.string().optional().describe('Подробности задачи. Можно не указывать'),                                                                   // необязательно
        dueDate: z.string().optional().describe('Срок выполнения, гггг-мм-дд. Если срока нет — не передавать'),                                                  // необязательно
        priority: z.enum(['low', 'normal', 'high']).default('normal').describe('Важность: low — низкая, normal — обычная, high — срочная. По умолчанию normal'), // по умолчанию normal
      },
      annotations: { readOnlyHint: false, 
                     destructiveHint: false, 
                     idempotentHint: false, 
                     openWorldHint: false }, // пишет, но не удаляет; повтор даст другой результат
    },
    async (args) => {
      const result = createHouseholdTask(args);                // создаём
      if (result.error !== undefined) return errorResult(result.error); // ошибка аргументов
      return textResult(result);                               // успех
    },
  );
}