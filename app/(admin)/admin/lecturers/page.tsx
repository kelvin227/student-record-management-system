import { auth } from "@/auth";
import LecturerComp from "@/components/admin/lecturerComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session =  await auth();
    if(!session){
        redirect("/");
    }
    return <LecturerComp/>
}