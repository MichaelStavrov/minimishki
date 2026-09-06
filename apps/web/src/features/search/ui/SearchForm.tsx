import { useId } from 'react';

import { Button, Input } from '@/shared/ui';

type SearchFormProps = {
  defaultValue?: string;
  className?: string;
};

/** GET-форма: работает до гидратации и остаётся доступной без JavaScript. */
export function SearchForm({ defaultValue = '', className }: SearchFormProps) {
  const inputId = useId();

  return (
    <form action="/search" className={className} role="search">
      <label className="sr-only" htmlFor={inputId}>
        Поиск по сайту
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          name="query"
          type="search"
          defaultValue={defaultValue}
          minLength={2}
          maxLength={100}
          placeholder="Найти занятие или новость"
          required
          className="min-w-0 bg-cream-50"
        />
        <Button type="submit" variant="outline" className="shrink-0">
          Найти
        </Button>
      </div>
    </form>
  );
}
