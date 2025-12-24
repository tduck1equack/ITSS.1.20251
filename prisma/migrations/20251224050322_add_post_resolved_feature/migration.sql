-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('vi', 'ja', 'en');

-- CreateEnum
CREATE TYPE "LocalizableEntity" AS ENUM ('CLASS', 'ASSIGNMENT', 'POST', 'LEARNING_MATERIAL', 'GROUP', 'NOTIFICATION_CATEGORY');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resolvedCommentId" TEXT;

-- CreateTable
CREATE TABLE "localizations" (
    "id" TEXT NOT NULL,
    "entityType" "LocalizableEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "localizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "localizations_entityType_entityId_idx" ON "localizations"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "localizations_locale_idx" ON "localizations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "localizations_entityType_entityId_locale_field_key" ON "localizations"("entityType", "entityId", "locale", "field");

-- CreateIndex
CREATE INDEX "posts_resolved_idx" ON "posts"("resolved");
