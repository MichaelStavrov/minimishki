/**
 * Нормализует необязательный текст перед записью в PostgreSQL.
 *
 * В базе отсутствие значения всегда представлено как null, а не как
 * undefined, пустая строка или строка из пробелов.
 */
export function normalizeNullableText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}
