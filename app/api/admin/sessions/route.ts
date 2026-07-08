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

// POST - Create a new session
export async function POST(request: NextRequest) {
  try {

    const { name, isActive, userId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Session name is required" },
        { status: 400 }
      );
    }

    // If activating a session, deactivate all others
    if (isActive) {
      await prisma.session.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const academicSessions = await prisma.session.create({
      data: {
        name,
        isActive: isActive || false,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "CREATE",
        entity: "Session",
        entityId: academicSessions.id,
      },
    });

    return NextResponse.json(academicSessions, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// PUT - Update a session
export async function PUT(request: NextRequest) {
  try {
    const { id, name, isActive, userId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Verify session exists
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // If activating this session, deactivate all others
    if (isActive && !existingSession.isActive) {
      await prisma.session.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const academicSessions = await prisma.session.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "UPDATE",
        entity: "Session",
        entityId: academicSessions.id,
      },
    });

    return NextResponse.json(academicSessions, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Delete session
    await prisma.session.delete({
      where: { id },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: body.userId,
        action: "DELETE",
        entity: "Session",
        entityId: id,
      },
    });

    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
