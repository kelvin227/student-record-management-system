/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId,sessionId,semesterId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enteredById` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterId` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- DropIndex
DROP INDEX "Score_studentId_courseId_key";

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enteredById" TEXT NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "publishedById" TEXT,
ADD COLUMN     "registrationId" TEXT,
ADD COLUMN     "semesterId" TEXT NOT NULL,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Score_studentId_courseId_sessionId_semesterId_key" ON "Score"("studentId", "courseId", "sessionId", "semesterId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "CourseRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
