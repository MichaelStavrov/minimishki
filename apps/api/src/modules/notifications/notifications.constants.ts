export const NOTIFICATION_MAX_ATTEMPTS = 5;
export const NOTIFICATION_POLL_INTERVAL_MS = 15_000;
export const NOTIFICATION_LOCK_TIMEOUT_MS = 5 * 60_000;
export const NOTIFICATION_BATCH_SIZE = 10;

/** Задержка до следующей попытки после первой, второй и последующих ошибок. */
export const NOTIFICATION_RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000];
