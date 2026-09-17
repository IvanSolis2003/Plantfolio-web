-- AlterTable
ALTER TABLE "collection_entries" ADD COLUMN     "ubicacionAprox" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "compartirPerfil" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ubicacionTexto" TEXT;
