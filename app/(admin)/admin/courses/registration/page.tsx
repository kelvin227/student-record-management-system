import { auth } from "@/auth";
import CourseRegistrationComp from "@/components/admin/courseRegistrationComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session = await auth();
    if(!session){
        redirect("/");
    }
    return <CourseRegistrationComp />
}