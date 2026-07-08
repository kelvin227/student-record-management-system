import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            programs: true,
            students: true,
            lecturers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    console.error("Error creating department:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Department code already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}
