export type QueryParamValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryParamValue | readonly QueryParamValue[]>;

/** Добавляет параметры запроса без ручной конкатенации URL-строк. */
export function appendQueryParams(url: URL, query: QueryParams): void {
  for (const [key, value] of Object.entries(query)) {
    if (isQueryParamList(value)) {
      for (const item of value) {
        appendQueryParam(url.searchParams, key, item);
      }

      continue;
    }

    appendQueryParam(url.searchParams, key, value);
  }
}

function isQueryParamList(
  value: QueryParamValue | readonly QueryParamValue[],
): value is readonly QueryParamValue[] {
  return Array.isArray(value);
}

function appendQueryParam(params: URLSearchParams, key: string, value: QueryParamValue): void {
  if (value === null || value === undefined) {
    return;
  }

  params.append(key, String(value));
}
