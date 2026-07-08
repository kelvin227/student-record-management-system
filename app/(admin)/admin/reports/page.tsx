import { auth } from "@/auth";
import ReportComp from "@/components/admin/reportComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session = await auth();

    if(!session){
        redirect("/login");
    }
    return <ReportComp />;
}