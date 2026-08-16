/**
 * Перевод объектов Prisma в форму ответа API.
 *
 * Решение проекта: даты в DTO — строки ISO 8601, а не Date. Prisma отдаёт Date,
 * поэтому между запросом к базе и возвратом из сервиса нужен явный шаг. Без него
 * в каждом сервисе завелось бы `as unknown as XxxDto`, а это приведение отключает
 * проверку объекта целиком, а не только по полю с датой.
 */

/**
 * Форма значения после serialize: Date заменён на string на любой глубине.
 * Union распределяется сам, поэтому `Date | null` превращается в `string | null`.
 */
export type Serialized<T> = T extends Date
  ? string
  : T extends readonly (infer U)[]
    ? Serialized<U>[]
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

/**
 * Возвращает копию значения, где все Date заменены на ISO-строки.
 *
 * Для HTTP-ответа рантайм-часть избыточна — JSON.stringify зовёт Date.toJSON() сам.
 * Смысл в другом: после вызова объект действительно соответствует объявленному DTO,
 * а не только после отправки по сети.
 */
export function serialize<T>(value: T): Serialized<T> {
  // Единственное приведение типа во всём проекте. Рекурсия работает с unknown
  // и вывести Serialized<T> сама не может, но повторяет его правила один в один.
  return transform(value) as Serialized<T>;
}

function transform(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    // Приведение к unknown[]: Array.isArray сужает до any[], а any в аргументе
    // отключил бы type-aware правила линтера на весь вызов.
    return (value as unknown[]).map(transform);
  }

  // typeof null === 'object' — без явной проверки null ушёл бы в обход полей.
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, transform(item)]),
    );
  }

  return value;
}
