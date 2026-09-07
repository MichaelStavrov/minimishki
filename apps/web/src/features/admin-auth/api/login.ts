export type AdminLoginValues = {
  email: string;
  password: string;
};

export type AdminLoginResult = {
  error?: string;
};

/** Отправляет пароль только same-origin BFF; JWT в ответ браузеру не попадает. */
export async function login(values: AdminLoginValues): Promise<AdminLoginResult> {
  const response = await fetch('/api/admin-auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  if (response.ok) {
    return {};
  }

  const body: unknown = await response.json().catch(() => undefined);
  return { error: getErrorMessage(body) };
}

function getErrorMessage(body: unknown): string {
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return 'Не удалось войти. Попробуйте ещё раз.';
  }

  const { message } = body;
  if (typeof message === 'string') {
    return message;
  }

  return 'Не удалось войти. Попробуйте ещё раз.';
}
