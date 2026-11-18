'use client';

import { useState, type ReactNode } from 'react';

import { Select } from '@/shared/ui';

import { parseAge } from '../model/catalog';

type ProgramCard = { id: string; ageLabel: string | null; content: ReactNode };

export function PartyAgeFilter({ cards }: { cards: ProgramCard[] }) {
  const [age, setAge] = useState('');
  const toConfirm: ProgramCard[] = [];
  const selectedAge = Number(age);
  const matching =
    age === ''
      ? cards
      : cards.filter((card) => {
          const range = parseAge(card.ageLabel);
          if (range === null) {
            toConfirm.push(card);
            return false;
          }
          return range.min <= selectedAge && selectedAge <= range.max;
        });

  return (
    <>
      <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-3">
        <div className="grid w-full max-w-56 gap-2">
          <label htmlFor="party_age" className="text-sm font-extrabold text-teal-700">
            Возраст ребёнка
          </label>
          <Select id="party_age" value={age} onChange={(event) => setAge(event.target.value)}>
            <option value="">Любой возраст</option>
            <option value="0">Меньше года</option>
            {Array.from({ length: 18 }, (_, index) => index + 1).map((years) => (
              <option key={years} value={years}>
                {years} {ageWord(years)}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-sm font-semibold text-teal-700" role="status">
          {age === ''
            ? `Всего программ: ${matching.length}`
            : `Подходит по возрасту: ${matching.length}`}
        </p>
      </div>
      {matching.length > 0 ? (
        <ProgramGrid cards={matching} />
      ) : (
        <p className="mt-4 text-teal-700">Для этого возраста нет программ с указанным возрастом.</p>
      )}
      {toConfirm.length > 0 ? (
        <details className="mt-5 text-teal-700">
          <summary className="w-fit cursor-pointer py-2 font-bold underline decoration-teal-600/35 underline-offset-4">
            Возраст нужно уточнить ({toConfirm.length})
          </summary>
          <ProgramGrid cards={toConfirm} />
        </details>
      ) : null}
    </>
  );
}

function ProgramGrid({ cards }: { cards: ProgramCard[] }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ id, content }) => (
        <div key={id} className="min-w-0">
          {content}
        </div>
      ))}
    </div>
  );
}

function ageWord(years: number) {
  if (years === 1) return 'год';
  return years >= 2 && years <= 4 ? 'года' : 'лет';
}
