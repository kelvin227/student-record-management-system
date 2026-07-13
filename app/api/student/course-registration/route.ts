import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
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
    const selectedIds = await req.json();

    if (selectedIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify existence of all related entities in one go
    const [student, Asession, semester, courses] = await Promise.all([
      prisma.student.findUnique({ where: {userId } }),
      prisma.session.findFirst({ where: { isActive: true } }),
      prisma.semester.findFirst({ where: { isActive: true } }),
      prisma.course.findMany({ where: { id: { in: selectedIds } } }),
    ]);

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    if (!Asession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (!semester) return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    if (courses.length !== selectedIds.length) {
      return NextResponse.json({ error: 'One or more courses not found' }, { status: 404 });
    }

    // 2. Check for existing registrations
    const existingCount = await prisma.courseRegistration.count({
      where: {
        studentId: student.id,
        sessionId: Asession.id,
        semesterId: semester.id,
        courseId: { in: selectedIds },
      },
    });

    if (existingCount > 0) {
      return NextResponse.json({ error: 'One or more courses already registered' }, { status: 409 });
    }

    // 3. Create records using a transaction (to ensure all or nothing)
    const registrations = await prisma.$transaction(
      selectedIds.map((courseId: string) => 
        prisma.courseRegistration.create({
          data: {
            studentId: student.id,
            courseId,
            sessionId: Asession.id,
            semesterId: semester.id,
            status:'PENDING',
          },
          include: { student: true, course: true } // This works with .create()
        })
      )
    );

    return NextResponse.json(registrations, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}