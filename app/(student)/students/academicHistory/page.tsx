import { auth } from "@/auth";
import AcademicHistoryView from "@/components/students/academicHistoryComp";
import CourseRegistrationView from "@/components/students/registerationComp";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "STUDENT") {
    redirect("/students/login");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id},
    include:{department:true, program: true, user: {select: {email: true}}}
  })

  const gpa = await prisma.gPARecord.findMany({
    where: { studentId: student?.id},
    include: {semester: true, session: true}
  })
  const totalCourseCount = await prisma.course.findMany({
    where: {departmentId: student?.departmentId, level: student?.level, semester: {isActive: true}, registrations: {some: {studentId: student?.id}},},
  })

  return <AcademicHistoryView records={gpa} />
}
