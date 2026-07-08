import { auth } from "@/auth";
import SessionComponent from "@/components/admin/sessionComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session =  await auth();
    if(!session){
        redirect("/login");
    }
    const userId = session?.user.id
    return <SessionComponent userId={userId}/>
}