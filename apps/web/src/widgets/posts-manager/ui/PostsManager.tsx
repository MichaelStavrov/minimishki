'use client';

import { useState, type FormEvent } from 'react';
import type { GalleryItemDto, PostDto } from '@minimishki/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { RichTextEditor } from '@/features/rich-text-editor';

import {
  createPost,
  createPostGalleryItem,
  getAdminPost,
  getAdminPosts,
  removeGalleryItem,
  removePost,
  updateGalleryItem,
  updatePost,
  type PostValues,
} from '@/entities/post';
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

const textarea =
  'min-h-24 w-full rounded-xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100';

const blank = (): PostValues => ({
  slug: '',
  title: '',
  excerpt: null,
  contentHtml: '<p></p>',
  coverUrl: null,
  eventStartsAt: null,
  eventEndsAt: null,
  ageLabel: null,
  priceLabel: null,
  registrationLabel: null,
  registrationUrl: null,
  isPublished: false,
  publishedAt: null,
});

const nullable = (value: string) => value.trim() || null;

export function PostsManager() {
  const client = useQueryClient();
  const [id, setId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [publication, setPublication] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const list = useQuery({
    queryKey: ['admin-posts', search, publication],
    queryFn: () =>
      getAdminPosts({
        page: 1,
        pageSize: 100,
        search: search || undefined,
        isPublished: publication === 'ALL' ? undefined : publication === 'PUBLISHED',
      }),
  });

  function close() {
    setId(null);
    setCreating(false);
  }

  async function changed() {
    await client.invalidateQueries({ queryKey: ['admin-posts'] });
  }

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-cream-200 pb-8">
        <div>
          <p className="text-sm font-black tracking-[.14em] text-coral-400 uppercase">Админка</p>
          <h1 className="mt-2 text-4xl font-black text-teal-700">Новости</h1>
          <p className="mt-2 text-muted-foreground">
            Публикации, анонсы событий и фотографии для подробной страницы.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>Создать новость</Button>
      </header>

      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-cream-200 bg-background p-4">
        <Input
          className="max-w-md"
          value={search}
          placeholder="Поиск по заголовку, анонсу или slug"
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
            <option value="PUBLISHED">Опубликованные</option>
            <option value="DRAFT">Черновики</option>
          </select>
        </label>
      </div>

      {list.isLoading ? <p className="mt-6">Загружаем новости…</p> : null}
      {list.isError ? <Message>Не удалось загрузить новости.</Message> : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {list.data?.items.map((post) => (
          <PostCard key={post.id} post={post} onOpen={() => setId(post.id)} />
        ))}
      </div>
      {list.data?.items.length === 0 ? (
        <p className="border-cream-300 mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Новостей по этому запросу пока нет.
        </p>
      ) : null}
      <PostDialog
        id={id}
        open={creating || id !== null}
        onClose={close}
        onCreated={(postId) => {
          setCreating(false);
          setId(postId);
        }}
        onChanged={changed}
      />
    </section>
  );
}

function PostCard({ post, onOpen }: { post: PostDto; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="group rounded-2xl border border-cream-200 bg-background p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lifted focus-visible:ring-4 focus-visible:ring-teal-100 focus-visible:outline-none"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-teal-700">{post.title}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">/{post.slug}</p>
        </div>
        <span className={statusClasses(post)}>{statusLabel(post)}</span>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-ink">
        {post.excerpt || 'Краткий анонс не добавлен.'}
      </p>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-muted-foreground">
        <span>Обновлено: {formatDate(post.updatedAt)}</span>
        {post.eventStartsAt ? <span>Событие: {formatDate(post.eventStartsAt)}</span> : null}
      </div>
    </button>
  );
}

function PostDialog({
  id,
  open,
  onClose,
  onCreated,
  onChanged,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
  onChanged: () => Promise<void>;
}) {
  const detail = useQuery({
    queryKey: ['admin-posts', 'detail', id],
    queryFn: () => getAdminPost(id!),
    enabled: open && id !== null,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{id ? 'Редактировать новость' : 'Новая новость'}</DialogTitle>
          <DialogDescription>
            Сначала сохраните публикацию, затем добавьте фотографии в её галерею.
          </DialogDescription>
        </DialogHeader>
        {id && detail.isLoading ? <p>Загружаем новость…</p> : null}
        {id && detail.isError ? <Message>Не удалось загрузить данные новости.</Message> : null}
        {!id || detail.data ? (
          <PostForm
            key={detail.data?.id ?? 'new'}
            post={detail.data}
            onClose={onClose}
            onCreated={onCreated}
            onChanged={onChanged}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PostForm({
  post,
  onClose,
  onCreated,
  onChanged,
}: {
  post?: PostDto;
  onClose: () => void;
  onCreated: (id: string) => void;
  onChanged: () => Promise<void>;
}) {
  const [values, setValues] = useState<PostValues>(() =>
    post
      ? {
          ...blank(),
          ...post,
          eventStartsAt: toDateTimeLocal(post.eventStartsAt),
          eventEndsAt: toDateTimeLocal(post.eventEndsAt),
          publishedAt: toDateTimeLocal(post.publishedAt),
        }
      : blank(),
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  function change<Key extends keyof PostValues>(key: Key, value: PostValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const coverUrl = imageFile ? (await uploadImage(imageFile)).url : values.coverUrl;
      const payload = preparePostValues({ ...values, coverUrl });
      const saved = post ? await updatePost(post.id, payload) : await createPost(payload);
      await onChanged();
      if (post) onClose();
      else onCreated(saved.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить новость.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!post || !window.confirm(`Удалить новость «${post.title}» вместе с фотографиями галереи?`))
      return;
    setError('');
    setDeleting(true);
    try {
      await removePost(post.id);
      await onChanged();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось удалить новость.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={(event) => void save(event)}>
      <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
        <Field label="Заголовок">
          <Input
            value={values.title}
            required
            onChange={(event) => change('title', event.target.value)}
          />
        </Field>
        <Field label="Slug для адреса страницы">
          <Input
            value={values.slug}
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            title="Только строчные латинские буквы, цифры и дефисы"
            onChange={(event) => change('slug', event.target.value)}
          />
        </Field>
      </div>
      <Field label="Краткий анонс">
        <textarea
          className={textarea}
          maxLength={1000}
          value={values.excerpt ?? ''}
          onChange={(event) => change('excerpt', event.target.value)}
        />
      </Field>
      <div className="grid gap-2">
        <p className="text-sm font-bold text-teal-700">Текст новости</p>
        <RichTextEditor
          value={values.contentHtml}
          onChange={(contentHtml) => change('contentHtml', contentHtml)}
        />
      </div>
      <ImageUploadField
        label="Обложка"
        placeholder="https://… или /uploads/cover.jpg"
        value={values.coverUrl ?? ''}
        onChange={(coverUrl) => change('coverUrl', coverUrl)}
        onFileChange={setImageFile}
      />
      <fieldset className="grid gap-4 rounded-2xl border border-cream-200 p-5">
        <legend className="px-2 text-sm font-black text-teal-700">
          Необязательные параметры события
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Начало">
            <Input
              type="datetime-local"
              value={values.eventStartsAt ?? ''}
              onChange={(event) => change('eventStartsAt', event.target.value || null)}
            />
          </Field>
          <Field label="Окончание">
            <Input
              type="datetime-local"
              value={values.eventEndsAt ?? ''}
              onChange={(event) => change('eventEndsAt', event.target.value || null)}
            />
          </Field>
          <Field label="Возраст">
            <Input
              value={values.ageLabel ?? ''}
              placeholder="Например, 4+"
              onChange={(event) => change('ageLabel', event.target.value)}
            />
          </Field>
          <Field label="Цена">
            <Input
              value={values.priceLabel ?? ''}
              placeholder="Например, 1 000 ₽"
              onChange={(event) => change('priceLabel', event.target.value)}
            />
          </Field>
          <Field label="Как записаться">
            <Input
              value={values.registrationLabel ?? ''}
              placeholder="Например, по телефону"
              onChange={(event) => change('registrationLabel', event.target.value)}
            />
          </Field>
          <Field label="Ссылка для записи">
            <Input
              type="text"
              value={values.registrationUrl ?? ''}
              placeholder="https://… или /services"
              onChange={(event) => change('registrationUrl', event.target.value)}
            />
          </Field>
        </div>
      </fieldset>
      <fieldset className="grid gap-4 rounded-2xl bg-cream-50 p-5">
        <legend className="px-2 text-sm font-black text-teal-700">Публикация</legend>
        <label className="flex items-center gap-2 text-sm font-bold text-teal-700">
          <input
            className="size-4 accent-teal-600"
            type="checkbox"
            checked={values.isPublished}
            onChange={(event) => change('isPublished', event.target.checked)}
          />
          Опубликовать на сайте
        </label>
        <Field label="Дата и время публикации">
          <Input
            type="datetime-local"
            value={values.publishedAt ?? ''}
            onChange={(event) => change('publishedAt', event.target.value || null)}
          />
        </Field>
        <p className="text-sm leading-6 text-muted-foreground">
          Оставьте дату пустой при публикации — сайт установит текущее время. Будущая дата отложит
          появление новости.
        </p>
      </fieldset>
      {post ? <GalleryEditor post={post} onChanged={onChanged} /> : null}
      {error ? <Message>{error}</Message> : null}
      <div className="flex flex-wrap justify-between gap-3 border-t border-cream-200 pt-5">
        {post ? (
          <Button
            type="button"
            variant="destructive"
            disabled={saving || deleting}
            onClick={() => void remove()}
          >
            {deleting ? 'Удаляем…' : 'Удалить новость'}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={saving || deleting} onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={saving || deleting}>
            {saving ? 'Сохраняем…' : post ? 'Сохранить' : 'Сохранить и добавить фото'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function GalleryEditor({ post, onChanged }: { post: PostDto; onChanged: () => Promise<void> }) {
  const client = useQueryClient();
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const gallery = post.gallery ?? [];

  async function refresh() {
    await Promise.all([
      onChanged(),
      client.invalidateQueries({ queryKey: ['admin-posts', 'detail', post.id] }),
    ]);
  }

  async function addPhoto() {
    setError('');
    if (!url.trim()) {
      setError('Укажите URL фотографии.');
      return;
    }
    setAdding(true);
    try {
      const imageUrl = imageFile ? (await uploadImage(imageFile)).url : url.trim();
      await createPostGalleryItem({
        url: imageUrl,
        alt: nullable(alt),
        caption: nullable(caption),
        isPublished: true,
        sortOrder: (gallery.at(-1)?.sortOrder ?? 0) + 10,
        postId: post.id,
      });
      setUrl('');
      setImageFile(null);
      setAlt('');
      setCaption('');
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось добавить фотографию.');
    } finally {
      setAdding(false);
    }
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    setError('');
    const reordered = [...gallery];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    try {
      await Promise.all(
        reordered.map((item, itemIndex) =>
          updateGalleryItem(item.id, { sortOrder: (itemIndex + 1) * 10 }),
        ),
      );
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Не удалось сохранить порядок фотографий.',
      );
    }
  }

  return (
    <fieldset className="grid gap-5 rounded-2xl border border-cream-200 p-5">
      <legend className="px-2 text-sm font-black text-teal-700">Галерея новости</legend>
      <p className="text-sm leading-6 text-muted-foreground">
        Добавляйте готовые адреса фотографий. Alt-текст помогает посетителям со скринридером и
        поисковым системам.
      </p>
      <div className="grid gap-3 rounded-xl bg-cream-50 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <ImageUploadField
            label="Фотография"
            placeholder="https://… или /uploads/photo.jpg"
            value={url}
            onChange={setUrl}
            onFileChange={setImageFile}
          />
          <Input
            value={alt}
            placeholder="Alt-текст"
            onChange={(event) => setAlt(event.target.value)}
          />
          <Input
            value={caption}
            placeholder="Подпись (необязательно)"
            onChange={(event) => setCaption(event.target.value)}
          />
        </div>
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={adding}
            onClick={() => void addPhoto()}
          >
            {adding ? 'Добавляем…' : 'Добавить фотографию'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {gallery.map((item, index) => (
          <GalleryCard
            key={item.id}
            item={item}
            first={index === 0}
            last={index === gallery.length - 1}
            onMove={(direction) => void movePhoto(index, direction)}
            onChanged={refresh}
          />
        ))}
      </div>
      {!gallery.length ? (
        <p className="border-cream-300 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
          В этой новости пока нет фотографий.
        </p>
      ) : null}
      {error ? <Message>{error}</Message> : null}
    </fieldset>
  );
}

function GalleryCard({
  item,
  first,
  last,
  onMove,
  onChanged,
}: {
  item: GalleryItemDto;
  first: boolean;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
  onChanged: () => Promise<void>;
}) {
  const [alt, setAlt] = useState(item.alt ?? '');
  const [caption, setCaption] = useState(item.caption ?? '');
  const [published, setPublished] = useState(item.isPublished);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setError('');
    setSaving(true);
    try {
      await updateGalleryItem(item.id, {
        alt: nullable(alt),
        caption: nullable(caption),
        isPublished: published,
      });
      await onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить фотографию.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm('Удалить фотографию из галереи?')) return;
    setError('');
    setDeleting(true);
    try {
      await removeGalleryItem(item.id);
      await onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось удалить фотографию.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="grid gap-3 rounded-xl border border-cream-200 bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <a
          className="min-w-0 truncate text-sm font-bold text-teal-700 underline"
          href={item.url}
          target="_blank"
          rel="noreferrer"
        >
          {item.url}
        </a>
        <span
          className={
            item.isPublished
              ? 'rounded-full bg-teal-100 px-2 py-1 text-xs font-bold text-teal-700'
              : 'rounded-full bg-honey-100 px-2 py-1 text-xs font-bold text-ink'
          }
        >
          {item.isPublished ? 'На сайте' : 'Скрыта'}
        </span>
      </div>
      <Input value={alt} placeholder="Alt-текст" onChange={(event) => setAlt(event.target.value)} />
      <Input
        value={caption}
        placeholder="Подпись"
        onChange={(event) => setCaption(event.target.value)}
      />
      <label className="flex items-center gap-2 text-sm font-bold text-teal-700">
        <input
          className="size-4 accent-teal-600"
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
        />
        Показывать на сайте
      </label>
      {error ? <Message>{error}</Message> : null}
      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={first || saving || deleting}
            onClick={() => onMove(-1)}
          >
            ← Выше
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={last || saving || deleting}
            onClick={() => onMove(1)}
          >
            Ниже →
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            size="xs"
            disabled={saving || deleting}
            onClick={() => void remove()}
          >
            {deleting ? '…' : 'Удалить'}
          </Button>
          <Button type="button" size="xs" disabled={saving || deleting} onClick={() => void save()}>
            {saving ? '…' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </article>
  );
}

function preparePostValues(values: PostValues): PostValues {
  const publishedAt = values.publishedAt ? new Date(values.publishedAt).toISOString() : null;
  return {
    ...values,
    slug: values.slug.trim(),
    title: values.title.trim(),
    excerpt: nullable(values.excerpt ?? ''),
    coverUrl: nullable(values.coverUrl ?? ''),
    eventStartsAt: values.eventStartsAt ? new Date(values.eventStartsAt).toISOString() : null,
    eventEndsAt: values.eventEndsAt ? new Date(values.eventEndsAt).toISOString() : null,
    ageLabel: nullable(values.ageLabel ?? ''),
    priceLabel: nullable(values.priceLabel ?? ''),
    registrationLabel: nullable(values.registrationLabel ?? ''),
    registrationUrl: nullable(values.registrationUrl ?? ''),
    publishedAt: values.isPublished && !publishedAt ? undefined : publishedAt,
  };
}

function toDateTimeLocal(value: string | null): string | null {
  if (value === null) return null;
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function statusLabel(post: PostDto): string {
  if (!post.isPublished) return 'Черновик';
  if (post.publishedAt && new Date(post.publishedAt) > new Date()) return 'Запланирована';
  return 'На сайте';
}

function statusClasses(post: PostDto): string {
  return post.isPublished && (!post.publishedAt || new Date(post.publishedAt) <= new Date())
    ? 'shrink-0 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700'
    : 'shrink-0 rounded-full bg-honey-100 px-3 py-1 text-xs font-bold text-ink';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
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
