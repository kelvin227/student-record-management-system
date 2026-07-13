import { auth } from "@/auth";
import StudentProfileView from "@/components/students/profileComp";
import TranscriptView from "@/components/students/transcriptComp";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "STUDENT") {
    redirect("/students/login");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      department: true,
      program: true,
      user: { select: { email: true } },
    },
  });

  const gpa = await prisma.gPARecord.findMany({
    where: { studentId: student?.id },
  });
  const score = await prisma.score.findMany({
    where: { studentId: student?.id },
    include: { course: true, session: true, semester:true },
  });
  return <TranscriptView student={student} records={gpa} scores={score} />;
}
