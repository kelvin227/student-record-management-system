import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session?.user.role !== "STUDENT") {
    return NextResponse.json(
      { message: "Unauthorized student request" },
      { status: 401 },
    );
  }
  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized student request" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { confirmPass, number} = body;

  try {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {},
      },
    });

    if (!student || student.user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "student profile not found" },
        { status: 404 },
      );
    }

    const isMatch = bcrypt.compare(confirmPass, student.user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          error:
            "the Password you entered is incorrect",
        },
        { status: 401 },
      );
    }
    

    const updatePhone = await prisma.student.update({
        where:{ id: student.id},
        data: {
            phone: number,
        }
    })
    if(!updatePhone){
        return NextResponse.json(
        {
          error:
            "failed to update phone number please try again",
        },
        { status: 402 },
      );
    }

    return NextResponse.json({message: "Updated phone number successfully"}, {status:201});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update phone number" },
      { status: 500 },
    );
  }
}
