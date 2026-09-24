-- CreateEnum
CREATE TYPE "PortfolioCategory" AS ENUM ('PHOTOGRAPHY', 'VIDEOGRAPHY', 'CONTENT_CREATION', 'SOCIAL_MEDIA_MANAGEMENT');

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "PortfolioCategory" NOT NULL,
    "clientName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverColor" TEXT NOT NULL DEFAULT '#B42424',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);
