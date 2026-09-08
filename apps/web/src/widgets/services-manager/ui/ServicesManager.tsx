'use client';
import { useState, type FormEvent } from 'react';
import type {
  AgeMode,
  DayOfWeek,
  PriceType,
  ServiceDto,
  ServiceOfferDto,
  ServiceOfferGroupDto,
  ServiceScheduleDto,
  TeacherDto,
} from '@minimishki/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  archiveService,
  createOffer,
  createOfferGroup,
  createSchedule,
  createService,
  getAdminService,
  getAdminServices,
  getAdminTeachers,
  removeOffer,
  removeOfferGroup,
  removeSchedule,
  restoreService,
  updateOffer,
  updateOfferGroup,
  updateSchedule,
  updateService,
  type OfferGroupValues,
  type OfferValues,
  type ScheduleValues,
  type ServiceValues,
} from '@/entities/service';
import { uploadImage } from '@/shared/api';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ImageUploadField,
  Input,
} from '@/shared/ui';

const blank = (): ServiceValues => ({
  slug: '',
  title: '',
  summary: null,
  contentHtml: '<p></p>',
  ageFromMonths: null,
  ageToMonths: null,
  ageNote: null,
  coverUrl: null,
  seoTitle: null,
  seoDescription: null,
  isPublished: false,
  sortOrder: 0,
  teacherIds: [],
});
const text = (v: string) => v.trim() || null;
const num = (v: string) => (v === '' ? null : Number(v));
const amount = (v: string) => (v === '' ? null : Math.round(Number(v) * 100));
const area =
  'min-h-24 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100';
const weekdays: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Пн' },
  { value: 'TUESDAY', label: 'Вт' },
  { value: 'WEDNESDAY', label: 'Ср' },
  { value: 'THURSDAY', label: 'Чт' },
  { value: 'FRIDAY', label: 'Пт' },
  { value: 'SATURDAY', label: 'Сб' },
  { value: 'SUNDAY', label: 'Вс' },
];

