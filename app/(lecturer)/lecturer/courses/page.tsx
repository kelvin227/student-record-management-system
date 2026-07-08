import { auth } from "@/auth";
import CourseManagement from "@/components/lecturer/courseComp";
import CourseComp from "@/components/lecturer/courseComp";
import { prisma } from "@/lib/db";
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
    redirect("/login");
  }


  
  return <CourseManagement />
}
