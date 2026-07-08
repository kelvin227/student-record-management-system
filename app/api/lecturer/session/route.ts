import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Fetch all sessions
export async function GET(request: NextRequest) {
  try {

    const academicSessions = await prisma.session.findMany({
      orderBy: { name: "desc" },
      include: {
        semesters: true,
      }
    });

    return NextResponse.json(academicSessions, { status: 200 });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}