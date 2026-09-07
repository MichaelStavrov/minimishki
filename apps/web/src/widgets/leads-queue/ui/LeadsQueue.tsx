'use client';

import { useEffect, useState } from 'react';
import type { LeadDto, LeadStatus } from '@minimishki/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { LeadStatusControl } from '@/features/change-lead-status';

import {
  getAdminLead,
  getAdminLeads,
  LeadStatusBadge,
  leadStatusLabels,
  leadStatusOptions,
} from '@/entities/lead';

import { ApiError } from '@/shared/api';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from '@/shared/ui';

const PAGE_SIZE = 20;

type Filters = {
  search: string;
  status: LeadStatus | '';
};

const initialFilters: Filters = { search: '', status: '' };

export function LeadsQueue() {
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchInput.trim() }));
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const leadsQuery = useQuery({
    queryKey: ['leads', { ...filters, page }],
    queryFn: () =>
      getAdminLeads({
        page,
        pageSize: PAGE_SIZE,
        search: filters.search || undefined,
        status: filters.status || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const selectedLeadQuery = useQuery({
    queryKey: ['leads', 'detail', selectedLeadId],
    queryFn: () => getAdminLead(selectedLeadId as string),
    enabled: selectedLeadId !== null,
  });

  const totalPages = leadsQuery.data
    ? Math.max(1, Math.ceil(leadsQuery.data.total / PAGE_SIZE))
    : 1;
  const isFirstPage = page === 1;
  const isLastPage = page >= totalPages;

  function updateStatusFilter(value: LeadStatus | '') {
    setFilters((current) => ({ ...current, status: value }));
    setPage(1);
  }

  return (
    <section>
      <div className="flex flex-col gap-6 border-b border-cream-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">Админка</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-teal-700 sm:text-5xl">
            Очередь заявок
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Контакты родителей и текущий этап обработки — всё, что нужно для быстрого ответа.
          </p>
        </div>
        <div className="rounded-2xl bg-teal-700 px-5 py-4 text-cream-50 shadow-soft">
          <p className="text-xs font-black tracking-[0.12em] text-teal-100 uppercase">Найдено</p>
          <p className="mt-1 text-3xl font-black tabular-nums">{leadsQuery.data?.total ?? '—'}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 rounded-2xl border border-cream-200 bg-background p-4 shadow-soft sm:grid-cols-[minmax(0,1fr)_14rem] sm:p-5">
        <label className="grid gap-2 text-sm font-extrabold text-teal-700" htmlFor="lead-search">
          Поиск
          <Input
            id="lead-search"
            placeholder="Имя, ребёнок или телефон"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>
        <label
          className="grid gap-2 text-sm font-extrabold text-teal-700"
          htmlFor="lead-status-filter"
        >
          Статус
          <Select
            id="lead-status-filter"
            value={filters.status}
            onChange={(event) => updateStatusFilter(event.target.value as LeadStatus | '')}
          >
            <option value="">Все статусы</option>
            {leadStatusOptions.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabels[status]}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {leadsQuery.isError ? (
        <QueueError error={leadsQuery.error} onRetry={() => void leadsQuery.refetch()} />
      ) : null}

      {!leadsQuery.isError ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-cream-200 bg-background shadow-soft">
          <div className="hidden grid-cols-[minmax(11rem,1.2fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_9rem_10rem] gap-4 border-b border-cream-200 bg-cream-100 px-6 py-3 text-xs font-black tracking-[0.1em] text-teal-700 uppercase lg:grid">
            <span>Родитель</span>
            <span>Ребёнок</span>
            <span>Направление</span>
            <span>Поступила</span>
            <span>Статус</span>
          </div>
          {leadsQuery.isLoading ? <LoadingRows /> : null}
          {leadsQuery.data?.items.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onOpen={() => setSelectedLeadId(lead.id)} />
          ))}
          {leadsQuery.data?.items.length === 0 ? <EmptyState /> : null}
        </div>
      ) : null}

      {leadsQuery.data && leadsQuery.data.total > 0 ? (
        <nav className="mt-6 flex items-center justify-between gap-4" aria-label="Пагинация заявок">
          <p className="text-sm font-bold text-muted-foreground">
            Страница {page} из {totalPages}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={isFirstPage}
              onClick={() => setPage((value) => value - 1)}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastPage}
              onClick={() => setPage((value) => value + 1)}
            >
              Далее
            </Button>
          </div>
        </nav>
      ) : null}

      <LeadDialog
        lead={selectedLeadQuery.data}
        error={selectedLeadQuery.error}
        isLoading={selectedLeadQuery.isLoading}
        onOpenChange={(open) => !open && setSelectedLeadId(null)}
        open={selectedLeadId !== null}
      />
    </section>
  );
}

