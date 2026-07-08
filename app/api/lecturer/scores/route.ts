import { NextRequest, NextResponse } from 'next/server';
import { ResultStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';


export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: missing lecturer user id' },
        { status: 401 },
      );
    }

    const lecturer = await prisma.lecturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!lecturer) {
      return NextResponse.json(
        { error: 'Unauthorized: lecturer account not found' },
        { status: 401 },
      );
    }

    const scores = await prisma.score.findMany({
      where: { lecturerId: lecturer.id },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { code: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const drafts = scores.filter((score) => score.status === ResultStatus.DRAFT);
    const submitted = scores.filter(
      (score) => score.status === ResultStatus.SUBMITTED,
    );

    return NextResponse.json({ drafts, submitted });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to load lecturer scores' },
      { status: 500 },
    );
  }
}
