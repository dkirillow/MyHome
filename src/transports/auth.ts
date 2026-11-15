import { timingSafeEqual } from 'node:crypto';                  // безопасное сравнение строк
import type { Request, Response, NextFunction } from 'express'; // типы express

// Вход: две строки. Выход: true, если строки совпадают.
function safeEqual(a: string, b: string): boolean {
 const bufA = Buffer.from(a);                  // в байты
 const bufB = Buffer.from(b);                  // в байты
if (bufA.length !== bufB.length) return false; // разная длина — точно не совпадают
return timingSafeEqual(bufA, bufB);            // сравнение за постоянное время
}

// Вход: запрос, ответ, next. Выход: пускает дальше или отвечает 401.
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
const expected = process.env.MCP_API_KEY;                    // ключ из окружения
    if (!expected) {                                         // ключ не задан — сервер настроен неверно
console.error('homemind-mcp: MCP_API_KEY не задан');         // в лог без значения
res.status(500).json({ error: 'Server is not configured' }); // не пускаем без ключа
return;}

const header = req.header('authorization') ?? '';                                // заголовок из запроса
const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length): ''; // берём часть после Bearer
 
if (!safeEqual(token, expected)) {                                              // ключ не совпал
    res.status(401).json({ error: 'Unauthorized' });                             // одинаковый ответ без подробностей
return;
}
next();                                                                          // ключ верный — идём дальше
}