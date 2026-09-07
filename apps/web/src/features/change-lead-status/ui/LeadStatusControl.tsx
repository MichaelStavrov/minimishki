'use client';

import type { LeadStatus } from '@minimishki/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { leadStatusLabels, leadStatusOptions } from '@/entities/lead';

import { ApiError } from '@/shared/api';
import { Select } from '@/shared/ui';

import { changeLeadStatus } from '../api/change-lead-status';

type Props = {
  leadId: string;
  status: LeadStatus;
};

export function LeadStatusControl({ leadId, status }: Props) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (nextStatus: LeadStatus) => changeLeadStatus(leadId, nextStatus),
    onSuccess: (lead) => {
      queryClient.setQueryData(['leads', 'detail', leadId], lead);
      void queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return (
    <div>
      <Select
        aria-label="Статус заявки"
        className="h-9 min-w-37 py-1 text-sm"
        disabled={mutation.isPending}
        value={status}
        onChange={(event) => mutation.mutate(event.target.value as LeadStatus)}
      >
        {leadStatusOptions.map((option) => (
          <option key={option} value={option}>
            {leadStatusLabels[option]}
          </option>
        ))}
      </Select>
      {mutation.isError ? (
        <p className="mt-1 text-xs font-bold text-danger-600" role="alert">
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : 'Не удалось изменить статус. Попробуйте ещё раз.'}
        </p>
      ) : null}
    </div>
  );
}
