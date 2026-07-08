import { auth } from "@/auth";
import CourseManagementComp from "@/components/admin/courseManagementComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session = await auth();
    if(!session){
        redirect("/login");
    }
    return <CourseManagementComp />
}