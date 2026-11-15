import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';           // класс самого сервера из SDK
import { registerHouseholdOverviewTool } from './tools/household-overview.js'; // наш первый инструмент
import { registerHomeInventoryTool } from './tools/home-inventory.js';
import { registerHouseholdExpensesTool } from './tools/household-expenses.js';
import { registerUpcomingPaymentsTool } from './tools/upcoming-payments.js';
import { registerHouseholdTasksTool } from './tools/household-tasks.js';

export function createServer(): McpServer {                                 // собираем сервер Вход: ничего. Выход: готовый MCP-сервер с инструментами
  const server = new McpServer({ name: 'homemind-mcp', version: '0.1.0' }); // имя и версия, их увидит клиент
  registerHouseholdOverviewTool(server);                                    // подключаем инструмент сводки
  registerHomeInventoryTool(server);                                        // поиск имущества
  registerHouseholdExpensesTool(server);                                    // расходы
  registerUpcomingPaymentsTool(server);                                     // платежи
  registerHouseholdTasksTool(server);                                       // задачи
  return server;                                                            // отдаём готовый сервер
}