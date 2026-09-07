import type { LeadStatus } from '@minimishki/shared';

import { cn } from '@/shared/lib/cn';

import { leadStatusLabels } from '../model/lead-status';

const statusStyles: Record<LeadStatus, string> = {
  NEW: 'bg-coral-100 text-danger-600',
  IN_PROGRESS: 'bg-honey-100 text-ink',
  CONFIRMED: 'bg-teal-100 text-teal-700',
  REJECTED: 'bg-cream-200 text-muted-foreground',
};

type Props = {
  status: LeadStatus;
};

export function LeadStatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-black tracking-wide',
        statusStyles[status],
      )}
    >
      {leadStatusLabels[status]}
    </span>
  );
}
