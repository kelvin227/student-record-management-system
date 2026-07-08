import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
) {
  const session = await auth();
  const { courseId } = await req.json();

  if (!session || session.user.role !== 'LECTURER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Verify the lecturer is actually allocated to this course
    const allocation = await prisma.courseAllocation.findFirst({
      where: {
        courseId,
        lecturer: { userId: session.user.id }
      }
    });

    if (!allocation) {
      return NextResponse.json(
        { message: 'You are not authorized to manage this course' }, 
        { status: 403 }
      );
    }

    // 2. Perform bulk update
    // We only update records where status is DRAFT to avoid 
    // overwriting already submitted or published results
    const updated = await prisma.score.updateMany({
      where: {
        courseId,
        status: ResultStatus.DRAFT,
      },
      data: {
        status: ResultStatus.SUBMITTED,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ 
      message: `Successfully submitted ${updated.count} results.`,
      count: updated.count 
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ message: 'Failed to submit results' }, { status: 500 });
  }
}