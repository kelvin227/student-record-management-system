import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth();
    if(!session || session?.user.role !== 'LECTURER'){
        return NextResponse.json(
      { error: 'Unauthorized lecturer request' },
      { status: 401 }
    )
    }
    const userId = session.user.id
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized lecturer request' },
      { status: 401 }
    )
  }

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!lecturer || lecturer.user.role !== 'LECTURER') {
      return NextResponse.json(
        { error: 'Lecturer profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(lecturer)
  } catch (error) {
    console.error('Lecturer profile error:', error)
    return NextResponse.json(
      { error: 'Failed to load lecturer profile' },
      { status: 500 }
    )
  }
}
