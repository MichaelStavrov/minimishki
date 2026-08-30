import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <section
        aria-labelledby="not-found-heading"
        className="rounded-xl border bg-background p-6 shadow-sm"
      >
        <p className="text-sm font-bold text-coral-400">404</p>
        <h1 id="not-found-heading" className="mt-2 text-2xl font-extrabold">
          Такой страницы нет
        </h1>
        <p className="mt-3 text-teal-700">Возможно, ссылка устарела или адрес набран с ошибкой.</p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          На главную
        </Link>
      </section>
    </main>
  );
}
