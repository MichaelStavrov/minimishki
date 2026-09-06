-- CreateTable
CREATE TABLE "PartyCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionHtml" TEXT,
    "priceType" "PriceType" NOT NULL,
    "amount" INTEGER,
    "priceUnit" TEXT,
    "priceNote" TEXT,
    "durationMinutes" INTEGER,
    "ageLabel" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartyCategory_slug_key" ON "PartyCategory"("slug");

-- CreateIndex
CREATE INDEX "PartyCategory_isPublished_sortOrder_idx" ON "PartyCategory"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "PartyItem_categoryId_isPublished_sortOrder_idx" ON "PartyItem"("categoryId", "isPublished", "sortOrder");

-- AddForeignKey
ALTER TABLE "PartyItem" ADD CONSTRAINT "PartyItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PartyCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
