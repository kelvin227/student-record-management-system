/*
  Warnings:

  - A unique constraint covering the columns `[studentId,sessionId,semesterId]` on the table `GPARecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GPARecord_studentId_sessionId_semesterId_key" ON "GPARecord"("studentId", "sessionId", "semesterId");
