-- AlterTable: agregar columna nueva
ALTER TABLE "collection_entries" ADD COLUMN "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: cada foto existente pasa a ser el primer elemento del array
UPDATE "collection_entries" SET "photos" = ARRAY["photoUrl"] WHERE "photoUrl" IS NOT NULL;

-- Quitar el default temporal y la columna vieja
ALTER TABLE "collection_entries" ALTER COLUMN "photos" DROP DEFAULT;
ALTER TABLE "collection_entries" DROP COLUMN "photoUrl";
