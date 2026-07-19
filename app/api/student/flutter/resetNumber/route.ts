
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
        { message: "Unauthorized" },
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
          { message: "Unauthorized: missing student user id" },
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
    const { number, confirmPass } = await request.json();

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

    const isMatch = bcrypt.compareSync(confirmPass, student.user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          message: "the old Password you entered is incorrect",
        },
        { status: 401 },
      );
    }


    const updatePass = await prisma.student.update({
      where: { id: student.id },
      data: {
        phone: number,
      },
    });
    if (!updatePass) {
      return NextResponse.json(
        {
          message: "failed to update phone number please try again",
        },
        { status: 402 },
      );
    }

    return NextResponse.json(
      { message: "Updated phone number successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update phone number" },
      { status: 500 },
    );
  }
}
