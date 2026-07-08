import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }

) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, code } = body;

    // Validate input
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if code is already taken by another department
    const codeExists = await prisma.department.findFirst({
      where: {
        code,
        id: { not: id },
      },
    });

    if (codeExists) {
      return NextResponse.json(
        { error: "Department code already exists" },
        { status: 409 }
      );
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name,
        code,
      },
      include: {
        _count: {
          select: {
            programs: true,
            students: true,
            lecturers: true,
          },
        },
      },
    });

    return NextResponse.json(updatedDepartment, { status: 200 });
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Delete department
    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Department deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
