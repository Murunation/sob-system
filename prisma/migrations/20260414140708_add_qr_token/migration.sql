-- CreateTable
CREATE TABLE "QrToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrToken_token_key" ON "QrToken"("token");

-- CreateIndex
CREATE INDEX "QrToken_token_idx" ON "QrToken"("token");

-- CreateIndex
CREATE INDEX "QrToken_teacherId_date_idx" ON "QrToken"("teacherId", "date");

-- AddForeignKey
ALTER TABLE "QrToken" ADD CONSTRAINT "QrToken_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