export function ServicesManager() {
  const [selected, setSelected] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [search, setSearch] = useState('');
  const [archived, setArchived] = useState(false);
  const [reorderError, setReorderError] = useState('');
  const list = useQuery({
    queryKey: ['admin-services', search, archived],
    queryFn: () =>
      getAdminServices({
        page: 1,
        pageSize: 100,
        search: search || undefined,
        includeArchived: archived,
      }),
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const canSort = !search && !archived;
  async function reorder(event: DragEndEvent) {
    const items = list.data?.items;
    if (!items || event.active.id === event.over?.id || !event.over) return;
    const oldIndex = items.findIndex((item) => item.id === event.active.id);
    const newIndex = items.findIndex((item) => item.id === event.over?.id);
    const ordered = arrayMove(items, oldIndex, newIndex);
    setReorderError('');
    qc.setQueryData(['admin-services', search, archived], { ...list.data!, items: ordered });
    try {
      await Promise.all(
        ordered.map((item, index) => updateService(item.id, { sortOrder: (index + 1) * 10 })),
      );
      await list.refetch();
    } catch {
      await list.refetch();
      setReorderError('Не удалось сохранить новый порядок. Список возвращён к данным сервера.');
    }
  }
  const qc = useQueryClient();
  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-cream-200 pb-8">
        <div>
          <p className="text-sm font-black tracking-[.14em] text-coral-400 uppercase">Админка</p>
          <h1 className="mt-2 text-4xl font-black text-teal-700">Направления</h1>
          <p className="mt-2 text-muted-foreground">Программы, тарифы, расписание и педагоги.</p>
        </div>
        <Button onClick={() => setCreated(true)}>Добавить направление</Button>
      </header>
      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-cream-200 bg-background p-4">
        <Input
          className="max-w-md"
          value={search}
          placeholder="Поиск по названию или slug"
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm font-bold text-teal-700">
          <input
            className="size-4 accent-teal-600"
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />
          Показать архив
        </label>
      </div>
      {canSort ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Перетаскивайте карточки за значок ⠿ — порядок сохранится автоматически.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Очистите поиск и скройте архив, чтобы менять порядок перетаскиванием.
        </p>
      )}
      {list.isLoading ? <p className="mt-6">Загружаем…</p> : null}
      {list.isError ? (
        <p className="mt-6 rounded-xl bg-danger-100 p-4 font-bold text-danger-600">
          Не удалось загрузить направления.
        </p>
      ) : null}
      {reorderError ? (
        <p className="mt-4 rounded-xl bg-danger-100 p-4 font-bold text-danger-600">
          {reorderError}
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          void reorder(event);
        }}
      >
        <SortableContext
          items={list.data?.items.map((item) => item.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-6 grid gap-3">
            {list.data?.items.map((s) => (
              <SortableRow
                key={s.id}
                service={s}
                disabled={!canSort}
                open={() => setSelected(s.id)}
              />
            ))}
            {list.data?.items.length === 0 ? (
              <p className="rounded-xl bg-cream-100 p-6 text-muted-foreground">
                Направлений не найдено.
              </p>
            ) : null}
          </div>
        </SortableContext>
      </DndContext>
      <Editor open={created} close={() => setCreated(false)} />
      <Editor id={selected} open={selected !== null} close={() => setSelected(null)} />
    </section>
  );
}

function SortableRow({
  service,
  disabled,
  open,
}: {
  service: ServiceDto;
  disabled: boolean;
  open: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: service.id,
    disabled,
  });
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="grid grid-cols-[auto_1fr_auto] gap-3 rounded-2xl border border-cream-200 bg-background p-5"
    >
      <button
        type="button"
        aria-label={`Переместить ${service.title}`}
        className="cursor-grab text-xl text-teal-700 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <button type="button" className="min-w-0 text-left" onClick={open}>
        <b className="block text-teal-700">{service.title}</b>
        <span className="text-sm text-muted-foreground">/{service.slug}</span>
      </button>
      <span className="text-sm font-bold">
        {service.archivedAt ? 'Архив' : service.isPublished ? 'Опубликовано' : 'Черновик'}
      </span>
    </article>
  );
}

function Editor({ id, open, close }: { id?: string | null; open: boolean; close: () => void }) {
  const qc = useQueryClient();
  const detail = useQuery({
    queryKey: ['admin-services', 'detail', id],
    queryFn: () => getAdminService(id!),
    enabled: !!id && open,
  });
  const teachers = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: getAdminTeachers,
    enabled: open,
  });
  const [error, setError] = useState('');
  const saved = async (values: ServiceValues) => {
    try {
      const result = id ? await updateService(id, values) : await createService(values);
      await qc.invalidateQueries({ queryKey: ['admin-services'] });
      qc.setQueryData(['admin-services', 'detail', result.id], result);
      if (!id) close();
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить данные.');
    }
  };
  const refresh = async () => {
    if (id) qc.setQueryData(['admin-services', 'detail', id], await getAdminService(id));
    await qc.invalidateQueries({ queryKey: ['admin-services'] });
  };
  const service = detail.data;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{id ? 'Редактор направления' : 'Новое направление'}</DialogTitle>
          <DialogDescription>
            Основные данные сохраняются отдельно; ниже доступны тарифы и расписание.
          </DialogDescription>
        </DialogHeader>
        {id && detail.isLoading ? <p>Загружаем…</p> : null}
        {(!id || service) && !teachers.isLoading ? (
          <MainForm service={service} teachers={teachers.data || []} save={saved} />
        ) : null}
        {service ? <Children service={service} refresh={refresh} /> : null}
        {service ? (
          <div className="flex justify-between border-t pt-5">
            {service.archivedAt ? (
              <Button
                variant="outline"
                onClick={() => {
                  void (async () => {
                    try {
                      await restoreService(service.id);
                      await refresh();
                    } catch (reason) {
                      setError(
                        reason instanceof Error
                          ? reason.message
                          : 'Не удалось восстановить направление.',
                      );
                    }
                  })();
                }}
              >
                Восстановить
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Архивировать направление?')) {
                    void (async () => {
                      try {
                        await archiveService(service.id);
                        close();
                        await qc.invalidateQueries({ queryKey: ['admin-services'] });
                      } catch (reason) {
                        setError(
                          reason instanceof Error
                            ? reason.message
                            : 'Не удалось архивировать направление.',
                        );
                      }
                    })();
                  }
                }}
              >
                Архивировать
              </Button>
            )}
            <Button variant="outline" onClick={close}>
              Закрыть
            </Button>
          </div>
        ) : null}
        {error ? <p className="rounded-xl bg-danger-100 p-3 text-danger-600">{error}</p> : null}
      </DialogContent>
    </Dialog>
  );
}

