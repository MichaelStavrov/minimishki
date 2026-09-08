'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import type { SiteSettingsDto } from '@minimishki/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getSiteSettings,
  updateSiteSettings,
  type SiteSettingsValues,
} from '@/entities/site-settings';

import { Button, Input } from '@/shared/ui';

const blank: SiteSettingsValues = {
  phone: null,
  email: null,
  address: null,
  workingHours: null,
  vkUrl: null,
  telegramUrl: null,
  whatsappUrl: null,
  legalName: null,
  inn: null,
  privacyPolicyUrl: null,
  cookiePolicyUrl: null,
};

export function SiteSettingsManager() {
  const client = useQueryClient();
  const settings = useQuery({ queryKey: ['site-settings'], queryFn: getSiteSettings });
  const [editedValues, setEditedValues] = useState<SiteSettingsValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const values = editedValues ?? (settings.data ? toValues(settings.data) : blank);

  function change(key: keyof SiteSettingsValues, value: string) {
    setEditedValues((current) => ({ ...(current ?? values), [key]: value }));
    setSavedAt(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const saved = await updateSiteSettings(values);
      setEditedValues(toValues(saved));
      setSavedAt(saved.updatedAt);
      await client.invalidateQueries({ queryKey: ['site-settings'] });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить настройки сайта.');
    } finally {
      setSaving(false);
    }
  }

  if (settings.isLoading) return <p>Загружаем настройки сайта…</p>;
  if (settings.isError) return <Message>Не удалось загрузить настройки сайта.</Message>;

  return (
    <section>
      <header className="border-b border-cream-200 pb-8">
        <p className="text-sm font-black tracking-[.14em] text-coral-400 uppercase">
          Системный раздел
        </p>
        <h1 className="mt-2 text-4xl font-black text-teal-700">Настройки сайта</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Контакты и ссылки показываются на публичном сайте. Если значение пока не подтверждено,
          оставьте поле пустым — оно не будет опубликовано.
        </p>
      </header>

      <form className="mt-7 grid gap-6" onSubmit={(event) => void save(event)}>
        <SettingsGroup title="Контакты" description="Каналы связи и адрес детского центра.">
          <Field label="Телефон">
            <Input
              value={values.phone ?? ''}
              maxLength={100}
              onChange={(event) => change('phone', event.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={values.email ?? ''}
              maxLength={254}
              onChange={(event) => change('email', event.target.value)}
            />
          </Field>
          <Field label="Адрес">
            <textarea
              className={textareaClassName}
              value={values.address ?? ''}
              maxLength={500}
              rows={3}
              onChange={(event) => change('address', event.target.value)}
            />
          </Field>
          <Field label="Режим работы">
            <textarea
              className={textareaClassName}
              value={values.workingHours ?? ''}
              maxLength={500}
              rows={3}
              onChange={(event) => change('workingHours', event.target.value)}
            />
          </Field>
        </SettingsGroup>

        <SettingsGroup
          title="Социальные сети и мессенджеры"
          description="Указывайте полные ссылки, начиная с https://."
        >
          <Field label="ВКонтакте">
            <Input
              type="url"
              value={values.vkUrl ?? ''}
              maxLength={2000}
              placeholder="https://vk.com/..."
              onChange={(event) => change('vkUrl', event.target.value)}
            />
          </Field>
          <Field label="Telegram">
            <Input
              type="url"
              value={values.telegramUrl ?? ''}
              maxLength={2000}
              placeholder="https://t.me/..."
              onChange={(event) => change('telegramUrl', event.target.value)}
            />
          </Field>
          <Field label="WhatsApp">
            <Input
              type="url"
              value={values.whatsappUrl ?? ''}
              maxLength={2000}
              placeholder="https://wa.me/..."
              onChange={(event) => change('whatsappUrl', event.target.value)}
            />
          </Field>
        </SettingsGroup>

        <SettingsGroup
          title="Реквизиты и юридические ссылки"
          description="Документы хранятся вне сайта, поэтому укажите их полные внешние URL."
        >
          <Field label="Наименование ИП">
            <Input
              value={values.legalName ?? ''}
              maxLength={300}
              onChange={(event) => change('legalName', event.target.value)}
            />
          </Field>
          <Field label="ИНН">
            <Input
              value={values.inn ?? ''}
              maxLength={20}
              inputMode="numeric"
              onChange={(event) => change('inn', event.target.value)}
            />
          </Field>
          <Field label="Ссылка на политику обработки данных">
            <Input
              type="url"
              value={values.privacyPolicyUrl ?? ''}
              maxLength={2000}
              placeholder="https://..."
              onChange={(event) => change('privacyPolicyUrl', event.target.value)}
            />
          </Field>
          <Field label="Ссылка на cookie-политику">
            <Input
              type="url"
              value={values.cookiePolicyUrl ?? ''}
              maxLength={2000}
              placeholder="https://..."
              onChange={(event) => change('cookiePolicyUrl', event.target.value)}
            />
          </Field>
        </SettingsGroup>

        {error ? <Message>{error}</Message> : null}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cream-200 pt-6">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {savedAt ? `Сохранено ${formatDate(savedAt)}.` : 'Изменения сохраняются одной кнопкой.'}
          </p>
          <Button type="submit" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить настройки'}
          </Button>
        </div>
      </form>
    </section>
  );
}

const textareaClassName =
  'w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100';

function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-cream-200 bg-background p-5 shadow-soft sm:p-7">
      <h2 className="text-xl font-black text-teal-700">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-teal-700">
      {label}
      {children}
    </label>
  );
}

function Message({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-danger-100 p-4 text-sm font-bold text-danger-600">{children}</p>
  );
}

function toValues(settings: SiteSettingsDto): SiteSettingsValues {
  const { updatedAt: _updatedAt, ...values } = settings;
  return values;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(value),
  );
}
