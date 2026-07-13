"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Save } from "lucide-react";
import { Course } from "../admin/courseManagementComp";
import { toast } from "sonner";

export default function CourseRegistrationView({
  courses,
  registeredCourse,
}: {
  courses: Course[];
  registeredCourse: number;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleCourse = (id: string) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      // Prevent selecting more when limit reached
      if (!isSelected && prev.length + registeredCourse >= 6) return prev;
      return isSelected ? prev.filter((i) => i !== id) : [...prev, id];
    });
  };

  const totalUnits = courses
    .filter((c) => selectedIds.includes(c.id))
    .reduce((sum, c) => sum + c.creditUnit, 0);

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error("please select a course");
      return;
    }
    const res = await fetch("/api/student/course-registration", {
      method: "POST",
      body: JSON.stringify(selectedIds),
    });

    if (!res.ok){
      toast.error("Failed to apply for registration");
    } 

    toast.success("course registration applied successfully")
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header with Unit Tracking */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Course Registration
          </h1>
          <p className="text-muted-foreground">
            Select your courses for the current semester.
          </p>
        </div>
        <Card className="bg-sky-50 border-sky-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div>
              <p className="text-xs font-bold text-sky-800 uppercase">
                Course Registered
              </p>
              <p className="text-2xl font-bold text-sky-950">
                {registeredCourse} / 6
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Selection Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Available Courses</CardTitle>
        </CardHeader>
        <div className="divide-y">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedIds.includes(course.id)}
                  onCheckedChange={() => toggleCourse(course.id)}
                  disabled={
                    !selectedIds.includes(course.id) &&
                    selectedIds.length + registeredCourse >= 6
                  }
                  id={course.id}
                />
                <label htmlFor={course.id} className="cursor-pointer">
                  <p className="font-bold">{course.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.title}
                  </p>
                </label>
              </div>
              <Badge variant="secondary">{course.creditUnit} Units</Badge>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-muted/20 flex justify-end">
          <Button
            size="lg"
            disabled={selectedIds.length === 0}
            className="bg-sky-600 hover:bg-sky-700"
            onClick={handleSubmit}
          >
            <Save className="mr-2" size={18} />
            Submit Registration
          </Button>
        </div>
      </Card>

      {/* Helper Info */}
      <div className="flex gap-3 p-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-sm">
        <AlertCircle size={20} className="shrink-0" />
        <p>
          Ensure all core courses are selected before submission. Registrations
          are subject to administrative approval.
        </p>
      </div>
    </div>
  );
}
