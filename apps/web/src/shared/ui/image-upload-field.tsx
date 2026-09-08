'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Button } from './button';
import { Input } from './input';

type Props = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File | null) => void;
};

/** Универсальное поле для загрузки изображения с сохранением возможности указать внешний URL. */
export function ImageUploadField({ label, value, placeholder, onChange, onFileChange }: Props) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  useEffect(() => {
    if (!value) setPreviewUrl(null);
  }, [value]);

  function selectFile(file?: File) {
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    onFileChange?.(file);
    if (input.current) input.current.value = '';
  }

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-bold text-teal-700">
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        <Input
          className="min-w-0 flex-1"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            setPreviewUrl(null);
            onFileChange?.(null);
            onChange(event.target.value);
          }}
        />
        <input
          ref={input}
          id={inputId}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <Button type="button" variant="outline" onClick={() => input.current?.click()}>
          Выбрать файл
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        JPEG, PNG или WebP, до 10 МБ. Файл загрузится при сохранении формы; можно вставить URL
        вручную.
      </p>
      {previewUrl || value ? (
        <img
          className="max-h-56 rounded-xl border border-cream-200 object-contain"
          src={previewUrl ?? value}
          alt="Предпросмотр выбранного изображения"
        />
      ) : null}
    </div>
  );
}
