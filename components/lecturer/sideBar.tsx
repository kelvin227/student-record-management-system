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

const lecturerMenu = [
  {
    section: "Dashboard",
    items: [{ icon: LayoutDashboard, label: "Dashboard", href: "/lecturer/" }],
  },
  {
    section: "Academic",
    items: [{ icon: BookOpenCheck, label: "Assigned Courses", href: "/lecturer/courses" }],
  },
  // {
  //   section: "Students",
  //   items: [{ icon: Users, label: "Course Students", href: "/lecturer/students" }],
  // },
  {
    section: "Results",
    items: [
      { icon: UploadCloud, label: "Draft Results", href: "/lecturer/results/drafts" },
      { icon: FileText, label: "Submitted Results", href: "/lecturer/results/submitted" },
      { icon: CheckCircle2, label: "Published Results", href: "/lecturer/results/published" },
    ],
  },
  // {
  //   section: "History",
  //   items: [{ icon: History, label: "Academic History", href: "/lecturer/history" }],
  // },
  {
    section: "Account",
    items: [{ icon: UserCircle, label: "Profile", href: "/lecturer/profile" }],
  },
];

export default function LecturerSideBar() {
  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-zinc-200 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-emerald-100 light:text-emerald-900">Faculty Portal</h1>
        <p className="text-xs text-emerald-400 light:text-emerald-600 mt-1 font-medium tracking-wide uppercase">Lecturer System</p>
      </div>

      <nav className="px-4 pb-6 space-y-6">
        {lecturerMenu.map((group) => (
          <div key={group.section}>
            <p className="px-4 text-[11px] font-bold zinc-600 text-light:text-zinc-400 uppercase tracking-wider mb-2">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
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
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}