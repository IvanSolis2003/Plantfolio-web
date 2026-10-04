-- CreateTable
CREATE TABLE "intentos" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intentos_clave_createdAt_idx" ON "intentos"("clave", "createdAt");
