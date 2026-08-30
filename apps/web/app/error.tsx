'use client';

type ErrorPageProps = {
  reset: () => void;
};

export default function Error({ reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <section
        aria-labelledby="error-heading"
        aria-live="assertive"
        className="rounded-xl border bg-background p-6 shadow-sm"
      >
        <h1 id="error-heading" className="text-2xl font-extrabold">
          Не удалось открыть страницу
        </h1>
        <p className="mt-3 text-teal-700">Попробуйте загрузить её ещё раз.</p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Повторить попытку
        </button>
      </section>
    </main>
  );
}
