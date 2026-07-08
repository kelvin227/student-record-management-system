import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TransComp from "@/components/admin/transcriptComp";

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

      const student = {
    firstname: "Kelvin",
    lastname: "Okoro",
    matricNo: "ENG2021/1234",
    department: "Electrical Engineering",
    program: "B.Eng Electrical Engineering",
    level: "400"
  }

  const records = [
    {
      code: "ENG401",
      title: "Power Systems Analysis",
      creditUnit: 3,
      ca: 25,
      exam: 60,
      total: 85,
      grade: "A",
      gradePoint: 5
    },
    {
      code: "ENG402",
      title: "Control Engineering",
      creditUnit: 3,
      ca: 20,
      exam: 55,
      total: 75,
      grade: "B",
      gradePoint: 4
    },
    {
      code: "ENG403",
      title: "Digital Signal Processing",
      creditUnit: 2,
      ca: 18,
      exam: 40,
      total: 58,
      grade: "C",
      gradePoint: 3
    },
    {
      code: "ENG404",
      title: "Electromagnetic Fields",
      creditUnit: 2,
      ca: 15,
      exam: 30,
      total: 45,
      grade: "D",
      gradePoint: 2
    }
  ]

      return (
    <TransComp
      student={student}
      session="2025/2026"
      semester="Second"
      records={records}
      gpa={3.50}
      cgpa={3.75}
    />
  )
}
