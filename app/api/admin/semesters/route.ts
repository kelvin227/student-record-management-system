import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all semesters
export async function GET(req: NextRequest) {
  try {
    const semesters = await prisma.semester.findMany({
      include: {
        session: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    const formattedSemesters = semesters.map((semester) => ({
      id: semester.id,
      name: semester.name,
      sessionId: semester.sessionId,
      sessionName: semester.session.name,
    }));

    return NextResponse.json(formattedSemesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch semesters' },
      { status: 500 }
    );
  }
}

// POST - Create a new semester
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, sessionId } = body;

    if (!name || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sessionId' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check for duplicate semester name within the same session
    const existingSemester = await prisma.semester.findFirst({
      where: {
        sessionId,
        name,
      },
    });

    if (existingSemester) {
      return NextResponse.json(
        { error: 'A semester with this name already exists in this session' },
        { status: 409 }
      );
    }

    const semester = await prisma.semester.create({
      data: {
        name,
        sessionId,
      },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    console.error('Error creating semester:', error);
    return NextResponse.json(
      { error: 'Failed to create semester' },
      { status: 500 }
    );
  }
}

// PUT - Update a semester
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, sessionId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Semester ID is required' },
        { status: 400 }
      );
    }

    // Verify semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id },
    });

    if (!existingSemester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    // If sessionId is being changed, verify new session exists
    if (sessionId && sessionId !== existingSemester.sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      // Check for duplicate semester name in new session
      const duplicateSemester = await prisma.semester.findFirst({
        where: {
          sessionId,
          name: name || existingSemester.name,
        },
      });

      if (duplicateSemester && duplicateSemester.id !== id) {
        return NextResponse.json(
          { error: 'A semester with this name already exists in this session' },
          { status: 409 }
        );
      }
    }

    // If name is being changed, check for duplicates in same session
    if (name && name !== existingSemester.name) {
      const duplicateSemester = await prisma.semester.findFirst({
        where: {
          sessionId: sessionId || existingSemester.sessionId,
          name,
        },
      });

      if (duplicateSemester) {
        return NextResponse.json(
          { error: 'A semester with this name already exists in this session' },
          { status: 409 }
        );
      }
    }

    const updatedSemester = await prisma.semester.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(sessionId && { sessionId }),
      },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSemester);
  } catch (error) {
    console.error('Error updating semester:', error);
    return NextResponse.json(
      { error: 'Failed to update semester' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a semester
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Semester ID is required' },
        { status: 400 }
      );
    }

    // Verify semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id },
    });

    if (!existingSemester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    // Check if semester has related records
    const courseCount = await prisma.course.count({
      where: { semesterId: id },
    });

    const registrationCount = await prisma.courseRegistration.count({
      where: { semesterId: id },
    });

    const gpaRecordCount = await prisma.gPARecord.count({
      where: { semesterId: id },
    });

    if (courseCount > 0 || registrationCount > 0 || gpaRecordCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete semester with existing courses, registrations, or GPA records' },
        { status: 409 }
      );
    }

    await prisma.semester.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Semester deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting semester:', error);
    return NextResponse.json(
      { error: 'Failed to delete semester' },
      { status: 500 }
    );
  }
}


