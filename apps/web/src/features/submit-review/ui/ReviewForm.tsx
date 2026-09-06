'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@/shared/api';
import { Button, Input, Select } from '@/shared/ui';

import { createReview } from '../api/create-review';

const reviewFormSchema = z.object({
  name: z.string().trim().min(1, 'Введите ваше имя.').max(100, 'Имя слишком длинное.'),
  email: z.string().trim().email('Укажите корректный email.').max(254, 'Email слишком длинный.'),
  rating: z.string(),
  text: z.string().trim().min(1, 'Напишите текст отзыва.').max(5000, 'Отзыв слишком длинный.'),
  consent: z.boolean().refine((value) => value, 'Нужно согласие на обработку персональных данных.'),
  website: z.string(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const defaultValues: ReviewFormValues = {
  name: '',
  email: '',
  rating: '',
  text: '',
  consent: false,
  website: '',
};

export function ReviewForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ReviewFormValues>({ defaultValues, resolver: zodResolver(reviewFormSchema) });

  async function onSubmit(values: ReviewFormValues) {
    setIsSuccess(false);
    try {
      await createReview({
        name: values.name,
        email: values.email,
        rating: values.rating === '' ? null : Number(values.rating),
        text: values.text,
        consent: true,
        website: values.website,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      setError('root', {
        message:
          error instanceof ApiError
            ? error.message
            : 'Не удалось отправить отзыв. Попробуйте ещё раз немного позже.',
      });
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  if (isSuccess) {
    return (
      <div
        className="rounded-2xl border border-honey-400/50 bg-honey-100 p-6 text-teal-700"
        role="status"
      >
        <p className="text-xl font-black">Спасибо за отзыв!</p>
        <p className="mt-2 leading-7">Он появится на сайте после проверки сотрудником центра.</p>
        <Button
          type="button"
          variant="ghost"
          className="mt-4 px-0"
          onClick={() => {
            reset();
            setIsSuccess(false);
          }}
        >
          Оставить ещё один отзыв
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={submit}>
      <input
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
        {...register('website')}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={errors.name?.message} htmlFor="review-name" label="Ваше имя">
          <Input
            id="review-name"
            autoComplete="name"
            disabled={isSubmitting}
            maxLength={100}
            {...register('name')}
          />
        </Field>
        <Field error={errors.email?.message} htmlFor="review-email" label="Email">
          <Input
            id="review-email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            maxLength={254}
            {...register('email')}
          />
        </Field>
      </div>
      <Field error={errors.rating?.message} htmlFor="review-rating" label="Оценка (необязательно)">
        <Select id="review-rating" disabled={isSubmitting} {...register('rating')}>
          <option value="">Без оценки</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} из 5
            </option>
          ))}
        </Select>
      </Field>
      <Field error={errors.text?.message} htmlFor="review-text" label="Ваш отзыв">
        <textarea
          id="review-text"
          className="flex min-h-32 w-full resize-y rounded-xl border-2 border-input bg-background px-4 py-3 text-base text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
          maxLength={5000}
          placeholder="Расскажите, что вам понравилось или что можно улучшить"
          {...register('text')}
        />
      </Field>
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-teal-700">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-teal-600"
            disabled={isSubmitting}
            {...register('consent')}
          />
          <span>Согласен на обработку персональных данных для проверки и публикации отзыва.</span>
        </label>
        {errors.consent?.message ? (
          <p className="mt-2 text-sm font-bold text-danger-600" role="alert">
            {errors.consent.message}
          </p>
        ) : null}
      </div>
      {errors.root?.message ? (
        <p
          className="rounded-xl bg-danger-100 px-4 py-3 text-sm font-bold text-danger-600"
          role="alert"
        >
          {errors.root.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="justify-self-start" disabled={isSubmitting}>
        {isSubmitting ? 'Отправляем…' : 'Отправить отзыв'}
      </Button>
    </form>
  );
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-extrabold text-teal-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm font-bold text-danger-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
