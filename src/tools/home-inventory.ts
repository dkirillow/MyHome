import { z } from 'zod';                                                                    // библиотека проверки аргументов
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';                   // тип сервера
import { inventory, INVENTORY_CATEGORIES, type InventoryItem } from '../data/mock-data.js'; // данные и список категорий
import { textResult } from './result.js';                                                   // готовый ответ

// Вход: query, category, room — все необязательные. Выход: список подходящих предметов.
export function searchHomeInventory(args: { query?: string; category?: InventoryItem['category']; room?: string }) {
  const query = args.query?.trim().toLowerCase();                        // убираем пробелы, делаем маленькие буквы
  const room = args.room?.trim().toLowerCase();                          // то же для комнаты
  const items = inventory.filter((item) => {
    if (query && !item.name.toLowerCase().includes(query)) return false; // название не подходит — пропускаем
    if (args.category && item.category !== args.category) return false;  // категория не та — пропускаем
    if (room && item.room.toLowerCase() !== room) return false;          // комната не та — пропускаем
    return true;                                                         // предмет прошёл все фильтры
  });
  return { count: items.length, items };                                 // пусто — это нормальный ответ: count 0 и пустой список
}

// Вход: server. Выход: ничего, инструмент добавлен на сервер.
export function registerHomeInventoryTool(server: McpServer) {
  server.registerTool(
    'search_home_inventory',
    {
      title: 'Поиск имущества и техники',
      description:
        'Ищет предметы дома (техника, мебель, электроника) по названию, категории или комнате и возвращает название, комнату, дату покупки, цену и дату ближайшего обслуживания. ' + // что делает
        'Вызывай, когда спрашивают, что есть дома, где стоит вещь, сколько она стоила или когда её обслуживать. ' +                                                                  // когда звать
        'Не показывает расходы и платежи (для этого есть get_household_expenses и get_upcoming_payments) и ничего не меняет.',                                                       // чего не делает
      inputSchema: {
        query: z.string().optional().describe('Часть названия предмета, например «холодильник». Без неё вернутся все предметы'),                                             // подсказка модели
        category: z.enum(INVENTORY_CATEGORIES).optional().describe('Категория: appliance — бытовая техника, electronics — электроника, furniture — мебель, other — прочее'), // только из списка
        room: z.string().optional().describe('Комната целиком, например «кухня» или «гостиная»'),                                                                            // точное совпадение
      },
      annotations: { readOnlyHint: true, 
                     destructiveHint: false, 
                     idempotentHint: true, 
                     openWorldHint: false },               // только читает
    },
    async (args) => textResult(searchHomeInventory(args)), // вызываем чистую функцию и оборачиваем ответ
  );
}