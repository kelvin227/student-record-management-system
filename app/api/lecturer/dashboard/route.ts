import { NextRequest, NextResponse } from "next/server";
import { ResultStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session?.user?.role !== "LECTURER") {
      return NextResponse.json(
        { error: "Unauthorized: missing lecturer user id" },
        { status: 401 },
      );
    }
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: missing lecturer user id" },
        { status: 401 },
      );
    }

    const lecturer = await prisma.lecturer.findUnique({
      where: { userId },
      select: {
        id: true,
        scores: true,
        firstName: true,
        lastName: true,
        allocations: {
          select: { id: true, course: { include: { registrations: true } } },
        },
      },
    });

    if (!lecturer) {
      return NextResponse.json(
        { error: "Unauthorized: lecturer account not found" },
        { status: 401 },
      );
    }
    const assignedCourseCount = lecturer.allocations.length;

    // Calculate total registrations
    const totalStudents = lecturer.allocations.reduce(
      (sum, allocation) => sum + allocation.course.registrations.length,
      0,
    );
    const draftedResult = lecturer.scores.filter(
      (s) => s.status === "DRAFT",
    )?.length;
    const submittedResult = lecturer.scores.filter(
      (s) => s.status === "SUBMITTED",
    )?.length;
    const publishedResult = lecturer.scores.filter(
      (s) => s.status === "PUBLISHED",
    )?.length;


    const Asession = await prisma.session.findFirst({
      where: { isActive: true },
    });

    const slicedCourses = lecturer.allocations.slice(0, 2);

    return NextResponse.json({ lecturer, Asession, assignedCourseCount, totalStudents, draftedResult, submittedResult, publishedResult, slicedCourses });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load lecturer scores" },
      { status: 500 },
    );
  }
}
