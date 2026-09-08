-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "workingHours" TEXT,
    "vkUrl" TEXT,
    "telegramUrl" TEXT,
    "whatsappUrl" TEXT,
    "legalName" TEXT,
    "inn" TEXT,
    "privacyPolicyUrl" TEXT,
    "cookiePolicyUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
