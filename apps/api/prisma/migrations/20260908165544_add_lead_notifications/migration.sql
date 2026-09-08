-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('TELEGRAM', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('LEAD_CREATED_STAFF', 'LEAD_CREATED_PARENT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "NotificationJob" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "recipient" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationJob_status_nextAttemptAt_idx" ON "NotificationJob"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "NotificationJob_leadId_createdAt_idx" ON "NotificationJob"("leadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationJob_leadId_channel_kind_key" ON "NotificationJob"("leadId", "channel", "kind");

-- AddForeignKey
ALTER TABLE "NotificationJob" ADD CONSTRAINT "NotificationJob_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
