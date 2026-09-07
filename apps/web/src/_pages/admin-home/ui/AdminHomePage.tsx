import type { UserDto } from '@minimishki/shared';

type Props = {
  user: UserDto;
};

export function AdminHomePage({ user }: Props) {
  return (
    <section className="max-w-2xl">
      <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">Админка</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-teal-700 sm:text-5xl">
        Здравствуйте, {user.name}
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">
        Вход защищён. Следующим шагом здесь появится очередь заявок и управление контентом.
      </p>
    </section>
  );
}
