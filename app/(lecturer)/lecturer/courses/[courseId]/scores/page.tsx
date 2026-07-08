import { auth } from "@/auth";
import ScoreEntryPanel from "@/components/lecturer/scoresCom";
import { redirect } from "next/navigation";

export type Course = {
  id: string
  code: string
  title: string
  creditUnit: number
  level: number
  semester: {
    id: string
    name: string
  }
  departmentId: string
  allocations?: { id: string; lecturerId: string }[]
  registrationsCount?: number // number of students registered for the course
}

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "LECTURER") {
    redirect("/signin");
  }

  return <ScoreEntryPanel />
}
