import { auth } from "@/auth";
import CourseRegistrationView from "@/components/students/registerationComp";
import SettingsView from "@/components/students/setttingsComp";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "STUDENT") {
    redirect("/students/login");
  }

  return <SettingsView/>
}
