'use client';

import { useState, type FormEvent } from 'react';
import type { ServiceDto, TeacherDto } from '@minimishki/shared';
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
  archiveTeacher,
  createTeacher,
  getAdminTeacher,
  getAdminTeachers,
  getTeacherServices,
  restoreTeacher,
  updateTeacher,
  type TeacherValues,
} from '@/entities/teacher';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/shared/ui';

const textarea =
  'min-h-28 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100';
const blank = (): TeacherValues => ({
  slug: '',
  fullName: '',
  position: '',
  bio: null,
  photoUrl: null,
  isPublished: false,
  sortOrder: 0,
  serviceIds: [],
});
const nullable = (value: string) => value.trim() || null;

export function TeachersManager() {
  const client = useQueryClient();
  const [id, setId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [archived, setArchived] = useState(false);
  const [reorderError, setReorderError] = useState('');
  const list = useQuery({
    queryKey: ['admin-teachers', search, archived],
    queryFn: () =>
      getAdminTeachers({
        page: 1,
        pageSize: 100,
        search: search || undefined,
        includeArchived: archived,
      }),
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const canSort = !search && !archived;
  const close = () => {
    setId(null);
    setCreating(false);
  };
  async function changed() {
    await client.invalidateQueries({ queryKey: ['admin-teachers'] });
  }
  async function reorder(event: DragEndEvent) {
    const items = list.data?.items;
    if (!items || !event.over || event.active.id === event.over.id) return;
    const ordered = arrayMove(
      items,
      items.findIndex((item) => item.id === event.active.id),
      items.findIndex((item) => item.id === event.over?.id),
    );
    setReorderError('');
    client.setQueryData(['admin-teachers', search, archived], { ...list.data, items: ordered });
    try {
      await Promise.all(
        ordered.map((item, index) => updateTeacher(item.id, { sortOrder: (index + 1) * 10 })),
      );
      await list.refetch();
    } catch {
      await list.refetch();
      setReorderError('Не удалось сохранить новый порядок. Список возвращён к данным сервера.');
    }
  }
  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-cream-200 pb-8">
        <div>
          <p className="text-sm font-black tracking-[.14em] text-coral-400 uppercase">Админка</p>
          <h1 className="mt-2 text-4xl font-black text-teal-700">Педагоги</h1>
          <p className="mt-2 text-muted-foreground">
            Профили команды, публикация и направления, которые они ведут.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>Добавить педагога</Button>
      </header>
      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-cream-200 bg-background p-4">
        <Input
          className="max-w-md"
          value={search}
          placeholder="Поиск по ФИО, должности или slug"
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm font-bold text-teal-700">
          <input
            className="size-4 accent-teal-600"
            type="checkbox"
            checked={archived}
            onChange={(event) => setArchived(event.target.checked)}
          />
          Показать архив
        </label>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {canSort
          ? 'Перетаскивайте карточки за значок ⠿ — порядок сохранится автоматически.'
          : 'Очистите поиск и скройте архив, чтобы менять порядок перетаскиванием.'}
      </p>
      {list.isLoading ? <p className="mt-6">Загружаем…</p> : null}
      {list.isError ? <Message>Не удалось загрузить педагогов.</Message> : null}
      {reorderError ? <Message>{reorderError}</Message> : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => void reorder(event)}
      >
        <SortableContext
          items={canSort ? (list.data?.items.map((item) => item.id) ?? []) : []}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.data?.items.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                disabled={!canSort}
                onOpen={() => setId(teacher.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {list.data?.items.length === 0 ? (
        <p className="border-cream-300 mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Педагогов по этому запросу пока нет.
        </p>
      ) : null}
      <TeacherDialog id={id} open={creating || id !== null} onClose={close} onChanged={changed} />
    </section>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 rounded-xl bg-danger-100 p-4 font-bold text-danger-600">{children}</p>;
}
function TeacherCard({
  teacher,
  disabled,
  onOpen,
}: {
  teacher: TeacherDto;
  disabled: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: teacher.id,
    disabled,
  });
  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="rounded-2xl border border-cream-200 bg-background p-5 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={`Изменить порядок: ${teacher.fullName}`}
          disabled={disabled}
          className="mt-1 cursor-grab rounded-lg px-2 py-1 text-lg text-teal-700 hover:bg-teal-50 active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <p className="text-lg font-black text-teal-700">{teacher.fullName}</p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">{teacher.position}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span
              className={
                teacher.isPublished
                  ? 'rounded-full bg-teal-100 px-3 py-1 text-teal-700'
                  : 'rounded-full bg-honey-100 px-3 py-1 text-ink'
              }
            >
              {teacher.isPublished ? 'Опубликован' : 'Черновик'}
            </span>
            {teacher.archivedAt ? (
              <span className="rounded-full bg-danger-100 px-3 py-1 text-danger-600">Архив</span>
            ) : null}
          </div>
        </button>
      </div>
    </article>
  );
}

function TeacherDialog({
  id,
  open,
  onClose,
  onChanged,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const detail = useQuery({
    queryKey: ['admin-teachers', 'detail', id],
    queryFn: () => getAdminTeacher(id!),
    enabled: open && id !== null,
  });
  const services = useQuery({
    queryKey: ['admin-teacher-services'],
    queryFn: getTeacherServices,
    enabled: open,
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{id ? 'Редактировать педагога' : 'Новый педагог'}</DialogTitle>
          <DialogDescription>
            Заполните данные публичной карточки и выберите направления, которые ведёт педагог.
          </DialogDescription>
        </DialogHeader>
        {id && detail.isLoading ? <p>Загружаем данные педагога…</p> : null}
        {services.isLoading ? <p>Загружаем направления…</p> : null}
        {(!id || detail.data) && !services.isLoading ? (
          <TeacherForm
            key={detail.data?.id ?? 'new'}
            teacher={detail.data}
            services={services.data ?? []}
            onClose={onClose}
            onChanged={onChanged}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TeacherForm({
  teacher,
  services,
  onClose,
  onChanged,
}: {
  teacher?: TeacherDto;
  services: ServiceDto[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [values, setValues] = useState<TeacherValues>(() =>
    teacher
      ? { ...blank(), ...teacher, serviceIds: teacher.services?.map((service) => service.id) ?? [] }
      : blank(),
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  function change<Key extends keyof TeacherValues>(key: Key, value: TeacherValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...values,
        slug: values.slug.trim(),
        fullName: values.fullName.trim(),
        position: values.position.trim(),
        bio: nullable(values.bio ?? ''),
        photoUrl: nullable(values.photoUrl ?? ''),
      };
      if (teacher) await updateTeacher(teacher.id, payload);
      else await createTeacher(payload);
      await onChanged();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить педагога.');
    } finally {
      setSaving(false);
    }
  }
  async function changeArchive(restore = false) {
    if (!teacher || (!restore && !window.confirm(`Перенести «${teacher.fullName}» в архив?`)))
      return;
    setError('');
    setArchiving(true);
    try {
      if (restore) await restoreTeacher(teacher.id);
      else await archiveTeacher(teacher.id);
      await onChanged();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось изменить состояние архива.');
    } finally {
      setArchiving(false);
    }
  }
  return (
    <form className="grid gap-5" onSubmit={(event) => void save(event)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ФИО">
          <Input
            value={values.fullName}
            required
            onChange={(event) => change('fullName', event.target.value)}
          />
        </Field>
        <Field label="Должность">
          <Input
            value={values.position}
            required
            onChange={(event) => change('position', event.target.value)}
          />
        </Field>
      </div>
      <Field label="Slug для адреса страницы">
        <Input
          value={values.slug}
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="Только строчные латинские буквы, цифры и дефисы"
          onChange={(event) => change('slug', event.target.value)}
        />
      </Field>
      <Field label="URL фотографии">
        <Input
          type="url"
          placeholder="https://… или /uploads/photo.jpg"
          value={values.photoUrl ?? ''}
          onChange={(event) => change('photoUrl', event.target.value)}
        />
      </Field>
      <Field label="Биография">
        <textarea
          className={textarea}
          value={values.bio ?? ''}
          onChange={(event) => change('bio', event.target.value)}
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-bold text-teal-700">Направления</legend>
        {services.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="rounded-xl bg-cream-100 p-3 text-sm font-bold text-teal-700"
              >
                <input
                  className="mr-2 size-4 accent-teal-600"
                  type="checkbox"
                  checked={values.serviceIds.includes(service.id)}
                  onChange={(event) =>
                    change(
                      'serviceIds',
                      event.target.checked
                        ? [...values.serviceIds, service.id]
                        : values.serviceIds.filter((serviceId) => serviceId !== service.id),
                    )
                  }
                />
                {service.title}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Активных направлений пока нет.</p>
        )}
      </fieldset>
      <label className="flex items-center gap-2 text-sm font-bold text-teal-700">
        <input
          className="size-4 accent-teal-600"
          type="checkbox"
          checked={values.isPublished}
          disabled={teacher?.archivedAt != null}
          onChange={(event) => change('isPublished', event.target.checked)}
        />
        Опубликовать на сайте
      </label>
      {teacher?.archivedAt ? (
        <p className="rounded-xl bg-honey-100 p-3 text-sm text-ink">
          Архивный профиль нельзя опубликовать до восстановления.
        </p>
      ) : null}
      {error ? <Message>{error}</Message> : null}
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          {teacher ? (
            <Button
              type="button"
              variant={teacher.archivedAt ? 'outline' : 'destructive'}
              disabled={saving || archiving}
              onClick={() => void changeArchive(Boolean(teacher.archivedAt))}
            >
              {teacher.archivedAt ? 'Восстановить из архива' : 'В архив'}
            </Button>
          ) : null}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" disabled={saving || archiving} onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={saving || archiving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </form>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-teal-700">
      {label}
      {children}
    </label>
  );
}
