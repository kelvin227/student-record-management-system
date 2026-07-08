import { auth } from "@/auth";
import LecturerProfile from "@/components/lecturer/profileComp";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "LECTURER") {
    redirect("/signin");
  }
  return <LecturerProfile />
}
