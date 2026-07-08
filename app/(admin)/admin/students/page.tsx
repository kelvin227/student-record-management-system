import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentComp from "@/components/admin/studentComp"

export default async function Page() {
    const session = await auth();

    if(!session){
        redirect("/login");
    }

    return <StudentComp />;
    
}