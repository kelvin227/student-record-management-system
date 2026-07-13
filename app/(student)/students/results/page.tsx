import { auth } from "@/auth";
import StudentProfileView from "@/components/students/profileComp";
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

  const result = await prisma.score.findMany({
    where: {studentId: student?.id},
    include:{course: true}
  })

  const Asession = await prisma.session.findMany({
    include: { semesters: true}
  })
  return <StudentResultView results={result} session={Asession} semesters={Asession.flatMap((session) => session.semesters)}/>
}
