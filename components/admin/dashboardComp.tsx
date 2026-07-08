"use client"
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Users, BookOpen, Building2,LogOut} from "lucide-react";

export default function AdminDashboardComp(){

    return (
        <div className="flex w-full bg-zinc-50 dark:bg-background">
            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-background dark:bg-background border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Dashboard</h2>
                    <Button 
                        onClick={() => signOut({ redirectTo: "/" })}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </header>

                {/* Dashboard Content */}
                <div className="p-8">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Welcome Admin</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">Manage your student record system</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Total Students</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">1</p>
                                </div>
                                <Users className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Total Lecturers</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">0</p>
                                </div>
                                <Users className="w-10 h-10 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Total Courses</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">0</p>
                                </div>
                                <BookOpen className="w-10 h-10 text-purple-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Departments</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">19</p>
                                </div>
                                <Building2 className="w-10 h-10 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Actions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Link href="/admin/students" className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <h5 className="font-semibold text-zinc-900 dark:text-white">Add Student</h5>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Create new student record</p>
                            </Link>
                            <Link href="/admin/lecturers" className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <h5 className="font-semibold text-zinc-900 dark:text-white">Add Lecturer</h5>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Enroll new lecturer</p>
                            </Link>
                            <Link href="/admin/courses" className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <h5 className="font-semibold text-zinc-900 dark:text-white">Create Course</h5>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Add new course offering</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}