import express from 'express'; // минимальный веб-сервер
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'; // HTTP-транспорт MCP
import { createServer } from '../server.js'; // наш сервер с инструментами

const app = express(); // создаём приложение
app.use(express.json()); // читаем JSON в теле запроса

// Проверка «жив ли сервер». Вход: запрос. Выход: {status: 'ok'}.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' }); // просто отвечаем, что мы живы
});

// Главный адрес MCP. Вход: JSON-RPC в теле POST. Выход: JSON-RPC ответ.
app.post('/mcp', async (req, res) => {
  try {
    const server = createServer(); // новый сервер на каждый запрос
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }); // stateless: без сессий
    res.on('close', () => {   // когда запрос закончился
      void transport.close(); // закрываем транспорт
      void server.close();    // и сервер
    });
    await server.connect(transport);                   // соединяем
    await transport.handleRequest(req, res, req.body); // обрабатываем запрос
  } catch (error) {
    console.error('homemind-mcp: ошибка в /mcp', error instanceof Error ? error.message : 'unknown');                                        // в лог только текст ошибки
    if (!res.headersSent) res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Внутренняя ошибка сервера' }, id: null }); // безопасное сообщение
  }
});

// GET и DELETE в stateless-режиме не нужны. Выход: 405.
const methodNotAllowed = (_req: express.Request, res: express.Response) => {
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null }); // отвечаем «нельзя»
};
app.get('/mcp', methodNotAllowed); // запрещаем GET
app.delete('/mcp', methodNotAllowed); // запрещаем DELETE

const port = Number(process.env.PORT ?? 3000); // порт берём из окружения, локально 3000
app.listen(port, () => {
  console.error(`homemind-mcp: HTTP-сервер запущен на порту ${port}`); // лог без секретов
});