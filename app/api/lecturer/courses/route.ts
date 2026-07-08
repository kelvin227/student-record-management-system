import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


// GET - Fetch all courses with department and semester details
export async function GET(req: NextRequest) {
    const session = await auth();
    if(!session || session?.user.role !== "LECTURER"){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const lecturerId = await prisma.lecturer.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
    })?.then(lecturer => lecturer?.id);


  try {
    const courses = await prisma.courseAllocation.findMany({
        where: { lecturerId },
        include: { course: {
            include: {
                semester: true,
                registrations: true,
            }
        }},
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create a new course
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, title, creditUnit, level, departmentId, semesterId } = body;

    // Validate required fields
    if (!code || !title || !creditUnit || !level || !departmentId || !semesterId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course code already exists' },
        { status: 409 }
      );
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        code,
        title,
        creditUnit: parseInt(creditUnit),
        level: parseInt(level),
        departmentId,
        semesterId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// PUT - Update a course
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, code, title, creditUnit, level, departmentId, semesterId } = body;

    // Validate required fields
    if (!id || !code || !title || !creditUnit || !level || !departmentId || !semesterId) {
        console.log(code);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if new course code is unique (if changed)
    if (code !== existingCourse.code) {
      const duplicateCode = await prisma.course.findUnique({
        where: { code },
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Course code already exists' },
          { status: 409 }
        );
      }
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        code,
        title,
        creditUnit: parseInt(creditUnit),
        level: parseInt(level),
        departmentId,
        semesterId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        registrations: true,
        scores: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course has registrations or scores
    if (course.registrations.length > 0 || course.scores.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing registrations or scores' },
        { status: 409 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
