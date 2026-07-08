"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CourseNavigation() {
  const [show, setshow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
  if(pathname.includes("/courses")){
    setshow(true);
  } else{
    setshow(false)
  }
  
  }, [pathname]);
return (
    <div className={show ? "flex gap-4 mb-6" : "hidden"}>
      <Link href="/admin/courses/management">
        <Button variant="outline">Go to Course Management</Button>
      </Link>
      <Link href="/admin/courses/allocation">
        <Button variant="outline">Go to Course Allocation</Button>
      </Link>
      <Link href="/admin/courses/registration">
        <Button variant={"outline"}>Go to course Registration</Button>
      </Link>
    </div>
  );
}
