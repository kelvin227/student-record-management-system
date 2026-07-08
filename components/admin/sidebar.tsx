import Link from "next/link";
import {
  Users,
  BookOpen,
  Building2,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  GraduationCap,
} from "lucide-react";

const menuItems = [
  { icon: Users, label: "Student Management", href: "/admin/students" },
  { icon: Users, label: "Lecturer Management", href: "/admin/lecturers" },
  {
    icon: Building2,
    label: "Department Management",
    href: "/admin/departments",
  },
  {
    icon: GraduationCap,
    label: "Program",
    href: "/admin/programs",
  },

  { icon: BookOpen, label: "Course Management", href: "/admin/courses/management" },
  { icon: Calendar, label: "Session Management", href: "/admin/sessions" },
  { icon: Layers, label: "Semester Management", href: "/admin/semesters" },
  { icon: BarChart3, label: "Result Management", href: "/admin/results" },
  {
    icon: FileText,
    label: "Transcript Management",
    href: "/admin/transcripts",
  },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "System Settings", href: "/admin/settings" },
];

export default function SideBar() {
  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen md:w-64 lg:w-64 xl:w-64 bg-background dark:bg-backgrond border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
        <div className="p-6 md:block lg:block xl:block">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Student Record System
          </p>
        </div>
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:hidden md:block lg:block xl:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
