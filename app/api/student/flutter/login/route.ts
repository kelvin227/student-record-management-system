import { NextResponse } from "next/server";
import { comparePasswords, generateAccessToken, generateRefreshToken } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { compareSync } from "bcryptjs";


export async function POST(req: Request) {
  const { matricNo, password } = await req.json();

  const student = await prisma.student.findUnique({ where: { matricNo }, include:{user: true} });
  if (!student || !compareSync(password, student.user.password)) {
    return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: {
        "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const accessToken = generateAccessToken(student.id);
  const refreshToken = generateRefreshToken(student.id);

  await prisma.user.update({
    where: { id: student.user.id },
    data: { refreshToken },
  });

  return new NextResponse(JSON.stringify({ accessToken, refreshToken }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // your frontend origin
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}