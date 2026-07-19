import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("error here header");
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token) as {
      id: string;
      expired: boolean;
      invalid: boolean;
    };
    const id = payload.id;
    if (!id) {
      console.log("error here id");
      if (payload.expired) {
        return NextResponse.json(
          { message: "Unauthorized: session expired please login back in" },
          {
            status: 410,
            headers: {
              "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          },
        );
      } else if (payload.invalid) {
        return NextResponse.json(
          { message: "Unauthorized: malformed jwt" },
          {
            status: 411,
            headers: {
              "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          },
        );
      } else {
        return NextResponse.json(
          { error: "Unauthorized: missing student user id" },
          {
            status: 401,
            headers: {
              "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          },
        );
      }
    }
    const { oldPass, newPass, confirmPass } = await request.json();

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
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

    const isMatch = bcrypt.compareSync(oldPass, student.user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          error: "the old Password you entered is incorrect",
        },
        { status: 401 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);

    const updatePass = await prisma.user.update({
      where: { id: student.userId },
      data: {
        password: hashedPassword,
      },
    });
    if (!updatePass) {
      return NextResponse.json(
        {
          error: "failed to update password please try again",
        },
        { status: 402 },
      );
    }

    return NextResponse.json(
      { message: "Updated Password successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}
