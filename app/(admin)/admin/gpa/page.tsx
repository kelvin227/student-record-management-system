import { auth } from "@/auth";
import GPAManager from "@/components/admin/gpaComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session =  await auth();
    if(!session){
        redirect("/");
    }
    
    return <GPAManager />
}

