import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
     const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        console.log("error here header")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: {
          "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }, });
      }
    
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token) as { id: string };
    const id = payload.id;
    if (!id) {
        console.log("error here id")
      return NextResponse.json(
        { error: "Unauthorized: missing student user id" },
        { status: 401,  headers: {
          "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        } },
      );
    }


    const student = await prisma.student.findUnique({
      where: { id},
        include: {
            user:{
                select:{
                    email: true,
                }
            },
            registrations: {
                include: {
                    course: true
                },
            },
            department: true,
            program: true,
        }
    });

    if (!student) {
                console.log("error here student")

      return NextResponse.json(
        { error: "Unauthorized: student account not found" },
        { status: 401, headers: {
      "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }, },
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
    const allSession = await prisma.session.findMany({
      include:{semesters: true}
    })
    const registration = await prisma.courseRegistration.findMany({
      where: {studentId: id, semester: {isActive: true}},
      include: {course: true},
    })
    const notifications = await prisma.notification.findMany({
      where: {userId: student.userId},
    })
    const Dnotification = await prisma.notification.findMany({
      where:{userId: student.userId},
      take: 2,
      orderBy: {
        createdAt: "desc",
      }
    })


    return NextResponse.json({ student, Asession, registeredCourseCount, totalCreditUnit, Asemester, gpa: gpa?.gpa, cgpa: gpa?.cgpa, session: allSession, registration, notifications, Dnotification });
  }catch {
            console.log("error here catch block")

        return NextResponse.json({ error: "Token expired or invalid" }, { status: 401, headers: {
          "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }, });
      }
}
