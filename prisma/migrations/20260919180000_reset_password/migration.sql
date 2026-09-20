-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tokenReset" TEXT,
ADD COLUMN     "tokenResetExpira" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_tokenReset_key" ON "users"("tokenReset");
