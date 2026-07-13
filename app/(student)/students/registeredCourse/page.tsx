import { auth } from "@/auth";
import { CourseRegistration } from "@/components/admin/courseRegistrationComp";
import StudentProfileView from "@/components/students/profileComp";
import RegisteredCoursesView from "@/components/students/registeredCourseComp";
import StudentResultView from "@/components/students/resultComp";
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

  const registeredCourse = await prisma.courseRegistration.findMany({
    where: {studentId: student?.id},
    include:{course: { include: {semester: true}}, session: true, semester: true}
  })

  return <RegisteredCoursesView registrations={registeredCourse}/>
}
