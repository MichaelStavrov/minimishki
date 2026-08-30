type ApiUrlVariable = 'API_URL' | 'NEXT_PUBLIC_API_URL';

/** Проверяет адрес API до создания первого HTTP-запроса. */
export function getApiUrl(value: string | undefined, variableName: ApiUrlVariable): string {
  if (!value) {
    throw new Error(`${variableName} не задана. Добавьте переменную в apps/web/.env.local.`);
  }

  if (value !== value.trim()) {
    throw new Error(`${variableName} не должна содержать пробелы в начале или конце.`);
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} должна быть абсолютным HTTP(S)-адресом API.`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${variableName} должна использовать протокол HTTP или HTTPS.`);
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      `${variableName} не должна содержать данные доступа, query-параметры или hash.`,
    );
  }

  return url.toString().replace(/\/$/, '');
}
