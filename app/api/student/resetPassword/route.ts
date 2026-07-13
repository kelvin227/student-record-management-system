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
  const { oldPass, newPass, confirmPass } = body;

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
    if (newPass !== confirmPass) {
      return NextResponse.json(
        {
          error:
            "the new password does not match with the confirmation password",
        },
        { status: 401 },
      );
    }

    const isMatch = bcrypt.compare(oldPass, student.user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          error:
            "the old Password you entered is incorrect",
        },
        { status: 401 },
      );
    }

        const hashedPassword = await bcrypt.hash(newPass, 10);
    

    const updatePass = await prisma.user.update({
        where:{ id: student.userId},
        data: {
            password: hashedPassword,
        }
    })
    if(!updatePass){
        return NextResponse.json(
        {
          error:
            "failed to update password please try again",
        },
        { status: 402 },
      );
    }

    return NextResponse.json({message: "Updated Password successfully"}, {status:201});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}
