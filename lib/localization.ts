/**
 * Database Localization Utilities
 * 
 * This module provides helper functions for working with the Localization table
 * to support multi-language content for database entities.
 * 
 * Usage example:
 * 
 * // Creating localized content
 * await setLocalizedField(prisma, 'CLASS', classId, 'vi', 'name', 'Lập trình Java');
 * await setLocalizedField(prisma, 'CLASS', classId, 'ja', 'name', 'Javaプログラミング');
 * 
 * // Retrieving localized content
 * const className = await getLocalizedField(prisma, 'CLASS', classId, 'ja', 'name', 'Default Name');
 * 
 * // Getting all localizations for an entity
 * const allLocalizations = await getAllLocalizations(prisma, 'CLASS', classId, 'ja');
 */

import { PrismaClient, Locale, LocalizableEntity } from '../prisma/generated/client';

type LocaleType = 'vi' | 'ja' | 'en';

/**
 * Set a localized field value for an entity
 */
export async function setLocalizedField(
  prisma: PrismaClient,
  entityType: LocalizableEntity,
  entityId: string,
  locale: LocaleType,
  field: string,
  value: string
): Promise<void> {
  await prisma.localization.upsert({
    where: {
      entityType_entityId_locale_field: {
        entityType,
        entityId,
        locale: locale as Locale,
        field,
      },
    },
    update: {
      value,
      updatedAt: new Date(),
    },
    create: {
      entityType,
      entityId,
      locale: locale as Locale,
      field,
      value,
    },
  });
}

/**
 * Get a localized field value for an entity
 * Falls back to defaultValue if not found
 */
export async function getLocalizedField(
  prisma: PrismaClient,
  entityType: LocalizableEntity,
  entityId: string,
  locale: LocaleType,
  field: string,
  defaultValue?: string
): Promise<string | null> {
  const localization = await prisma.localization.findUnique({
    where: {
      entityType_entityId_locale_field: {
        entityType,
        entityId,
        locale: locale as Locale,
        field,
      },
    },
  });

  return localization?.value ?? defaultValue ?? null;
}

/**
 * Get all localized fields for an entity in a specific locale
 * Returns a key-value object of field names to their localized values
 */
export async function getAllLocalizations(
  prisma: PrismaClient,
  entityType: LocalizableEntity,
  entityId: string,
  locale: LocaleType
): Promise<Record<string, string>> {
  const localizations = await prisma.localization.findMany({
    where: {
      entityType,
      entityId,
      locale: locale as Locale,
    },
  });

  return localizations.reduce((acc, loc) => {
    acc[loc.field] = loc.value;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Delete all localizations for an entity
 * Useful when deleting an entity
 */
export async function deleteAllLocalizations(
  prisma: PrismaClient,
  entityType: LocalizableEntity,
  entityId: string
): Promise<void> {
  await prisma.localization.deleteMany({
    where: {
      entityType,
      entityId,
    },
  });
}

/**
 * Batch set multiple localized fields at once
 */
export async function setLocalizedFields(
  prisma: PrismaClient,
  entityType: LocalizableEntity,
  entityId: string,
  locale: LocaleType,
  fields: Record<string, string>
): Promise<void> {
  const operations = Object.entries(fields).map(([field, value]) =>
    setLocalizedField(prisma, entityType, entityId, locale, field, value)
  );

  await Promise.all(operations);
}

/**
 * Helper to merge localized fields into an entity object
 * 
 * Example:
 * const classData = await prisma.class.findUnique({ where: { id } });
 * const localized = await mergeLocalizedFields(prisma, 'CLASS', classData, locale, ['name', 'description']);
 * // localized will have name and description in the specified locale if available
 */
export async function mergeLocalizedFields<T extends { id: string }>(
  prisma: PrismaClient,
  entityType: LocalizableEntity,
  entity: T,
  locale: LocaleType,
  fields: string[]
): Promise<T> {
  const localizations = await getAllLocalizations(
    prisma,
    entityType,
    entity.id,
    locale
  );

  const merged = { ...entity };
  for (const field of fields) {
    if (localizations[field]) {
      (merged as any)[field] = localizations[field];
    }
  }

  return merged;
}
