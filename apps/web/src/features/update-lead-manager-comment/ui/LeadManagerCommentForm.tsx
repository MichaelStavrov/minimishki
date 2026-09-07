'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui';

import { updateLeadManagerComment } from '../api/update-lead-manager-comment';

type Props = {
  leadId: string;
  managerComment: string | null;
  onDirtyChange: (isDirty: boolean) => void;
};

export function LeadManagerCommentForm({ leadId, managerComment, onDirtyChange }: Props) {
  const [value, setValue] = useState(managerComment ?? '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => updateLeadManagerComment(leadId, value.trim() || null),
    onSuccess: (lead) => {
      queryClient.setQueryData(['leads', 'detail', leadId], lead);
      void queryClient.invalidateQueries({ queryKey: ['leads'] });
      onDirtyChange(false);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <label
        className="text-sm font-extrabold text-teal-700"
        htmlFor={`lead-manager-comment-${leadId}`}
      >
        Внутренний комментарий
      </label>
      <textarea
        id={`lead-manager-comment-${leadId}`}
        className="flex min-h-28 w-full resize-y rounded-xl border-2 border-input bg-background px-4 py-3 text-base text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={mutation.isPending}
        maxLength={5000}
        placeholder="Заметка для сотрудников: о чём договорились, когда перезвонить…"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          onDirtyChange(nextValue.trim() !== (managerComment ?? '').trim());
        }}
      />
      {mutation.isError ? (
        <p className="text-sm font-bold text-danger-600" role="alert">
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : 'Не удалось сохранить комментарий. Попробуйте ещё раз.'}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <Button size="sm" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Сохраняем…' : 'Сохранить комментарий'}
        </Button>
        {mutation.isSuccess ? (
          <p className="text-sm font-bold text-teal-700" role="status">
            Сохранено
          </p>
        ) : null}
      </div>
    </form>
  );
}
