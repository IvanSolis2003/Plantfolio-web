-- AlterTable
ALTER TABLE "collection_entries" ADD COLUMN     "lastWatered" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "plants" ADD COLUMN     "wateringFrequencyDays" INTEGER NOT NULL DEFAULT 7;
