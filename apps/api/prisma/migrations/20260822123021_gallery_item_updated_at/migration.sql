/*
  GalleryItem уже содержит записи, поэтому обязательную колонку нельзя
  добавить одним ALTER TABLE без начального значения.

  Миграция выполняется в три этапа:
  1. создаёт nullable-колонку;
  2. использует createdAt как исходное время последнего изменения;
  3. запрещает null для новых и существующих записей.
*/

ALTER TABLE "GalleryItem"
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "GalleryItem"
SET "updatedAt" = "createdAt";

ALTER TABLE "GalleryItem"
ALTER COLUMN "updatedAt" SET NOT NULL;
