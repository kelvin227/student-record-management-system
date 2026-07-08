import { auth } from "@/auth";
import SubmittedResultComp from "@/components/lecturer/submittedResultComp";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || session?.user.role !== "LECTURER") {
    redirect("/login");
  }

  return <SubmittedResultComp />
}
