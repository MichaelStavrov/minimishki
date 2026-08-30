export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Загрузка страницы"
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16"
    >
      <div className="h-12 w-52 animate-pulse rounded-md bg-cream-200" />
      <div className="mt-3 h-7 w-36 animate-pulse rounded-md bg-cream-100" />

      <div className="mt-10 rounded-xl border bg-background p-6 shadow-sm">
        <div className="h-7 w-40 animate-pulse rounded-md bg-cream-200" />
        <div className="mt-4 h-6 w-full animate-pulse rounded-md bg-cream-100" />
      </div>
    </main>
  );
}
