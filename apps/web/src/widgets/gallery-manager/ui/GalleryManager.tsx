'use client';

import { useState, type FormEvent } from 'react';
import type { GalleryItemDto } from '@minimishki/shared';
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
  createGalleryItem,
  getAdminGalleryItem,
  getAdminGalleryItems,
  removeGalleryItem,
  updateGalleryItem,
  type GalleryItemValues,
} from '@/entities/gallery';
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

const blank = (): GalleryItemValues => ({
  url: '',
  alt: null,
  caption: null,
  isPublished: false,
  sortOrder: 0,
});
const nullable = (value: string) => value.trim() || null;
const publishedClasses =
  'shrink-0 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700';
const hiddenClasses = 'shrink-0 rounded-full bg-honey-100 px-3 py-1 text-xs font-bold text-ink';

export function GalleryManager() {
  const client = useQueryClient();
  const [id, setId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [publication, setPublication] = useState<'ALL' | 'PUBLISHED' | 'HIDDEN'>('ALL');
  const [reorderError, setReorderError] = useState('');
  const list = useQuery({
    queryKey: ['admin-gallery', search, publication],
    queryFn: () =>
      getAdminGalleryItems({
        page: 1,
        pageSize: 100,
        search: search || undefined,
        isPublished: publication === 'ALL' ? undefined : publication === 'PUBLISHED',
      }),
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const canSort = !search && publication === 'ALL';

  function close() {
    setId(null);
    setCreating(false);
  }
  async function changed() {
    await client.invalidateQueries({ queryKey: ['admin-gallery'] });
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
    client.setQueryData(['admin-gallery', search, publication], { ...list.data, items: ordered });
    try {
      await Promise.all(
        ordered.map((item, index) => updateGalleryItem(item.id, { sortOrder: (index + 1) * 10 })),
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
          <h1 className="mt-2 text-4xl font-black text-teal-700">Галерея</h1>
          <p className="mt-2 text-muted-foreground">
            Фотографии общей галереи сайта. Снимки новостей и направлений редактируются в их
            карточках.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>Добавить фотографию</Button>
      </header>
      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-cream-200 bg-background p-4">
        <Input
          className="max-w-md"
          value={search}
          placeholder="Поиск по URL, alt-тексту или подписи"
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="grid gap-1 text-sm font-bold text-teal-700">
          Статус
          <select
            className="h-11 rounded-xl border-2 border-input bg-background px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            value={publication}
            onChange={(event) => setPublication(event.target.value as typeof publication)}
          >
            <option value="ALL">Все</option>
            <option value="PUBLISHED">На сайте</option>
            <option value="HIDDEN">Скрытые</option>
          </select>
        </label>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {canSort
          ? 'Перетаскивайте карточки за значок ⠿ — порядок на публичной странице сохранится автоматически.'
          : 'Очистите поиск и выберите «Все», чтобы менять порядок перетаскиванием.'}
      </p>
      {list.isLoading ? <p className="mt-6">Загружаем фотографии…</p> : null}
      {list.isError ? <Message>Не удалось загрузить фотографии.</Message> : null}
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
            {list.data?.items.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                disabled={!canSort}
                onOpen={() => setId(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {list.data?.items.length === 0 ? (
        <p className="border-cream-300 mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Фотографий по этому запросу пока нет.
        </p>
      ) : null}
      <GalleryDialog id={id} open={creating || id !== null} onClose={close} onChanged={changed} />
    </section>
  );
}

function GalleryCard({
  item,
  disabled,
  onOpen,
}: {
  item: GalleryItemDto;
  disabled: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    disabled,
  });
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-2xl border border-cream-200 bg-background p-5 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={`Изменить порядок: ${item.alt || item.url}`}
          disabled={disabled}
          className="mt-1 cursor-grab rounded-lg px-2 py-1 text-lg text-teal-700 hover:bg-teal-50 active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 truncate text-lg font-black text-teal-700">
              {item.alt || 'Фотография без alt-текста'}
            </p>
            <span className={item.isPublished ? publishedClasses : hiddenClasses}>
              {item.isPublished ? 'На сайте' : 'Скрыта'}
            </span>
          </div>
          <p className="mt-2 truncate text-sm text-muted-foreground">{item.url}</p>
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-ink">
            {item.caption || 'Подпись не добавлена.'}
          </p>
        </button>
      </div>
    </article>
  );
}

function GalleryDialog({
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
    queryKey: ['admin-gallery', 'detail', id],
    queryFn: () => getAdminGalleryItem(id!),
    enabled: open && id !== null,
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{id ? 'Редактировать фотографию' : 'Новая фотография'}</DialogTitle>
          <DialogDescription>
            Вставьте готовый URL. Загрузка файлов появится после выбора постоянного хранилища.
          </DialogDescription>
        </DialogHeader>
        {id && detail.isLoading ? <p>Загружаем фотографию…</p> : null}
        {id && detail.isError ? <Message>Не удалось загрузить данные фотографии.</Message> : null}
        {!id || detail.data ? (
          <GalleryForm
            key={detail.data?.id ?? 'new'}
            item={detail.data}
            onClose={onClose}
            onChanged={onChanged}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function GalleryForm({
  item,
  onClose,
  onChanged,
}: {
  item?: GalleryItemDto;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [values, setValues] = useState<GalleryItemValues>(() =>
    item
      ? {
          url: item.url,
          alt: item.alt,
          caption: item.caption,
          isPublished: item.isPublished,
          sortOrder: item.sortOrder,
        }
      : blank(),
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  function change<Key extends keyof GalleryItemValues>(key: Key, value: GalleryItemValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!imageFile && !values.url.trim()) {
      setError('Укажите URL фотографии.');
      return;
    }
    setSaving(true);
    try {
      const url = imageFile ? (await uploadImage(imageFile)).url : values.url.trim();
      const payload = {
        ...values,
        url,
        alt: nullable(values.alt ?? ''),
        caption: nullable(values.caption ?? ''),
      };
      if (item) await updateGalleryItem(item.id, payload);
      else await createGalleryItem(payload);
      await onChanged();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить фотографию.');
    } finally {
      setSaving(false);
    }
  }
  async function remove() {
    if (!item || !window.confirm('Удалить запись о фотографии из общей галереи?')) return;
    setError('');
    setDeleting(true);
    try {
      await removeGalleryItem(item.id);
      await onChanged();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось удалить фотографию.');
    } finally {
      setDeleting(false);
    }
  }
  return (
    <form className="grid gap-5" onSubmit={(event) => void save(event)}>
      <ImageUploadField
        label="Фотография"
        placeholder="https://… или /uploads/photo.jpg"
        value={values.url}
        onChange={(url) => change('url', url)}
        onFileChange={setImageFile}
      />
      <Field label="Alt-текст">
        <Input
          maxLength={500}
          placeholder="Опишите, что изображено на фотографии"
          value={values.alt ?? ''}
          onChange={(event) => change('alt', event.target.value)}
        />
      </Field>
      <Field label="Подпись">
        <textarea
          className="min-h-24 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          maxLength={1000}
          placeholder="Необязательная подпись под фотографией"
          value={values.caption ?? ''}
          onChange={(event) => change('caption', event.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 rounded-xl bg-cream-50 p-4 text-sm font-bold text-teal-700">
        <input
          className="size-4 accent-teal-600"
          type="checkbox"
          checked={values.isPublished}
          onChange={(event) => change('isPublished', event.target.checked)}
        />
        Показывать на публичной странице галереи
      </label>
      {error ? <Message>{error}</Message> : null}
      <div className="flex flex-wrap justify-between gap-3 border-t border-cream-200 pt-5">
        {item ? (
          <Button
            type="button"
            variant="destructive"
            disabled={saving || deleting}
            onClick={() => void remove()}
          >
            {deleting ? 'Удаляем…' : 'Удалить фотографию'}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={saving || deleting} onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={saving || deleting}>
            {saving ? 'Сохраняем…' : item ? 'Сохранить' : 'Добавить фотографию'}
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
function Message({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-danger-100 p-4 text-sm font-bold text-danger-600">{children}</p>
  );
}
