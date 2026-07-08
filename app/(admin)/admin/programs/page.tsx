import { auth } from "@/auth";
import { ProgramComponent } from "@/components/admin/programComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session =  await auth();
    if(!session){
        redirect("/");
    }
    return <ProgramComponent/>
}