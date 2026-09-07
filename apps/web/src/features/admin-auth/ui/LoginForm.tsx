'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input } from '@/shared/ui';

import { login } from '../api/login';

const loginFormSchema = z.object({
  email: z.string().trim().email('Укажите корректный email.'),
  password: z.string().min(1, 'Введите пароль.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type Props = {
  nextPath: string;
};

export function LoginForm({ nextPath }: Props) {
  const router = useRouter();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginFormSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    const result = await login(values);

    if (result.error) {
      setError('root', { message: result.error });
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form
      className="grid gap-5"
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <div className="grid gap-2">
        <label className="text-sm font-extrabold text-teal-700" htmlFor="admin-email">
          Email
        </label>
        <Input
          id="admin-email"
          autoComplete="username"
          disabled={isSubmitting}
          inputMode="email"
          type="email"
          {...register('email')}
        />
        {errors.email?.message ? (
          <p className="text-sm font-bold text-danger-600">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-extrabold text-teal-700" htmlFor="admin-password">
          Пароль
        </label>
        <Input
          id="admin-password"
          autoComplete="current-password"
          disabled={isSubmitting}
          type="password"
          {...register('password')}
        />
        {errors.password?.message ? (
          <p className="text-sm font-bold text-danger-600">{errors.password.message}</p>
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
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  );
}
