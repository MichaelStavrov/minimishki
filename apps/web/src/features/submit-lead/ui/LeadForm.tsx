'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { ServiceDto } from '@minimishki/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { IMaskInput } from 'react-imask';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@/shared/api';
import { Button, Input, Select } from '@/shared/ui';

import { createLead } from '../api/create-lead';

const leadFormSchema = z.object({
  name: z.string().trim().min(1, 'Введите ваше имя.').max(200, 'Имя слишком длинное.'),
  phone: z.string().regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите номер полностью.'),
  childName: z.string().trim().max(200, 'Имя ребёнка слишком длинное.'),
  childAge: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= 18),
      'Укажите целый возраст от 0 до 18 лет.',
    ),
  serviceId: z.string(),
  comment: z.string().trim().max(5000, 'Комментарий слишком длинный.'),
  consent: z.boolean().refine((value) => value, 'Нужно согласие на обработку персональных данных.'),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type LeadFormProps = {
  services: Pick<ServiceDto, 'id' | 'title'>[];
};

const defaultValues: LeadFormValues = {
  name: '',
  phone: '',
  childName: '',
  childAge: '',
  serviceId: '',
  comment: '',
  consent: false,
};

export function LeadForm({ services }: LeadFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (window.location.hash !== '#lead') {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      document.getElementById('lead')?.scrollIntoView({
        block: 'start',
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<LeadFormValues>({
    defaultValues,
    resolver: zodResolver(leadFormSchema),
  });

  async function onSubmit(values: LeadFormValues) {
    setIsSuccess(false);

    try {
      await createLead({
        name: values.name,
        phone: values.phone,
        childName: toNullableText(values.childName),
        childAge: values.childAge === '' ? null : Number(values.childAge),
        comment: toNullableText(values.comment),
        serviceId: toNullableText(values.serviceId),
        consent: true,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      setError('root', {
        message:
          error instanceof ApiError
            ? error.message
            : 'Не удалось отправить заявку. Попробуйте ещё раз немного позже.',
      });
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  if (isSuccess) {
    return (
      <div
        className="rounded-2xl border border-honey-400/50 bg-honey-100 p-6 text-teal-700"
        role="status"
      >
        <p className="text-xl font-black">Заявка отправлена!</p>
        <p className="mt-2 leading-7">Скоро свяжемся с вами и поможем выбрать подходящий формат.</p>
        <Button
          type="button"
          variant="ghost"
          className="mt-4 px-0"
          onClick={() => {
            reset();
            setIsSuccess(false);
          }}
        >
          Отправить ещё одну заявку
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleFormSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.name?.message} htmlFor="lead-name" label="Ваше имя">
          <Input
            id="lead-name"
            autoComplete="name"
            aria-invalid={errors.name !== undefined}
            disabled={isSubmitting}
            maxLength={200}
            {...register('name')}
          />
        </FormField>

        <FormField error={errors.phone?.message} htmlFor="lead-phone" label="Телефон">
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <IMaskInput
                id="lead-phone"
                mask="+{7} (000) 000-00-00"
                lazy={false}
                placeholderChar="_"
                inputRef={field.ref}
                value={field.value}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={errors.phone !== undefined}
                disabled={isSubmitting}
                className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-base text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:ring-danger-100"
                onAccept={(value) => field.onChange(value)}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.childName?.message} htmlFor="lead-child-name" label="Имя ребёнка">
          <Input
            id="lead-child-name"
            autoComplete="off"
            aria-invalid={errors.childName !== undefined}
            disabled={isSubmitting}
            maxLength={200}
            {...register('childName')}
          />
        </FormField>

        <FormField
          error={errors.childAge?.message}
          htmlFor="lead-child-age"
          label="Возраст ребёнка"
        >
          <Input
            id="lead-child-age"
            type="number"
            inputMode="numeric"
            min="0"
            max="18"
            aria-invalid={errors.childAge !== undefined}
            disabled={isSubmitting}
            {...register('childAge')}
          />
        </FormField>
      </div>

      <FormField
        error={errors.serviceId?.message}
        htmlFor="lead-service"
        label="Интересующее направление"
      >
        <Select id="lead-service" disabled={isSubmitting} {...register('serviceId')}>
          <option value="">Помогите выбрать</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField error={errors.comment?.message} htmlFor="lead-comment" label="Комментарий">
        <textarea
          id="lead-comment"
          className="flex min-h-28 w-full resize-y rounded-xl border-2 border-input bg-background px-4 py-3 text-base text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:ring-danger-100"
          disabled={isSubmitting}
          maxLength={5000}
          placeholder="Например, когда вам удобно прийти или что особенно интересно ребёнку"
          {...register('comment')}
        />
      </FormField>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-teal-700">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-teal-600"
            disabled={isSubmitting}
            {...register('consent')}
          />
          <span>
            Согласен на обработку персональных данных для связи по заявке согласно{' '}
            <Link
              className="font-bold underline decoration-coral-400 decoration-2 underline-offset-4"
              href="/privacy"
            >
              Политике обработки данных
            </Link>
            .
          </span>
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
        {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
      </Button>
    </form>
  );
}

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
};

function FormField({ children, error, htmlFor, label }: FormFieldProps) {
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

function toNullableText(value: string): string | null {
  return value === '' ? null : value;
}