function LeadRow({ lead, onOpen }: { lead: LeadDto; onOpen: () => void }) {
  return (
    <article className="grid gap-4 border-b border-cream-200 px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_9rem_10rem] lg:items-center lg:gap-4 lg:px-6">
      <button className="min-w-0 text-left" type="button" onClick={onOpen}>
        <p className="truncate font-black text-teal-700 underline-offset-4 hover:underline">
          {lead.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{formatPhone(lead.phone)}</p>
      </button>
      <DetailCell
        label="Ребёнок"
        value={
          lead.childName
            ? `${lead.childName}${lead.childAge === null ? '' : `, ${lead.childAge} ${ageWord(lead.childAge)}`}`
            : 'Не указано'
        }
      />
      <DetailCell label="Направление" value={lead.serviceId ? 'Выбрано' : 'Не выбрано'} />
      <DetailCell label="Поступила" value={formatDate(lead.createdAt)} />
      <div className="flex items-center gap-3 lg:block">
        <div className="lg:hidden">
          <LeadStatusBadge status={lead.status} />
        </div>
        <LeadStatusControl leadId={lead.id} status={lead.status} />
      </div>
    </article>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-black tracking-[0.1em] text-muted-foreground uppercase lg:hidden">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-ink lg:mt-0">{value}</p>
    </div>
  );
}

function LeadDialog({
  lead,
  error,
  isLoading,
  onOpenChange,
  open,
}: {
  lead: LeadDto | undefined;
  error: Error | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {isLoading ? (
          <p className="py-10 text-center font-bold text-muted-foreground">Загружаем заявку…</p>
        ) : null}
        {error ? (
          <p className="rounded-xl bg-danger-100 p-4 text-sm font-bold text-danger-600">
            Не удалось загрузить заявку. Закройте окно и попробуйте ещё раз.
          </p>
        ) : null}
        {lead ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <LeadStatusBadge status={lead.status} />
                <span className="text-sm font-bold text-muted-foreground">
                  {formatDate(lead.createdAt)}
                </span>
              </div>
              <DialogTitle>{lead.name}</DialogTitle>
              <DialogDescription>
                Контактные данные доступны только сотрудникам центра.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 rounded-xl bg-cream-100 p-5 sm:grid-cols-2">
              <ContactItem label="Телефон" value={formatPhone(lead.phone)} />
              <ContactItem
                label="Ребёнок"
                value={
                  lead.childName
                    ? `${lead.childName}${lead.childAge === null ? '' : `, ${lead.childAge} ${ageWord(lead.childAge)}`}`
                    : 'Не указано'
                }
              />
              <ContactItem label="Направление" value={lead.service?.title ?? 'Не выбрано'} />
              <ContactItem
                label="Согласие"
                value={
                  lead.consentedAt
                    ? `Версия ${lead.consentVersion ?? 'не указана'}`
                    : 'Нет сведений'
                }
              />
            </div>
            {lead.comment ? (
              <div>
                <p className="text-sm font-extrabold text-teal-700">Комментарий родителя</p>
                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-ink">
                  {lead.comment}
                </p>
              </div>
            ) : null}
            <div className="grid gap-2">
              <label className="text-sm font-extrabold text-teal-700">Статус</label>
              <LeadStatusControl leadId={lead.id} status={lead.status} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black tracking-[0.1em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-bold text-ink">{value}</p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-4 p-6" aria-label="Загружаем заявки">
      <div className="h-16 animate-pulse rounded-xl bg-cream-100" />
      <div className="h-16 animate-pulse rounded-xl bg-cream-100" />
      <div className="h-16 animate-pulse rounded-xl bg-cream-100" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-xl font-black text-teal-700">Заявок пока нет</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Измените фильтры или вернитесь позже — новые обращения появятся здесь.
      </p>
    </div>
  );
}

function QueueError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const message =
    error instanceof ApiError && error.statusCode === 401
      ? 'Сессия закончилась. Войдите в админку заново.'
      : 'Не удалось загрузить очередь. Проверьте соединение и попробуйте ещё раз.';
  return (
    <div
      className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-danger-100 p-5 text-danger-600"
      role="alert"
    >
      <p className="font-bold">{message}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  }).format(new Date(value));
}

function formatPhone(value: string): string {
  return value.replace(/(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
}

function ageWord(age: number): string {
  const remainder = age % 100;
  if (remainder >= 11 && remainder <= 14) return 'лет';
  if (age % 10 === 1) return 'год';
  if (age % 10 >= 2 && age % 10 <= 4) return 'года';
  return 'лет';
}
