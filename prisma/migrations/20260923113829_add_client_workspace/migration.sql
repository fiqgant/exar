-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('REELS', 'FEED', 'STORY', 'CAROUSEL', 'VIDEO');

-- CreateEnum
CREATE TYPE "ContentPlatform" AS ENUM ('INSTAGRAM', 'TIKTOK', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REVISION', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'CONVERTED');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "packageId" TEXT,
    "packageName" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "value" INTEGER NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "remindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ContentType" NOT NULL DEFAULT 'REELS',
    "platform" "ContentPlatform" NOT NULL DEFAULT 'INSTAGRAM',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "strategy" TEXT NOT NULL DEFAULT '',
    "previewColor" TEXT NOT NULL DEFAULT '#B42424',
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "actor" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "followUp" TEXT,
    "potentialValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_profileId_key" ON "Client"("profileId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
