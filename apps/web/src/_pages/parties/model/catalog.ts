// Символ подчёркивания отделяет якоря интерфейса от slug категорий из каталога.
export const partyLeadId = 'party_lead';

export function normalizeAgeLabel(label: string | null) {
  return label?.trim().replace(/^возраст\s*[-–—:]\s*/iu, '') ?? '';
}

export function parseAge(label: string | null) {
  const text = normalizeAgeLabel(label);
  if (/^(?:для\s+)?(?:любого\s+возраста|любой\s+возраст)$/iu.test(text)) {
    return { min: 0, max: Infinity };
  }

  const match =
    /^(?<from>от\s+)?(?<min>\d+)\s*(?:(?<plus>\+)|(?:[–—-]|до)\s*(?<max>\d+))?\s*(?:год|года|лет)?$/iu.exec(
      text,
    )?.groups;
  if (!match) return null;

  const min = Number(match.min);
  const max = match.max ? Number(match.max) : match.from || match.plus ? Infinity : min;
  return Number.isSafeInteger(min) && (max === Infinity || Number.isSafeInteger(max)) && min <= max
    ? { min, max }
    : null;
}
