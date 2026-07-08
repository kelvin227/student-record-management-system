import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const registrations = await prisma.courseRegistration.findMany({
      include: {
        session: true,
        semester: true,
        student: {
          select: {
            id: true,
            matricNo: true,
            firstName: true,
            lastName: true,
            level: true,
            departmentId: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            creditUnit: true,
            level: true,
            departmentId: true,
          },
        },
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, courseIds, sessionId, semesterId, status } = await req.json();

    if (!studentId || !courseIds?.length || !sessionId || !semesterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify existence of all related entities in one go
    const [student, session, semester, courses] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.session.findUnique({ where: { id: sessionId } }),
      prisma.semester.findUnique({ where: { id: semesterId } }),
      prisma.course.findMany({ where: { id: { in: courseIds } } }),
    ]);

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (!semester) return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    if (courses.length !== courseIds.length) {
      return NextResponse.json({ error: 'One or more courses not found' }, { status: 404 });
    }

    // 2. Check for existing registrations
    const existingCount = await prisma.courseRegistration.count({
      where: {
        studentId,
        sessionId,
        semesterId,
        courseId: { in: courseIds },
      },
    });

    if (existingCount > 0) {
      return NextResponse.json({ error: 'One or more courses already registered' }, { status: 409 });
    }

    // 3. Create records using a transaction (to ensure all or nothing)
    const registrations = await prisma.$transaction(
      courseIds.map((courseId: string) => 
        prisma.courseRegistration.create({
          data: {
            studentId,
            courseId,
            sessionId,
            semesterId,
            status: status || 'PENDING',
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

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Verify registration exists
    const registration = await prisma.courseRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Update registration status
    const updatedRegistration = await prisma.courseRegistration.update({
      where: { id },
      data: { status },
      include: {
        student: {
          select: {
            id: true,
            matricNo: true,
            firstName: true,
            lastName: true,
            level: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            creditUnit: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}
