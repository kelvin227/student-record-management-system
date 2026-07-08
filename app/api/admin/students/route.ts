import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        department: true,
        program: true,
        gpaRecords: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const formattedStudents = students.map((student) => ({
      id: student.id,
      matricNo: student.matricNo,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      departmentId: student.departmentId,
      programId: student.programId,
      level: student.level,
      phone: student.phone,

      department: student.department,
      program: student.program,
      gpa: student.gpaRecords,
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      matricNo,
      firstname,
      lastname,
      email,
      departmentId,
      programId,
      level,
      phone,
    } = body;

    if (
      !matricNo ||
      !firstname ||
      !lastname ||
      !email ||
      !departmentId ||
      !programId ||
      !level
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMatricNo = matricNo.trim().toUpperCase();

    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const program = await prisma.program.findUnique({
      where: {
        id: programId,
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    if (program.departmentId !== departmentId) {
      return NextResponse.json(
        {
          error:
            "Selected program does not belong to selected department",
        },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: {
        matricNo: normalizedMatricNo,
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          error:
            "Student with this matric number already exists",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email already exists",
        },
        { status: 400 }
      );
    }

    const tempPassword = normalizedMatricNo;

    const hashedPassword = await bcrypt.hash(
      tempPassword,
      10
    );

    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
            role: "STUDENT",
          },
        });

        const student = await tx.student.create({
          data: {
            userId: user.id,
            matricNo: normalizedMatricNo,
            firstName: firstname.trim(),
            lastName: lastname.trim(),
            departmentId,
            programId,
            level: Number(level),
            phone: phone?.trim() || null,
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
            department: true,
            program: true,
          },
        });

        return student;
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Student created successfully",
        student: result,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create student error:", error);

    return NextResponse.json(
      {
        error: "Failed to create student",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("id");


    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      matricNo,
      firstName,
      lastName,
      email,
      departmentId,
      programId,
      level,
      phone,
    } = body;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }
    }

    if (programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });

      if (!program) {
        return NextResponse.json(
          { error: "Program not found" },
          { status: 404 }
        );
      }

      if (departmentId && program.departmentId !== departmentId) {
        return NextResponse.json(
          {
            error:
              "Selected program does not belong to selected department",
          },
          { status: 400 }
        );
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(matricNo && { matricNo: matricNo.toUpperCase() }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(departmentId && { departmentId }),
        ...(programId && { programId }),
        ...(level && { level: Number(level) }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        department: true,
        program: true,
      },
    });

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser && existingUser.id !== student.userId) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: student.userId },
        data: { email: normalizedEmail },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Student updated successfully",
        student: updatedStudent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update student error:", error);

    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("id");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.student.delete({
        where: { id: studentId },
      });

      await tx.user.delete({
        where: { id: student.userId },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete student error:", error);

    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}


