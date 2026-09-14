-- Сохраняем уже созданные задания outbox и меняем их канал доставки на VK.
ALTER TYPE "NotificationChannel" RENAME VALUE 'TELEGRAM' TO 'VK';
