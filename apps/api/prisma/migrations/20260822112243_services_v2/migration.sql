/*
  В старой модели находятся только временные демонстрационные данные:

  - таблица Course содержит 3 записи;
  - таблица _CourseToTeacher содержит 4 связи;
  - Lead.courseId будет заменён на Lead.serviceId.

  Реальные данные ещё не загружались. Новые демонстрационные услуги будут
  созданы обновлённым seed после применения миграции.
*/

-- Создание перечислений

CREATE TYPE "PriceType" AS ENUM (
    'FIXED',
    'FROM',
    'FREE',
    'INCLUDED',
    'ON_REQUEST'
);

CREATE TYPE "ScheduleType" AS ENUM (
    'RECURRING',
    'ON_REQUEST'
);

CREATE TYPE "DayOfWeek" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);

CREATE TYPE "AgeMode" AS ENUM (
    'INHERIT',
    'CUSTOM',
    'NONE'
);

-- Удаление внешних ключей старой модели

ALTER TABLE "Lead"
DROP CONSTRAINT "Lead_courseId_fkey";

ALTER TABLE "_CourseToTeacher"
DROP CONSTRAINT "_CourseToTeacher_A_fkey";

ALTER TABLE "_CourseToTeacher"
DROP CONSTRAINT "_CourseToTeacher_B_fkey";

-- Удаление индексов, которые заменяются индексами новой модели

DROP INDEX "GalleryItem_postId_sortOrder_idx";

DROP INDEX "Lead_courseId_idx";

-- Расширение модели галереи

ALTER TABLE "GalleryItem"
ADD COLUMN "caption" TEXT,
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "serviceId" TEXT;

-- Замена ссылки Course на Service в заявках

ALTER TABLE "Lead"
DROP COLUMN "courseId",
ADD COLUMN "serviceId" TEXT;

-- Удаление старой модели направлений

DROP TABLE "Course";

DROP TABLE "_CourseToTeacher";

-- Создание услуг

CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "contentHtml" TEXT NOT NULL,
    "ageFromMonths" INTEGER,
    "ageToMonths" INTEGER,
    "ageNote" TEXT,
    "coverUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "Service_age_range_check"
        CHECK (
            ("ageFromMonths" IS NULL OR "ageFromMonths" BETWEEN 0 AND 1440)
            AND
            ("ageToMonths" IS NULL OR "ageToMonths" BETWEEN 0 AND 1440)
            AND
            (
                "ageFromMonths" IS NULL
                OR "ageToMonths" IS NULL
                OR "ageFromMonths" <= "ageToMonths"
            )
        ),

    CONSTRAINT "Service_archived_publication_check"
        CHECK (
            "archivedAt" IS NULL
            OR "isPublished" = false
        )
);

-- Создание групп предложений

CREATE TABLE "ServiceOfferGroup" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionHtml" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOfferGroup_pkey"
        PRIMARY KEY ("id")
);

-- Создание тарифов и программ

CREATE TABLE "ServiceOffer" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionHtml" TEXT,
    "imageUrl" TEXT,
    "priceType" "PriceType" NOT NULL,
    "amount" INTEGER,
    "priceUnit" TEXT,
    "priceNote" TEXT,
    "durationMinutes" INTEGER,
    "ageMode" "AgeMode" NOT NULL DEFAULT 'INHERIT',
    "ageFromMonths" INTEGER,
    "ageToMonths" INTEGER,
    "ageNote" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOffer_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "ServiceOffer_price_check"
        CHECK (
            (
                "priceType" IN ('FIXED', 'FROM')
                AND "amount" IS NOT NULL
                AND "amount" > 0
            )
            OR
            (
                "priceType" IN ('FREE', 'INCLUDED', 'ON_REQUEST')
                AND "amount" IS NULL
            )
        ),

    CONSTRAINT "ServiceOffer_duration_check"
        CHECK (
            "durationMinutes" IS NULL
            OR "durationMinutes" > 0
        ),

    CONSTRAINT "ServiceOffer_age_check"
        CHECK (
            (
                "ageMode" = 'CUSTOM'
                AND
                (
                    "ageFromMonths" IS NOT NULL
                    OR "ageToMonths" IS NOT NULL
                )
                AND
                (
                    "ageFromMonths" IS NULL
                    OR "ageFromMonths" BETWEEN 0 AND 1440
                )
                AND
                (
                    "ageToMonths" IS NULL
                    OR "ageToMonths" BETWEEN 0 AND 1440
                )
                AND
                (
                    "ageFromMonths" IS NULL
                    OR "ageToMonths" IS NULL
                    OR "ageFromMonths" <= "ageToMonths"
                )
            )
            OR
            (
                "ageMode" IN ('INHERIT', 'NONE')
                AND "ageFromMonths" IS NULL
                AND "ageToMonths" IS NULL
            )
        )
);

-- Создание расписаний

