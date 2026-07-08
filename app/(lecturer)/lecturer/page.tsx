import { auth } from "@/auth";
import LecturerDashboard from "@/components/lecturer/dashboardComp";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "LECTURER") {
    redirect("/login");
  }
  return <LecturerDashboard />
}
