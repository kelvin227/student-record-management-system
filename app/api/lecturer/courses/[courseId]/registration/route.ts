import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const { courseId } = await params;
  const { searchParams } = new URL(request.url);

const sessionId = searchParams.get("sessionId") as string;
const semesterId = searchParams.get("semesterId") as string;

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  try {
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        AND: [
          {
            courseId,
            sessionId,
            semesterId,
            course: {
              scores: {
                none: {},
              }
            }
            // scores: {
            //   none: {},
            // },
          },
        ],
      },
      select: {
        id: true,
        status: true,
        studentId: true,
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
    console.log(registrations)

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/lecturer/courses/[courseId]/students", error);
    return NextResponse.json(
      { error: "Unable to fetch students for this course" },
      { status: 500 },
    );
  }
}