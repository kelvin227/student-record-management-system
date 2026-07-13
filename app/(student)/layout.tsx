import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import StudentSideBar from "@/components/students/sideBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student Portal",
  description:
    "this is the Student portal for the student record management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
                  <div className="flex w-full min-h-screen bg-background">

        <ThemeProvider
          attribute="class" // This tells next-themes to apply the 'dark' class to the html tag
          defaultTheme="system" // Default theme: system, dark, or light
          enableSystem // Enable system theme detection
          disableTransitionOnChange
        >
          <StudentSideBar />
          <div className="w-full">{children}</div>
        </ThemeProvider>
        </div>
        <Toaster />
    </>



  );
}
