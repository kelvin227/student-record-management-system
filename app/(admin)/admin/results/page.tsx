import { auth } from "@/auth";
import ResultComp from "@/components/admin/resultComp";
import { redirect } from "next/navigation";

export default async function Page(){
    const session = await auth();

    if(!session){
        redirect("/");
    }
    return <ResultComp userId={session?.user?.id as string}/>;
}