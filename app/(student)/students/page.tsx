import { auth } from "@/auth";
import StudentDashboard from "@/components/students/dashboardComp";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "STUDENT") {
    redirect("/students/signin");
  }
  return <StudentDashboard />
}
