export function textResult(data: unknown) { // оборачиваем данные в ответ MCP Вход: любые данные. Выход: ответ инструмента с этими данными текстом
  return { content: [{ type: 'text' as const, 
                       text: JSON.stringify(data, null, 2) }] }; // превращаем данные в читаемый JSON-текст
}

export function errorResult(message: string) {          // Вход: message — текст ошибки для модели. Выход: ответ MCP с isError: true.
  return {
    isError: true,                                      // говорим клиенту: это ошибка, а не обычный ответ
    content: [{ type: 'text' as const, text: message }],// текст, который прочитает модель
  };
}