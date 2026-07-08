import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';


function inferGrade(total: number) {
  if (total >= 70) return { grade: 'A', gradePoint: 5 };
  if (total >= 60) return { grade: 'B', gradePoint: 4 };
  if (total >= 50) return { grade: 'C', gradePoint: 3 };
  if (total >= 45) return { grade: 'D', gradePoint: 2 };
  return { grade: 'F', gradePoint: 0 };
}

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = await params;

  try {
    const scores = await prisma.score.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, matricNo: true, firstName: true, lastName: true } },
        course: { select: { id: true, code: true, title: true } },
        registration: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(scores);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unable to load scores' }, { status: 500 });
  }
}

type ScorePayload = { registrationId?: string; studentId?: string; ca: number; exam: number };

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = await params;
  const session = await auth();

  if(!session || session.user.role !== "LECTURER"){
    return NextResponse.json({ error: 'UnAuthorized access' }, { status: 400 });
  }

  const lecturerId = await prisma.lecturer.findUnique({
    where: {userId: session.user.id}
  })
  if(!lecturerId){
        return NextResponse.json({ error: 'can not find user' }, { status: 404 });
  }
  try {
    const body = await request.json();
    const items: ScorePayload[] = Array.isArray(body.scores) ? body.scores : body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No scores provided' }, { status: 400 });
    }

    const results: any[] = [];

    for (const it of items) {
      if (!it.registrationId) {
        // we require registrationId to map scores reliably
        continue;
      }

      const registration = await prisma.courseRegistration.findUnique({ where: { id: it.registrationId } });
      if (!registration) {
        continue;
      }

      const total = Number(it.ca ?? 0) + Number(it.exam ?? 0);
      const { grade, gradePoint } = inferGrade(total);

      // update existing score if present
      const existing = await prisma.score.findFirst({ where: { registrationId: it.registrationId } });

      if (existing) {
        const updated = await prisma.score.update({
          where: { id: existing.id },
          data: {
            ca: it.ca,
            exam: it.exam,
            total,
            grade,
            gradePoint,
            courseId,
            lecturerId: lecturerId.id,
            enteredById: session.user.id,
            sessionId: body.sessionId,
            semesterId: body.semesterId,
            registrationId: it.registrationId,
            status: 'DRAFT',
          },
        });

        results.push(updated);
        continue;
      }

      const create = await prisma.score.create({
          data: {
            ca: it.ca,
            exam: it.exam,
            total,
            grade,
            gradePoint,
            courseId,
            lecturerId: lecturerId.id,
            enteredById: session.user.id,
            sessionId: body.sessionId,
            semesterId: body.semesterId,
            studentId: it.studentId as string,
            registrationId: it.registrationId,
            status: 'DRAFT',
          },
        });
          results.push(create);


      continue;
    }

    return NextResponse.json({ updated: results.length, scores: results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unable to save scores' }, { status: 500 });
  }
}