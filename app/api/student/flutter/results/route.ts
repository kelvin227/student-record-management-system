import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
          { message: "Unauthorized: missing student user id" },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          },
        );
      }
    }
    const { semesterId, sessionId } = await request.json();

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

    const result = await prisma.score.findMany({
      where: { studentId: student.id, sessionId, semesterId },
      include: {course: true}
    });
    if (!result) {
      return NextResponse.json(
        {
          error: "failed to get result please try again",
        },
        { status: 402 },
      );
    }
    const gpa = await prisma.gPARecord.findMany({
        where: {studentId: student.id, sessionId, semesterId }
    })
    if(!gpa){
         return NextResponse.json(
        {
          error: "failed to get result please try again",
        },
        { status: 402 },
      );
    }
    console.log(result)

    return NextResponse.json(
      { message: "fetched result successfully", result, gpa },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch result please try again" },
      { status: 500 },
    );
  }
}
