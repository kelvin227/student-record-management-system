import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  const records = await prisma.gPARecord.findMany({
    where: {
      studentId,
    },
    include: {
      semester: true,
      session: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(records);
}