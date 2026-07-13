"use client"
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpenCheck,
  Users,
  ClipboardList,
  History,
  UserCircle,
  FileCheck2,
  FileText,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const StudentMenu = [
  {
    icon: LayoutDashboard, label: "Dashboard", href: "/students/" 
  },
    {
  icon: UserCircle, label: "Profile", href: "/students/Sprofile" 
  },
  {
    icon: BookOpenCheck, label: "Course registration", href: "/students/courseRegistration"
  },
    {
    icon: BookOpenCheck, label: "registered-Courses", href: "/students/registeredCourse"
  },
    {
    icon: BookOpenCheck, label: "Results", href: "/students/results"
  },
    {
    icon: BookOpenCheck, label: "academic-history", href: "/students/academicHistory"
  },
    {
    icon: BookOpenCheck, label: "Transcript", href: "/students/transcript" 
  },
    {
    icon: BookOpenCheck, label: "Notifications", href: "/lecturer/courses"
  },
    {
    icon: BookOpenCheck, label: "Settings", href: "/students/settings"
  },

];

export default function StudentSideBar() {
  const pathname = usePathname();
  const[show, setShow] = useState(true);

  useEffect(() =>{
    if(pathname.includes("/login")){
      setShow(false);
    }else{
      setShow(true);
    }
    
  }, [pathname])
  return show ? (
    <aside className={"sticky top-0 h-screen w-64 border-r border-zinc-200 overflow-y-auto"}>
      <div className="p-6">
        <h1 className="text-xl font-bold text-emerald-100 light:text-emerald-900">Student Portal</h1>
      </div>

      <nav className="px-4 pb-6 space-y-6">
        {StudentMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 light:text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              }
        )}
      </nav>
    </aside>
  ): (
    <></>
  )
}