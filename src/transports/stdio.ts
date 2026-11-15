import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'; // связь через стандартный ввод и вывод
import { createServer } from '../server.js'; // наш сервер

const server = createServer();                         // собираем сервер
const transport = new StdioServerTransport();          // создаём канал связи через консоль
await server.connect(transport);                       // подключаем сервер к каналу, с этого момента он слушает
console.error('homemind-mcp: сервер запущен (stdio)'); // лог пишем только в stderr, stdout занят протоколом