-- CreateTable
CREATE TABLE "CourseAllocation" (
    "id" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseAllocation_lecturerId_courseId_key" ON "CourseAllocation"("lecturerId", "courseId");

-- AddForeignKey
ALTER TABLE "CourseAllocation" ADD CONSTRAINT "CourseAllocation_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAllocation" ADD CONSTRAINT "CourseAllocation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
