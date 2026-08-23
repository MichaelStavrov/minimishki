-- DropIndex
DROP INDEX "Teacher_isPublished_sortOrder_idx";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Teacher_isPublished_archivedAt_sortOrder_idx" ON "Teacher"("isPublished", "archivedAt", "sortOrder");
