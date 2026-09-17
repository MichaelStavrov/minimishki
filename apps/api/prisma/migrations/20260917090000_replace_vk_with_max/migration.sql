-- Сохраняем историю заданий outbox и заменяем недоступный VK на MAX.
ALTER TYPE "NotificationChannel" RENAME VALUE 'VK' TO 'MAX';
