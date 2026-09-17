-- AlterTable
ALTER TABLE "collection_entries" ADD COLUMN     "privado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aprobado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coleccionPrivada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerificado" TIMESTAMP(3),
ADD COLUMN     "esAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenExpira" TIMESTAMP(3),
ADD COLUMN     "tokenVerificacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_tokenVerificacion_key" ON "users"("tokenVerificacion");
