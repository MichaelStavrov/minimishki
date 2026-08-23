-- Архивный педагог не может оставаться опубликованным
ALTER TABLE "Teacher"
ADD CONSTRAINT "Teacher_archived_publication_check"
CHECK (
    "archivedAt" IS NULL
    OR "isPublished" = false
);
