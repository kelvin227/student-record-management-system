import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session?.user?.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid access requested" },
        { status: 401 },
      );
    }
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: missing student user id" },
        { status: 401 },
      );
    }


    const student = await prisma.student.findUnique({
      where: { userId },
        include: {
            registrations: {
                include: {
                    course: true
                },
            },
            department: true,
        }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Unauthorized: lecturer account not found" },
        { status: 401 },
      );
    }
    const registeredCourseCount = student.registrations.length;

    // Calculate total registrations
    const totalCreditUnit = student.registrations.reduce(
      (sum, registrations) => sum + registrations.course.creditUnit,
      0,
    );




    const Asession = await prisma.session.findFirst({
      where: { isActive: true },
    });
    const Asemester = await prisma.semester.findFirst({
        where: {isActive: true},
    })
    const gpa = await prisma.gPARecord.findFirst({
        where: {semesterId: Asemester?.id, sessionId: Asession?.id}
    })

    return NextResponse.json({ student, Asession, registeredCourseCount, totalCreditUnit, Asemester, gpa: gpa?.gpa, cgpa: gpa?.cgpa });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load lecturer scores" },
      { status: 500 },
    );
  }
}
