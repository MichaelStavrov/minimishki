/**
 * Преобразует строковые boolean query-параметры после HTTP-запроса.
 *
 * Остальные значения возвращаются без изменений, чтобы class-validator
 * отклонил некорректные варианты вроде "1", "yes" или пустой строки.
 */
export function parseBooleanQuery(value: unknown): unknown {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}

/**
 * Удаляет пробелы по краям строкового query-параметра.
 *
 * Значения других типов не преобразуются: их корректность проверяет DTO.
 */
export function trimQueryString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