function MainForm({
  service,
  teachers,
  save,
}: {
  service?: ServiceDto;
  teachers: TeacherDto[];
  save: (v: ServiceValues) => Promise<void>;
}) {
  const [v, set] = useState<ServiceValues>(() =>
    service
      ? { ...blank(), ...service, teacherIds: service.teachers?.map((t) => t.id) || [] }
      : blank(),
  );
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const change = <K extends keyof ServiceValues>(k: K, value: ServiceValues[K]) =>
    set((x) => ({ ...x, [k]: value }));
  return (
    <form
      className="grid gap-5"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void (async () => {
          setUploading(true);
          try {
            const coverUrl = imageFile ? (await uploadImage(imageFile)).url : v.coverUrl;
            await save({ ...v, coverUrl });
          } finally {
            setUploading(false);
          }
        })();
      }}
    >
      <h2 className="font-black text-teal-700">Основные данные</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          Название
          <Input value={v.title} required onChange={(e) => change('title', e.target.value)} />
        </label>
        <label>
          Slug
          <Input
            value={v.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            onChange={(e) => change('slug', e.target.value)}
          />
        </label>
      </div>
      <label>
        Краткое описание
        <textarea
          className={area}
          value={v.summary || ''}
          onChange={(e) => change('summary', text(e.target.value))}
        />
      </label>
      <label>
        Содержимое (безопасный HTML)
        <textarea
          className={area}
          value={v.contentHtml}
          required
          onChange={(e) => change('contentHtml', e.target.value)}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          От, месяцев
          <Input
            type="number"
            value={v.ageFromMonths ?? ''}
            onChange={(e) => change('ageFromMonths', num(e.target.value))}
          />
        </label>
        <label>
          До, месяцев
          <Input
            type="number"
            value={v.ageToMonths ?? ''}
            onChange={(e) => change('ageToMonths', num(e.target.value))}
          />
        </label>
        <label>
          Порядок
          <Input
            type="number"
            value={v.sortOrder}
            onChange={(e) => change('sortOrder', Number(e.target.value))}
          />
        </label>
      </div>
      <ImageUploadField
        label="Обложка"
        placeholder="https://… или /uploads/cover.jpg"
        value={v.coverUrl ?? ''}
        onChange={(coverUrl) => change('coverUrl', text(coverUrl))}
        onFileChange={setImageFile}
      />
      <label className="font-bold">
        <input
          className="mr-2 size-4 accent-teal-600"
          type="checkbox"
          checked={v.isPublished}
          disabled={!!service?.archivedAt}
          onChange={(e) => change('isPublished', e.target.checked)}
        />
        Опубликовать
      </label>
      <fieldset>
        <legend className="font-black text-teal-700">Педагоги</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {teachers.map((t) => (
            <label key={t.id} className="rounded-xl bg-cream-100 p-3">
              <input
                className="mr-2 size-4 accent-teal-600"
                type="checkbox"
                checked={v.teacherIds.includes(t.id)}
                onChange={(e) =>
                  change(
                    'teacherIds',
                    e.target.checked
                      ? [...v.teacherIds, t.id]
                      : v.teacherIds.filter((x) => x !== t.id),
                  )
                }
              />
              {t.fullName}
            </label>
          ))}
        </div>
      </fieldset>
      <details>
        <summary className="cursor-pointer font-black text-teal-700">SEO</summary>
        <div className="mt-4 grid gap-4">
          <label>
            SEO-заголовок
            <Input
              value={v.seoTitle || ''}
              onChange={(e) => change('seoTitle', text(e.target.value))}
            />
          </label>
          <label>
            SEO-описание
            <textarea
              className={area}
              value={v.seoDescription || ''}
              onChange={(e) => change('seoDescription', text(e.target.value))}
            />
          </label>
        </div>
      </details>
      <Button type="submit" className="justify-self-start" disabled={uploading}>
        {service ? 'Сохранить' : 'Создать направление'}
      </Button>
    </form>
  );
}

