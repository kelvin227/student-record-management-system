import { auth } from "@/auth";
import CourseAllocationComp from "@/components/admin/courseAllocationComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session = await auth();
    if(!session){
        redirect("/");
    }
    return <CourseAllocationComp />
}