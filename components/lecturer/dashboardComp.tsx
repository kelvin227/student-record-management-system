"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Lecturer } from "../admin/lecturerComp";
import { Session } from "../admin/sessionComp";
import { CourseAllocation } from "../admin/courseAllocationComp";
import { useRouter } from "next/navigation";

const LecturerDashboard: React.FC = () => {
  const[loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [assignedCourseCount, setAssignedCourseCount]= useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [draftedResult, setDraftedResult] = useState(0);
  const [submittedResult, setSubmittedResult] = useState(0);
  const [publishedResult, setPublishedResult] = useState(0);
  const [allocatedCourse, setAllocatedCourse] = useState<CourseAllocation[]>([]);
  const router = useRouter();


  useEffect(() =>{
  fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/lecturer/dashboard");
      if (!response.ok) setError("Failed to fetch scores");

      const data = await response.json();

      setLecturer(data.lecturer);
      setSession(data.Asession);
      setAssignedCourseCount(data.assignedCourseCount);
      setTotalStudents(data.totalStudents);
      setDraftedResult(data.draftedResult);
      setSubmittedResult(data.submittedResult);
      setPublishedResult(data.publishedResult);
      setAllocatedCourse(data.slicedCourses);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
            <div className="text-center py-8">Loading Component...</div>
          ) : (
    <div className="p-12">
      <div className="m-10">
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>Good Morning,</p>
        <h1 style={{ margin: "8px 0", fontSize: 32 }}>{lecturer?.firstName}{" "}{lecturer?.lastName}</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="p-10 rounded-md bg-gray-900">
          <p style={{ margin: 0, fontSize: 14, }}>Current Session</p>
          <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 600 }}>{session?.name}</p>
        </div>
        <div className={"p-10 rounded-md bg-gray-900"}>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>Current Semester</p>
          <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 600 }}>First Semester</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={{ background: "#1f2937", color: "#fff", padding: 20, borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 14 }}>Assigned Courses</p>
          <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>{assignedCourseCount}</p>
        </div>
        <div style={{ background: "#111827", color: "#fff", padding: 20, borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 14 }}>Registered Students</p>
          <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>{totalStudents}</p>
        </div>
        <div style={{ background: "#1f2937", color: "#fff", padding: 20, borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 14 }}>Draft Results</p>
          <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>{draftedResult}</p>
        </div>
        <div style={{ background: "#111827", color: "#fff", padding: 20, borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 14 }}>Submitted Results</p>
          <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>{submittedResult}</p>
        </div>
        <div style={{ background: "#1f2937", color: "#fff", padding: 20, borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 14 }}>Published Results</p>
          <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>{publishedResult}</p>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>Recent Activity</h2>
        <div className="rounded-md bg-gray-900 p-10">
          <p style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#10b981" }}>✓</span> CSC101 Result Submitted
          </p>
          <p style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#10b981" }}>✓</span> CSC204 Draft Saved
          </p>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#10b981" }}>✓</span> New Course Assigned
          </p>
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>Assigned Courses</h2>

        {
          allocatedCourse.map((a) => (

                    <div key={a.id}
        className="bg-gray-900 p-10 rounded-md mb-4 mb-8"
        >
          <h3 style={{ margin: 0, fontSize: 18 }}>{a.course?.code}</h3>
          <p style={{ margin: "8px 0 12px", color: "#6b7280" }}>{a.course?.title}</p>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {a.course?.registrations?.length ?? 0} Student{(a.course?.registrations?.length ?? 0) !== 1 ? "s" : ""}
          </p>
          <Button
            style={{
              marginTop: 16,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => router.push("/lecturer/courses")}
          >
            Enter Scores
          </Button>
        </div>
          ))
        }
      </div>
    </div>
  );
};

export default LecturerDashboard;
