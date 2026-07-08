import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session?.user.role !== "LECTURER") {
    return NextResponse.json(
      { message: "Unauthorized lecturer request" },
      { status: 401 },
    );
  }
  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized lecturer request" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { oldPass, newPass, confirmPass } = body;

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId },
      include: {
        user: {},
      },
    });

    if (!lecturer || lecturer.user.role !== "LECTURER") {
      return NextResponse.json(
        { message: "Lecturer profile not found" },
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

    const isMatch = bcrypt.compare(oldPass, lecturer.user.password);
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
        where:{ id: lecturer.userId},
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

    return NextResponse.json(lecturer);
  } catch (error) {
    console.error("Lecturer profile error:", error);
    return NextResponse.json(
      { error: "Failed to load lecturer profile" },
      { status: 500 },
    );
  }
}
