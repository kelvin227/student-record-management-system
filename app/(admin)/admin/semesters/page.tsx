import { auth } from "@/auth";
import SemestersComp from "@/components/admin/semestersComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session =  await auth();
    if(!session){
        redirect("/");
    }
    return <SemestersComp />
}