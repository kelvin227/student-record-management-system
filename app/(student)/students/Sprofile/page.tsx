import { auth } from "@/auth";
import StudentProfileView from "@/components/students/profileComp";
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
  return <StudentProfileView student={student} />
}
