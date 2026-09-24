-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('GEMINI', 'GROK');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "freeFotoProduk" BOOLEAN NOT NULL DEFAULT false,
    "managementInstagram" BOOLEAN NOT NULL DEFAULT false,
    "managementTiktok" BOOLEAN NOT NULL DEFAULT false,
    "managementFacebook" BOOLEAN NOT NULL DEFAULT false,
    "videoReelsCount" INTEGER NOT NULL,
    "feedsDesignCount" INTEGER NOT NULL,
    "produksiVisit" TEXT NOT NULL,
    "professionalTallent" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsCondition" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "provider" "AiProvider" NOT NULL DEFAULT 'GEMINI',
    "apiKey" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
