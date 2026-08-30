/** Ответ GET /api/health при доступности приложения и базы данных. */
export interface HealthDto {
  status: 'ok';
  database: 'up';
  /** Время работы процесса API в полных секундах. */
  uptime: number;
  /** Момент проверки в формате ISO 8601. */
  timestamp: string;
}
