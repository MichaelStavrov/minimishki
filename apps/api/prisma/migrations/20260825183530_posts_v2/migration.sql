-- Переименовываем заполненный столбец без удаления существующего содержимого.
ALTER TABLE "Post"
RENAME COLUMN "content" TO "contentHtml";

-- Добавляем необязательные параметры разового события.
ALTER TABLE "Post"
ADD COLUMN "ageLabel" TEXT,
ADD COLUMN "eventEndsAt" TIMESTAMP(3),
ADD COLUMN "eventStartsAt" TIMESTAMP(3),
ADD COLUMN "priceLabel" TEXT,
ADD COLUMN "registrationLabel" TEXT,
ADD COLUMN "registrationUrl" TEXT;

-- Опубликованная запись обязана иметь дату публикации.
ALTER TABLE "Post"
ADD CONSTRAINT "Post_publication_date_check"
CHECK (NOT "isPublished" OR "publishedAt" IS NOT NULL);

-- Окончание события допустимо только при наличии начала и должно быть позже него.
ALTER TABLE "Post"
ADD CONSTRAINT "Post_event_period_check"
CHECK (
  "eventEndsAt" IS NULL
  OR (
    "eventStartsAt" IS NOT NULL
    AND "eventEndsAt" > "eventStartsAt"
  )
);
