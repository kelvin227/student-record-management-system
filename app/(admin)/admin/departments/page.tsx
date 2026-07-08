import { auth } from "@/auth";
import DepartmentComp from "@/components/admin/departmentComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session = await auth();
    if(!session){
        redirect("/");
    }
    return <DepartmentComp />
}