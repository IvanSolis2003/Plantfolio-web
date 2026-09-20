-- AlterTable
ALTER TABLE "collection_entries" ADD COLUMN     "photoDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];

-- Backfill: las fotos ya existentes no tienen fecha individual, se usa identifiedAt para todas
UPDATE "collection_entries"
SET "photoDates" = array_fill("identifiedAt", ARRAY[array_length("photos", 1)])
WHERE "photos" IS NOT NULL AND array_length("photos", 1) > 0;
