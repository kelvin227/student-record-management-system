import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all semesters
export async function GET(req: NextRequest) {
  try {
    const semesters = await prisma.semester.findMany({
      include: {
        session: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    const formattedSemesters = semesters.map((semester) => ({
      id: semester.id,
      name: semester.name,
      sessionId: semester.sessionId,
      sessionName: semester.session.name,
    }));

    return NextResponse.json(formattedSemesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch semesters' },
      { status: 500 }
    );
  }
}