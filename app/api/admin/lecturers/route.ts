import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - Fetch all lecturers
export async function GET() {
  try {
    const lecturers = await prisma.lecturer.findMany({
      include: {
        department: true,
        user: {
          select: {
            email: true,
            active: true,
          },
        },
      },
    });

    return NextResponse.json(lecturers, { status: 200 });
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lecturers' },
      { status: 500 }
    );
  }
}

// POST - Create a new lecturer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId, firstName, lastName, email, departmentId, password } = body;

    // Validate input
    if (!staffId || !firstName || !lastName || !email || !departmentId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Check if staff ID already exists
    const existingStaff = await prisma.lecturer.findUnique({
      where: { staffId },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff ID already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and lecturer
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'LECTURER',
        active: true,
      },
    });

    const lecturer = await prisma.lecturer.create({
      data: {
        staffId,
        firstName,
        lastName,
        departmentId,
        userId: user.id,
      },
      include: {
        department: true,
        user: {
          select: {
            email: true,
            active: true,
          },
        },
      },
    });

    return NextResponse.json(lecturer, { status: 201 });
  } catch (error) {
    console.error('Error creating lecturer:', error);
    return NextResponse.json(
      { error: 'Failed to create lecturer' },
      { status: 500 }
    );
  }
}

// PUT - Update a lecturer profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, email, departmentId, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Lecturer ID is required' },
        { status: 400 }
      );
    }

    // Check if lecturer exists
    const lecturer = await prisma.lecturer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!lecturer) {
      return NextResponse.json(
        { error: 'Lecturer not found' },
        { status: 404 }
      );
    }

    // Check if new email is already taken by another user
    if (email && email !== lecturer.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    // Update lecturer
    const updatedLecturer = await prisma.lecturer.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(departmentId && { departmentId }),
      },
      include: {
        department: true,
        user: {
          select: {
            email: true,
            active: true,
          },
        },
      },
    });

    // Update user if email or password provided
    if (email || password) {
      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: lecturer.userId },
        data: updateData,
      });
    }

    return NextResponse.json(updatedLecturer, { status: 200 });
  } catch (error) {
    console.error('Error updating lecturer:', error);
    return NextResponse.json(
      { error: 'Failed to update lecturer' },
      { status: 500 }
    );
  }
}

// DELETE - Mark lecturer as inactive
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Lecturer ID is required' },
        { status: 400 }
      );
    }

    // Check if lecturer exists
    const lecturer = await prisma.lecturer.findUnique({
      where: { id },
    });

    if (!lecturer) {
      return NextResponse.json(
        { error: 'Lecturer not found' },
        { status: 404 }
      );
    }

    // Mark user as inactive instead of deleting
    await prisma.user.update({
      where: { id: lecturer.userId },
      data: { active: false },
    });

    return NextResponse.json(
      { message: 'Lecturer has been marked as inactive' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lecturer:', error);
    return NextResponse.json(
      { error: 'Failed to delete lecturer' },
      { status: 500 }
    );
  }
}