function Children({ service, refresh }: { service: ServiceDto; refresh: () => Promise<void> }) {
  const [group, setGroup] = useState<ServiceOfferGroupDto | null>(null);
  const [offer, setOffer] = useState<{ groupId: string; offer?: ServiceOfferDto } | null>(null);
  const [schedule, setSchedule] = useState<ServiceScheduleDto | 'new' | null>(null);
  const [actionError, setActionError] = useState('');
  const run = (action: () => Promise<void>) => {
    setActionError('');
    void action().catch((reason: unknown) => {
      setActionError(reason instanceof Error ? reason.message : 'Не удалось выполнить действие.');
    });
  };
  return (
    <div className="grid gap-6 border-t pt-6">
      <section>
        <h2 className="text-xl font-black text-teal-700">Группы предложений и тарифы</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Объединяйте тарифы и варианты программы в группы, затем задавайте условия каждого
          предложения.
        </p>
        {service.offerGroups?.map((g) => (
          <div key={g.id} className="mt-3 rounded-xl bg-cream-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <b className="text-teal-700">{g.title}</b>
                <span className="ml-2 text-sm text-muted-foreground">
                  {g.offers?.length || 0} предложений ·{' '}
                  {g.isPublished ? 'опубликована' : 'черновик'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={() => setGroup(g)}>
                  Изменить группу
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Удалить группу вместе со всеми тарифами?')) {
                      run(async () => {
                        await removeOfferGroup(g.id);
                        await refresh();
                      });
                    }
                  }}
                >
                  Удалить
                </Button>
              </div>
            </div>
            {g.descriptionHtml ? (
              <p className="mt-2 text-sm text-muted-foreground">Есть описание группы</p>
            ) : null}
            <div className="mt-3 grid gap-2 rounded-xl bg-background p-3 text-sm">
              {g.offers?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-2 last:border-0 last:pb-0"
                >
                  <span>
                    <b>{item.title}</b>
                    <span className="ml-2 text-muted-foreground">
                      {item.priceType === 'ON_REQUEST'
                        ? 'по запросу'
                        : item.amount === null
                          ? 'цена не задана'
                          : `${(item.amount / 100).toLocaleString('ru-RU')} ₽`}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setOffer({ groupId: g.id, offer: item })}
                    >
                      Изменить
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Удалить предложение?')) {
                          run(async () => {
                            await removeOffer(item.id);
                            await refresh();
                          });
                        }
                      }}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => setOffer({ groupId: g.id })}>
                Добавить предложение
              </Button>
            </div>
          </div>
        ))}
        <Button
          className="mt-3"
          size="sm"
          variant="secondary"
          onClick={() =>
            setGroup({
              id: '',
              serviceId: service.id,
              title: '',
              descriptionHtml: null,
              isPublished: false,
              sortOrder: service.offerGroups?.length ?? 0,
              createdAt: '',
              updatedAt: '',
            })
          }
        >
          Добавить группу
        </Button>
      </section>
      <OfferGroupEditor
        key={group?.id || 'closed'}
        group={group}
        close={() => setGroup(null)}
        refresh={refresh}
      />
      <OfferEditor
        key={offer?.offer?.id ?? offer?.groupId ?? 'closed'}
        offer={offer}
        close={() => setOffer(null)}
        refresh={refresh}
      />
      <section>
        <h2 className="text-xl font-black text-teal-700">Расписание</h2>
        {service.schedules?.map((s) => (
          <div
            className="mt-3 flex items-center justify-between rounded-xl bg-cream-100 p-4"
            key={s.id}
          >
            <div>
              {s.scheduleType === 'ON_REQUEST'
                ? s.label
                : `${s.daysOfWeek.join(', ')} ${s.startTime}–${s.endTime}`}
              <span className="ml-2 text-sm text-muted-foreground">
                {s.isPublished ? 'опубликовано' : 'черновик'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="xs" variant="outline" onClick={() => setSchedule(s)}>
                Изменить
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={() => {
                  if (confirm('Удалить расписание?')) {
                    run(async () => {
                      await removeSchedule(s.id);
                      await refresh();
                    });
                  }
                }}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
        <Button className="mt-3" size="sm" variant="secondary" onClick={() => setSchedule('new')}>
          Добавить расписание
        </Button>
        {actionError ? (
          <p className="mt-3 rounded-xl bg-danger-100 p-3 text-danger-600">{actionError}</p>
        ) : null}
      </section>
      <ScheduleEditor
        key={schedule === 'new' ? 'new' : (schedule?.id ?? 'closed')}
        serviceId={service.id}
        schedule={schedule}
        sortOrder={service.schedules?.length ?? 0}
        close={() => setSchedule(null)}
        refresh={refresh}
      />
    </div>
  );
}

function OfferGroupEditor({
  group,
  close,
  refresh,
}: {
  group: ServiceOfferGroupDto | null;
  close: () => void;
  refresh: () => Promise<void>;
}) {
  const [values, setValues] = useState<OfferGroupValues | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const v =
    values ??
    (group
      ? {
          title: group.title,
          descriptionHtml: group.descriptionHtml,
          isPublished: group.isPublished,
          sortOrder: group.sortOrder,
        }
      : null);
  if (!group || !v) return null;
  const change = <K extends keyof OfferGroupValues>(key: K, value: OfferGroupValues[K]) =>
    setValues((current) => ({ ...(current ?? v), [key]: value }));
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group.id ? 'Группа предложений' : 'Новая группа предложений'}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            setSaving(true);
            void (async () => {
              try {
                if (group.id) await updateOfferGroup(group.id, v);
                else await createOfferGroup(group.serviceId, v);
                await refresh();
                close();
              } catch (reason) {
                setError(reason instanceof Error ? reason.message : 'Не удалось сохранить группу.');
              } finally {
                setSaving(false);
              }
            })();
          }}
        >
          <label>
            Название
            <Input
              required
              value={v.title}
              onChange={(event) => change('title', event.target.value)}
            />
          </label>
          <label>
            Описание (безопасный HTML)
            <textarea
              className={area}
              value={v.descriptionHtml ?? ''}
              onChange={(event) => change('descriptionHtml', text(event.target.value))}
            />
          </label>
          <label className="font-bold">
            <input
              className="mr-2 size-4 accent-teal-600"
              type="checkbox"
              checked={v.isPublished}
              onChange={(event) => change('isPublished', event.target.checked)}
            />
            Опубликовать группу
          </label>
          <label>
            Порядок
            <Input
              type="number"
              value={v.sortOrder}
              onChange={(event) => change('sortOrder', Number(event.target.value))}
            />
          </label>
          {error ? <p className="rounded-xl bg-danger-100 p-3 text-danger-600">{error}</p> : null}
          <Button type="submit" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OfferEditor({
  offer,
  close,
  refresh,
}: {
  offer: { groupId: string; offer?: ServiceOfferDto } | null;
  close: () => void;
  refresh: () => Promise<void>;
}) {
  const [values, setValues] = useState<OfferValues | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const item = offer?.offer;
  const v =
    values ??
    (offer
      ? item
        ? {
            title: item.title,
            descriptionHtml: item.descriptionHtml,
            imageUrl: item.imageUrl,
            priceType: item.priceType,
            amount: item.amount,
            priceUnit: item.priceUnit,
            priceNote: item.priceNote,
            durationMinutes: item.durationMinutes,
            ageMode: item.ageMode,
            ageFromMonths: item.ageFromMonths,
            ageToMonths: item.ageToMonths,
            ageNote: item.ageNote,
            isPublished: item.isPublished,
            sortOrder: item.sortOrder,
          }
        : {
            title: '',
            descriptionHtml: null,
            imageUrl: null,
            priceType: 'ON_REQUEST' as PriceType,
            amount: null,
            priceUnit: null,
            priceNote: null,
            durationMinutes: null,
            ageMode: 'INHERIT' as AgeMode,
            ageFromMonths: null,
            ageToMonths: null,
            ageNote: null,
            isPublished: false,
            sortOrder: 0,
          }
      : null);
  if (!offer || !v) return null;
  const change = <K extends keyof OfferValues>(key: K, value: OfferValues[K]) =>
    setValues((current) => ({ ...(current ?? v), [key]: value }));
  const changePriceType = (priceType: PriceType) =>
    setValues((current) => ({
      ...(current ?? v),
      priceType,
      amount: priceType === 'FIXED' || priceType === 'FROM' ? (current ?? v).amount : null,
    }));
  const changeAgeMode = (ageMode: AgeMode) =>
    setValues((current) => ({
      ...(current ?? v),
      ageMode,
      ageFromMonths: ageMode === 'CUSTOM' ? (current ?? v).ageFromMonths : null,
      ageToMonths: ageMode === 'CUSTOM' ? (current ?? v).ageToMonths : null,
    }));
  const needsAmount = v.priceType === 'FIXED' || v.priceType === 'FROM';
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Предложение' : 'Новое предложение'}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            setSaving(true);
            void (async () => {
              try {
                if (needsAmount && v.amount === null)
                  throw new Error('Укажите цену для выбранного типа.');
                const imageUrl = imageFile ? (await uploadImage(imageFile)).url : v.imageUrl;
                const values = { ...v, imageUrl };
                if (item) await updateOffer(item.id, values);
                else await createOffer(offer.groupId, values);
                await refresh();
                close();
              } catch (reason) {
                setError(
                  reason instanceof Error ? reason.message : 'Не удалось сохранить предложение.',
                );
              } finally {
                setSaving(false);
              }
            })();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              Название
              <Input
                required
                value={v.title}
                onChange={(event) => change('title', event.target.value)}
              />
            </label>
            <label>
              Длительность, минут
              <Input
                type="number"
                min="1"
                value={v.durationMinutes ?? ''}
                onChange={(event) => change('durationMinutes', num(event.target.value))}
              />
            </label>
          </div>
          <label>
            Описание (безопасный HTML)
            <textarea
              className={area}
              value={v.descriptionHtml ?? ''}
              onChange={(event) => change('descriptionHtml', text(event.target.value))}
            />
          </label>
          <ImageUploadField
            label="Изображение"
            placeholder="https://… или /uploads/image.jpg"
            value={v.imageUrl ?? ''}
            onChange={(imageUrl) => change('imageUrl', text(imageUrl))}
            onFileChange={setImageFile}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              Тип цены
              <select
                className="mt-1 h-11 w-full rounded-xl border-2 border-input bg-background px-3"
                value={v.priceType}
                onChange={(event) => changePriceType(event.target.value as PriceType)}
              >
                <option value="ON_REQUEST">По запросу</option>
                <option value="FIXED">Фиксированная</option>
                <option value="FROM">От</option>
                <option value="FREE">Бесплатно</option>
                <option value="INCLUDED">Включено в стоимость</option>
              </select>
            </label>
            <label>
              Цена, ₽
              <Input
                required={needsAmount}
                type="number"
                min="0.01"
                step="0.01"
                disabled={!needsAmount}
                value={v.amount === null ? '' : v.amount / 100}
                onChange={(event) => change('amount', amount(event.target.value))}
              />
            </label>
            <label>
              Единица цены
              <Input
                value={v.priceUnit ?? ''}
                placeholder="за занятие"
                onChange={(event) => change('priceUnit', text(event.target.value))}
              />
            </label>
          </div>
          <label>
            Примечание к цене
            <Input
              value={v.priceNote ?? ''}
              onChange={(event) => change('priceNote', text(event.target.value))}
            />
          </label>
          <fieldset className="grid gap-4 rounded-xl bg-cream-100 p-4">
            <legend className="px-1 font-black text-teal-700">Возраст</legend>
            <label>
              Источник
              <select
                className="mt-1 h-11 w-full rounded-xl border-2 border-input bg-background px-3"
                value={v.ageMode}
                onChange={(event) => changeAgeMode(event.target.value as AgeMode)}
              >
                <option value="INHERIT">Как у направления</option>
                <option value="CUSTOM">Свой диапазон</option>
                <option value="NONE">Без возрастного ограничения</option>
              </select>
            </label>
            {v.ageMode === 'CUSTOM' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  От, месяцев
                  <Input
                    type="number"
                    min="0"
                    value={v.ageFromMonths ?? ''}
                    onChange={(event) => change('ageFromMonths', num(event.target.value))}
                  />
                </label>
                <label>
                  До, месяцев
                  <Input
                    type="number"
                    min="0"
                    value={v.ageToMonths ?? ''}
                    onChange={(event) => change('ageToMonths', num(event.target.value))}
                  />
                </label>
              </div>
            ) : null}
            <label>
              Примечание
              <Input
                value={v.ageNote ?? ''}
                onChange={(event) => change('ageNote', text(event.target.value))}
              />
            </label>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="font-bold">
              <input
                className="mr-2 size-4 accent-teal-600"
                type="checkbox"
                checked={v.isPublished}
                onChange={(event) => change('isPublished', event.target.checked)}
              />
              Опубликовать
            </label>
            <label>
              Порядок
              <Input
                type="number"
                value={v.sortOrder}
                onChange={(event) => change('sortOrder', Number(event.target.value))}
              />
            </label>
          </div>
          {error ? <p className="rounded-xl bg-danger-100 p-3 text-danger-600">{error}</p> : null}
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleEditor({
  serviceId,
  schedule,
  sortOrder,
  close,
  refresh,
}: {
  serviceId: string;
  schedule: ServiceScheduleDto | 'new' | null;
  sortOrder: number;
  close: () => void;
  refresh: () => Promise<void>;
}) {
  const [values, setValues] = useState<ScheduleValues | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const v =
    values ??
    (schedule && schedule !== 'new'
      ? {
          scheduleType: schedule.scheduleType,
          daysOfWeek: schedule.daysOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          validFrom: schedule.validFrom,
          validUntil: schedule.validUntil,
          label: schedule.label,
          isPublished: schedule.isPublished,
          sortOrder: schedule.sortOrder,
        }
      : schedule
        ? {
            scheduleType: 'RECURRING',
            daysOfWeek: [],
            startTime: null,
            endTime: null,
            validFrom: null,
            validUntil: null,
            label: null,
            isPublished: false,
            sortOrder,
          }
        : null);

  if (!schedule || !v) return null;

  const change = <K extends keyof ScheduleValues>(key: K, value: ScheduleValues[K]) =>
    setValues((current) => ({ ...(current ?? v), [key]: value }));
  const recurring = v.scheduleType === 'RECURRING';
  const toggleDay = (day: DayOfWeek, checked: boolean) => {
    const days = checked ? [...v.daysOfWeek, day] : v.daysOfWeek.filter((item) => item !== day);
    change(
      'daysOfWeek',
      weekdays.filter((item) => days.includes(item.value)).map((item) => item.value),
    );
  };
  const save = () => {
    setError('');
    setSaving(true);
    const normalized: ScheduleValues = recurring
      ? { ...v, label: null }
      : { ...v, daysOfWeek: [], startTime: null, endTime: null };
    void (async () => {
      try {
        if (
          recurring &&
          (normalized.daysOfWeek.length === 0 || !normalized.startTime || !normalized.endTime)
        ) {
          throw new Error(
            'Для регулярного расписания выберите день и укажите время начала и окончания.',
          );
        }
        if (!recurring && !normalized.label?.trim()) {
          throw new Error('Для расписания по согласованию укажите публичную подпись.');
        }
        if (schedule === 'new') await createSchedule(serviceId, normalized);
        else await updateSchedule(schedule.id, normalized);
        await refresh();
        close();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Не удалось сохранить расписание.');
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{schedule === 'new' ? 'Новое расписание' : 'Расписание'}</DialogTitle>
          <DialogDescription>
            Регулярное расписание хранит дни и время; вариант «по согласованию» — только публичную
            подпись.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <label>
            Вид расписания
            <select
              className="mt-1 h-11 w-full rounded-xl border-2 border-input bg-background px-3"
              value={v.scheduleType}
              onChange={(event) =>
                change('scheduleType', event.target.value as ScheduleValues['scheduleType'])
              }
            >
              <option value="RECURRING">Регулярное</option>
              <option value="ON_REQUEST">По согласованию</option>
            </select>
          </label>
          {recurring ? (
            <>
              <fieldset>
                <legend className="font-black text-teal-700">Дни недели</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {weekdays.map((day) => (
                    <label
                      key={day.value}
                      className="rounded-full bg-cream-100 px-3 py-2 text-sm font-bold"
                    >
                      <input
                        className="mr-1.5 accent-teal-600"
                        type="checkbox"
                        checked={v.daysOfWeek.includes(day.value)}
                        onChange={(event) => toggleDay(day.value, event.target.checked)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  Начало
                  <Input
                    required
                    type="time"
                    value={v.startTime ?? ''}
                    onChange={(event) => change('startTime', text(event.target.value))}
                  />
                </label>
                <label>
                  Окончание
                  <Input
                    required
                    type="time"
                    value={v.endTime ?? ''}
                    onChange={(event) => change('endTime', text(event.target.value))}
                  />
                </label>
              </div>
            </>
          ) : (
            <label>
              Подпись для посетителя
              <Input
                required
                value={v.label ?? ''}
                placeholder="Время согласовывается с администратором"
                onChange={(event) => change('label', text(event.target.value))}
              />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              Действует с
              <Input
                type="date"
                value={v.validFrom ?? ''}
                onChange={(event) => change('validFrom', text(event.target.value))}
              />
            </label>
            <label>
              Действует до
              <Input
                type="date"
                value={v.validUntil ?? ''}
                onChange={(event) => change('validUntil', text(event.target.value))}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="font-bold">
              <input
                className="mr-2 size-4 accent-teal-600"
                type="checkbox"
                checked={v.isPublished}
                onChange={(event) => change('isPublished', event.target.checked)}
              />
              Опубликовать
            </label>
            <label>
              Порядок
              <Input
                type="number"
                value={v.sortOrder}
                onChange={(event) => change('sortOrder', Number(event.target.value))}
              />
            </label>
          </div>
          {error ? <p className="rounded-xl bg-danger-100 p-3 text-danger-600">{error}</p> : null}
          <Button type="submit" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
