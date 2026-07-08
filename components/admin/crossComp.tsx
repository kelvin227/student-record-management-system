"use client"

import { useState } from "react";
import GPAManager, { StudentSelector } from "./gpaComp";
import { Student } from "./studentComp";

export default function CrossComp() {
  const [selectedStudentId, setSelectedStudentId] = useState<Student>();

  if (!selectedStudentId) {
    return <StudentSelector onSelect={setSelectedStudentId} />;
  }

  return <GPAManager student={selectedStudentId} />;
}