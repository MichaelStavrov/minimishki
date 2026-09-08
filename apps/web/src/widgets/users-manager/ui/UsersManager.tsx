'use client';

import { useState, type FormEvent } from 'react';
import { ROLE, type Role, type UserDto } from '@minimishki/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { createUser, getAdminUsers, updateUserRole, type CreateUserValues } from '@/entities/user';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/shared/ui';

const blank = (): CreateUserValues => ({
  email: '',
  name: '',
  password: '',
  role: ROLE.MANAGER,
});

const roleLabels: Record<Role, string> = {
  [ROLE.MANAGER]: 'Менеджер — полный доступ',
  [ROLE.ADMIN]: 'Администратор — заявки и контент',
  [ROLE.USER]: 'Пользователь — без доступа к админке',
};

export function UsersManager() {
  const client = useQueryClient();
  const [role, setRole] = useState<Role | 'ALL'>('ALL');
  const [creating, setCreating] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const list = useQuery({
    queryKey: ['admin-users', role],
    queryFn: () =>
      getAdminUsers({ page: 1, pageSize: 100, role: role === 'ALL' ? undefined : role }),
  });

  async function changed() {
    await client.invalidateQueries({ queryKey: ['admin-users'] });
  }

  async function changeRole(user: UserDto, nextRole: Role) {
    if (user.role === nextRole) return;

    setError('');
    setChangingId(user.id);
    try {
      await updateUserRole(user.id, nextRole);
      await changed();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось изменить роль пользователя.');
    } finally {
      setChangingId(null);
    }
  }

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-cream-200 pb-8">
        <div>
          <p className="text-sm font-black tracking-[.14em] text-coral-400 uppercase">Админка</p>
          <h1 className="mt-2 text-4xl font-black text-teal-700">Пользователи</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Менеджер имеет полный доступ к приложению. Администратор обрабатывает заявки и управляет
            контентом, но не может менять учётные записи.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>Создать пользователя</Button>
      </header>

      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-cream-200 bg-background p-4">
        <label className="grid gap-1 text-sm font-bold text-teal-700">
          Роль
          <select
            className="h-11 rounded-xl border-2 border-input bg-background px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            value={role}
            onChange={(event) => setRole(event.target.value as Role | 'ALL')}
          >
            <option value="ALL">Все роли</option>
            {Object.values(ROLE).map((item) => (
              <option key={item} value={item}>
                {roleLabels[item]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {list.isLoading ? <p className="mt-6">Загружаем пользователей…</p> : null}
      {list.isError ? <Message>Не удалось загрузить пользователей.</Message> : null}
      {error ? <Message>{error}</Message> : null}
      <div className="mt-6 grid gap-4">
        {list.data?.items.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            changing={changingId === user.id}
            onChangeRole={(nextRole) => void changeRole(user, nextRole)}
          />
        ))}
      </div>
      {list.data?.items.length === 0 ? (
        <p className="border-cream-300 mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Пользователей с выбранной ролью пока нет.
        </p>
      ) : null}
      <CreateUserDialog open={creating} onClose={() => setCreating(false)} onCreated={changed} />
    </section>
  );
}

function UserCard({
  user,
  changing,
  onChangeRole,
}: {
  user: UserDto;
  changing: boolean;
  onChangeRole: (role: Role) => void;
}) {
  return (
    <article className="flex flex-wrap items-end justify-between gap-5 rounded-2xl border border-cream-200 bg-background p-5 shadow-soft">
      <div>
        <h2 className="text-lg font-black text-teal-700">{user.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-3 text-xs font-bold text-muted-foreground">
          Создан: {formatDate(user.createdAt)}
        </p>
      </div>
      <label className="grid min-w-64 gap-1 text-sm font-bold text-teal-700">
        Роль
        <select
          className="h-11 rounded-xl border-2 border-input bg-background px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-wait disabled:opacity-60"
          value={user.role}
          disabled={changing}
          onChange={(event) => onChangeRole(event.target.value as Role)}
        >
          {Object.values(ROLE).map((item) => (
            <option key={item} value={item}>
              {roleLabels[item]}
            </option>
          ))}
        </select>
        {changing ? <span className="text-xs text-muted-foreground">Сохраняем роль…</span> : null}
      </label>
    </article>
  );
}

function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [values, setValues] = useState<CreateUserValues>(blank);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function change<Key extends keyof CreateUserValues>(key: Key, value: CreateUserValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createUser({
        email: values.email.trim(),
        name: values.name.trim(),
        password: values.password,
        role: values.role,
      });
      await onCreated();
      setValues(blank());
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать пользователя.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !saving) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
          <DialogDescription>
            Выберите роль перед созданием. Её можно изменить и позднее из списка.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={(event) => void save(event)}>
          <Field label="Имя">
            <Input
              required
              minLength={2}
              maxLength={100}
              value={values.name}
              onChange={(event) => change('name', event.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              required
              type="email"
              value={values.email}
              onChange={(event) => change('email', event.target.value)}
            />
          </Field>
          <Field label="Временный пароль">
            <Input
              required
              type="password"
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => change('password', event.target.value)}
            />
          </Field>
          <Field label="Роль">
            <select
              className="h-11 rounded-xl border-2 border-input bg-background px-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={values.role}
              onChange={(event) => change('role', event.target.value as Role)}
            >
              {Object.values(ROLE).map((item) => (
                <option key={item} value={item}>
                  {roleLabels[item]}
                </option>
              ))}
            </select>
          </Field>
          {error ? <Message>{error}</Message> : null}
          <div className="flex justify-end gap-3 border-t border-cream-200 pt-5">
            <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Создаём…' : 'Создать пользователя'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
    <p className="mt-6 rounded-xl bg-danger-100 p-4 text-sm font-bold text-danger-600">
      {children}
    </p>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(new Date(value));
}
