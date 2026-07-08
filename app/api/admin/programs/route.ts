import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Fetch all programs or a specific program
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("id");
    const departmentId = searchParams.get("departmentId");

    if (programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
        include: { department: true },
      });

      if (!program) {
        return NextResponse.json(
          { error: "Program not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(program);
    }

    if (departmentId) {
      const programs = await prisma.program.findMany({
        where: { departmentId },
        include: { department: true },
      });

      return NextResponse.json(programs);
    }

    const programs = await prisma.program.findMany({
      include: { department: true },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// POST - Create a new program
export async function POST(req: NextRequest) {
  try {
    const { departmentId, name, duration } = await req.json();

    if (!departmentId || !name || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: departmentId, name, duration" },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const program = await prisma.program.create({
      data: {
        departmentId,
        name,
        duration,
      },
      include: { department: true },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}

// PUT - Update a program
export async function PUT(req: NextRequest) {
  try {
    const { id, name, duration, departmentId } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(duration && { duration }),
        ...(departmentId && { departmentId }),
      },
      include: { department: true },
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a program
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Program deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
