import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  try {
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        AND: [
          {
            courseId,
          },
        ],
      },
      select: {
        id: true,
        status: true,
        student: {
          select: {
            matricNo: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          include: {
            scores: {
              where: { courseId },
            },
          },
        },
      },
      orderBy: {
        student: {
          lastName: "asc",
        },
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/lecturer/courses/[courseId]/students", error);
    return NextResponse.json(
      { error: "Unable to fetch students for this course" },
      { status: 500 },
    );
  }
}
