import { auth } from "@/auth";
import StudentLogin from "@/components/students/loginComp";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();
    
      // Guard access to 'user' to avoid TS errors when session has an unexpected type
      if (session || (session as any)?.user?.role === "STUDENT") {
        redirect("/students");
      }
    return <StudentLogin />
}