CREATE TABLE "ServiceSchedule" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "daysOfWeek" "DayOfWeek"[] NOT NULL DEFAULT ARRAY[]::"DayOfWeek"[],
    "startTime" TEXT,
    "endTime" TEXT,
    "validFrom" DATE,
    "validUntil" DATE,
    "label" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceSchedule_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "ServiceSchedule_type_fields_check"
        CHECK (
            (
                "scheduleType" = 'RECURRING'
                AND cardinality("daysOfWeek") > 0
                AND "startTime" IS NOT NULL
                AND "endTime" IS NOT NULL
                AND "startTime" ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
                AND "endTime" ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
                AND "startTime" < "endTime"
            )
            OR
            (
                "scheduleType" = 'ON_REQUEST'
                AND cardinality("daysOfWeek") = 0
                AND "startTime" IS NULL
                AND "endTime" IS NULL
                AND "label" IS NOT NULL
                AND btrim("label") <> ''
            )
        ),

    CONSTRAINT "ServiceSchedule_validity_period_check"
        CHECK (
            "validFrom" IS NULL
            OR "validUntil" IS NULL
            OR "validFrom" <= "validUntil"
        )
);

-- Создание связи услуг с педагогами

CREATE TABLE "_ServiceToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceToTeacher_AB_pkey"
        PRIMARY KEY ("A", "B")
);

-- Ограничение владельца фотографии:
-- запись может относиться к новости, услуге либо общей галерее,
-- но не к новости и услуге одновременно

ALTER TABLE "GalleryItem"
ADD CONSTRAINT "GalleryItem_owner_check"
CHECK (
    NOT (
        "postId" IS NOT NULL
        AND "serviceId" IS NOT NULL
    )
);

-- Индексы услуг

CREATE UNIQUE INDEX "Service_slug_key"
ON "Service"("slug");

CREATE INDEX "Service_isPublished_archivedAt_sortOrder_idx"
ON "Service"("isPublished", "archivedAt", "sortOrder");

-- Индексы вложенных сущностей

CREATE INDEX "ServiceOfferGroup_serviceId_isPublished_sortOrder_idx"
ON "ServiceOfferGroup"("serviceId", "isPublished", "sortOrder");

CREATE INDEX "ServiceOffer_groupId_isPublished_sortOrder_idx"
ON "ServiceOffer"("groupId", "isPublished", "sortOrder");

CREATE INDEX "ServiceSchedule_serviceId_isPublished_sortOrder_idx"
ON "ServiceSchedule"("serviceId", "isPublished", "sortOrder");

-- Индекс обратной стороны связи услуг с педагогами

CREATE INDEX "_ServiceToTeacher_B_index"
ON "_ServiceToTeacher"("B");

-- Индексы галереи

CREATE INDEX "GalleryItem_postId_isPublished_sortOrder_idx"
ON "GalleryItem"("postId", "isPublished", "sortOrder");

CREATE INDEX "GalleryItem_serviceId_isPublished_sortOrder_idx"
ON "GalleryItem"("serviceId", "isPublished", "sortOrder");

CREATE INDEX "GalleryItem_isPublished_sortOrder_idx"
ON "GalleryItem"("isPublished", "sortOrder");

-- Индекс заявок по услуге

CREATE INDEX "Lead_serviceId_idx"
ON "Lead"("serviceId");

-- Внешние ключи вложенных сущностей услуги

ALTER TABLE "ServiceOfferGroup"
ADD CONSTRAINT "ServiceOfferGroup_serviceId_fkey"
FOREIGN KEY ("serviceId")
REFERENCES "Service"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "ServiceOffer"
ADD CONSTRAINT "ServiceOffer_groupId_fkey"
FOREIGN KEY ("groupId")
REFERENCES "ServiceOfferGroup"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "ServiceSchedule"
ADD CONSTRAINT "ServiceSchedule_serviceId_fkey"
FOREIGN KEY ("serviceId")
REFERENCES "Service"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Внешний ключ галереи:
-- удаление строки Service удаляет метаданные фотографии,
-- но не физический файл в хранилище

ALTER TABLE "GalleryItem"
ADD CONSTRAINT "GalleryItem_serviceId_fkey"
FOREIGN KEY ("serviceId")
REFERENCES "Service"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Заявка сохраняется при физическом удалении услуги

ALTER TABLE "Lead"
ADD CONSTRAINT "Lead_serviceId_fkey"
FOREIGN KEY ("serviceId")
REFERENCES "Service"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Внешние ключи связи услуг с педагогами

ALTER TABLE "_ServiceToTeacher"
ADD CONSTRAINT "_ServiceToTeacher_A_fkey"
FOREIGN KEY ("A")
REFERENCES "Service"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "_ServiceToTeacher"
ADD CONSTRAINT "_ServiceToTeacher_B_fkey"
FOREIGN KEY ("B")
REFERENCES "Teacher"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
