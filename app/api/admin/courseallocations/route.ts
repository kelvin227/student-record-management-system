import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// GET all course allocations
export async function GET() {
  try {
    const allocations = await prisma.courseAllocation.findMany({
      include: {
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            staffId: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(allocations, { status: 200 });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json(
      { message: "Failed to fetch allocations" },
      { status: 500 },
    );
  }
}

// POST - Create new course allocation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: "Your session has expired please log back in" },
        { status: 501 },
      );
    }
    console.log(session?.user.role);
    if (session?.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized user access" },
        { status: 502 },
      );
    }
    const userId = await session?.user.id;
    const body = await request.json();
    const { lecturerId, courseId } = body;

    // Validate input
    if (!lecturerId || !courseId) {
      return NextResponse.json(
        { message: "Lecturer ID and Course ID are required" },
        { status: 400 },
      );
    }

    // Check if lecturer exists
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer) {
      return NextResponse.json(
        { message: "Lecturer not found" },
        { status: 404 },
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    // Check if course belongs to lecturer's department
    if (course.departmentId !== lecturer.departmentId) {
      return NextResponse.json(
        { message: "Course does not belong to lecturer's department" },
        { status: 400 },
      );
    }

    // Check if allocation already exists
    const existingAllocation = await prisma.courseAllocation.findUnique({
      where: {
        lecturerId_courseId: {
          lecturerId,
          courseId,
        },
      },
    });

    if (existingAllocation) {
      return NextResponse.json(
        { message: "This course is already allocated to this lecturer" },
        { status: 409 },
      );
    }

    // Create allocation
    const allocation = await prisma.courseAllocation.create({
      data: {
        lecturerId,
        courseId,
      },
      include: {
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            staffId: true,
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

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "COURSE_ALLOCATED",
        entity: "CourseAllocation",
        entityId: allocation.id,
      },
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    console.error("Error creating allocation:", error);
    return NextResponse.json(
      { message: "Failed to create allocation" },
      { status: 500 },
    );
  }
}

// PUT - Update course allocation
export async function PUT(request: NextRequest) {
  try {
     const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: "Your session has expired please log back in" },
        { status: 501 },
      );
    }
    if (session?.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized user access" },
        { status: 502 },
      );
    }
    const userId = await session?.user.id;
    const body = await request.json();
    const { id, lecturerId, courseId } = body;

    // Validate input
    if (!id || !lecturerId || !courseId) {
      return NextResponse.json(
        { message: "Allocation ID, Lecturer ID, and Course ID are required" },
        { status: 400 },
      );
    }

    // Check if allocation exists
    const existingAllocation = await prisma.courseAllocation.findUnique({
      where: { id },
    });

    if (!existingAllocation) {
      return NextResponse.json(
        { message: "Allocation not found" },
        { status: 404 },
      );
    }

    // Check if lecturer exists
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer) {
      return NextResponse.json(
        { message: "Lecturer not found" },
        { status: 404 },
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    // Check if course belongs to lecturer's department
    if (course.departmentId !== lecturer.departmentId) {
      return NextResponse.json(
        { message: "Course does not belong to lecturer's department" },
        { status: 400 },
      );
    }

    // Check for duplicate allocation
    if (
      existingAllocation.lecturerId !== lecturerId ||
      existingAllocation.courseId !== courseId
    ) {
      const duplicateAllocation = await prisma.courseAllocation.findUnique({
        where: {
          lecturerId_courseId: {
            lecturerId,
            courseId,
          },
        },
      });

      if (duplicateAllocation) {
        return NextResponse.json(
          { message: "This course is already allocated to this lecturer" },
          { status: 409 },
        );
      }
    }

    // Update allocation
    const updatedAllocation = await prisma.courseAllocation.update({
      where: { id },
      data: {
        lecturerId,
        courseId,
      },
      include: {
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            staffId: true,
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

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "COURSE_ALLOCATION_UPDATED",
        entity: "CourseAllocation",
        entityId: id,
      },
    });

    return NextResponse.json(updatedAllocation, { status: 200 });
  } catch (error) {
    console.error("Error updating allocation:", error);
    return NextResponse.json(
      { message: "Failed to update allocation" },
      { status: 500 },
    );
  }
}

// DELETE - Remove course allocation
export async function DELETE(request: NextRequest) {
  try {
     const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: "Your session has expired please log back in" },
        { status: 501 },
      );
    }
    if (session?.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized user access" },
        { status: 502 },
      );
    }
    const userId = await session?.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Validate input
    if (!id) {
      return NextResponse.json(
        { message: "Allocation ID is required" },
        { status: 400 },
      );
    }

    // Check if allocation exists
    const allocation = await prisma.courseAllocation.findUnique({
      where: { id },
    });

    if (!allocation) {
      return NextResponse.json(
        { message: "Allocation not found" },
        { status: 404 },
      );
    }

    // Delete allocation
    await prisma.courseAllocation.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "COURSE_ALLOCATION_DELETED",
        entity: "CourseAllocation",
        entityId: id,
      },
    });

    return NextResponse.json(
      { message: "Allocation deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting allocation:", error);
    return NextResponse.json(
      { message: "Failed to delete allocation" },
      { status: 500 },
    );
  }
}
