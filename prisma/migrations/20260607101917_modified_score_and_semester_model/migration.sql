/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionId,name]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Score_studentId_courseId_key" ON "Score"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_sessionId_name_key" ON "Semester"("sessionId", "name");
