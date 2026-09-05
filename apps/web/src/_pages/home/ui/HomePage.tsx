import { getHealth } from '../api/get-health';

export async function HomePage() {
  const health = await loadHealth();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-extrabold text-teal-700 sm:text-5xl">Минимишки</h1>
      <p className="mt-3 text-lg text-teal-700">Детский центр</p>

      <section
        aria-labelledby="api-status-heading"
        className="mt-10 rounded-xl border bg-background p-6 shadow-sm"
      >
        <h2 id="api-status-heading" className="text-xl font-bold">
          Состояние API
        </h2>

        {health ? (
          <p className="mt-3 text-teal-700">
            API и база данных доступны. Время работы: {health.uptime} сек.
          </p>
        ) : (
          <p className="mt-3 text-coral-400">
            API недоступен. Проверьте, что backend и база данных запущены.
          </p>
        )}
      </section>
    </main>
  );
}

async function loadHealth() {
  try {
    return await getHealth();
  } catch {
    return undefined;
  }
}
