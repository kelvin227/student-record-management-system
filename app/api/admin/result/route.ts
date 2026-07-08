import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Fetch all results with related data
export async function GET(request: NextRequest) {
  try {
    const results = await prisma.score.findMany({
      include: {
        student: {
          include: {
            user: true,
            program: true,
            department: true,
          },
        },
        course: {
          include: {
            semester: true,
            department: true,
          },
        },
        lecturer: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const formattedResults = results.map((result: any) => ({
      id: result.id,
      studentId: result.studentId,
      courseId: result.courseId,
      lecturerId: result.lecturerId,
      caScore: result.ca,
      examScore: result.exam,
      totalScore: result.total,
      grade: result.grade,
      gradePoint: result.gradePoint,
      status: "PUBLISHED", // Default status since Score model doesn't have it
      student: {
        id: result.student.id,
        matricNo: result.student.matricNo,
        firstName: result.student.firstName,
        lastName: result.student.lastName,
        level: result.student.level,
        departmentId: result.student.departmentId,
        programId: result.student.programId,
      },
      course: {
        id: result.course.id,
        code: result.course.code,
        title: result.course.title,
        creditUnit: result.course.creditUnit,
        level: result.course.level,
      },
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

// POST - Create a new result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      studentId,
      courseId,
      sessionId,
      semesterId,
      enteredById,
      caScore,
      examScore,
    } = body;

    // Validate required fields
    if (!studentId || !courseId || caScore === undefined || examScore === undefined || !sessionId || !semesterId) {
      console.log("Missing required fields"),
      console.log(body)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate total and grade
    const totalScore = Math.min(100, Math.max(0, caScore + examScore));
    const gradeResult = calculateGrade(totalScore);

    // Check if score already exists for this student-course combination
    const existingScore = await prisma.score.findFirst({
      where: { 
        AND:
          [
          {studentId},
          {courseId},
          {sessionId},
          {semesterId}
        ]  
      },
    });

    if (existingScore) {
      return NextResponse.json(
        { error: "Score already exists for this student-course combination" },
        { status: 400 }
      );
    }
    const allocation = await prisma.courseAllocation.findFirst({
  where: { courseId: courseId },
  include: {
    lecturer: true, // This brings back the full lecturer object
  },
});

    const lecturer = allocation?.lecturer;
    if(!lecturer){
      return NextResponse.json(
        { error: "Can not find the allocated lecturer to this course, please allocate a lecturer and try again" },
        { status: 401 }
      );
    }
      
    const score = await prisma.score.create({
      data: {
        studentId,
        courseId,
        sessionId,
        semesterId,
        enteredById,
        lecturerId: lecturer.id as string,
        ca: caScore,
        exam: examScore,
        total: totalScore,
        grade: gradeResult.grade,
        gradePoint: gradeResult.gradePoint,
      },
      include: {
        student: true,
        course: true,
        lecturer: true,
      },
    });

    return NextResponse.json(
      {
        id: score.id,
        studentId: score.studentId,
        courseId: score.courseId,
        lecturerId: score.lecturerId,
        caScore: score.ca,
        examScore: score.exam,
        totalScore: score.total,
        grade: score.grade,
        gradePoint: score.gradePoint,
        status: "DRAFT",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating result:", error);
    return NextResponse.json(
      { error: "Failed to create result" },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing result
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, caScore, examScore } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    // Check if result exists
    const existingScore = await prisma.score.findUnique({
      where: { id },
    });

    if (!existingScore) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    // Calculate new total and grade if scores are provided
    const newCa = caScore !== undefined ? caScore : existingScore.ca;
    const newExam = examScore !== undefined ? examScore : existingScore.exam;
    const totalScore = Math.min(100, Math.max(0, newCa + newExam));
    const gradeResult = calculateGrade(totalScore);

    const updatedScore = await prisma.score.update({
      where: { id },
      data: {
        ca: newCa,
        exam: newExam,
        total: totalScore,
        grade: gradeResult.grade,
        gradePoint: gradeResult.gradePoint,
      },
      include: {
        student: true,
        course: true,
        lecturer: true,
      },
    });

    return NextResponse.json({
      id: updatedScore.id,
      studentId: updatedScore.studentId,
      courseId: updatedScore.courseId,
      lecturerId: updatedScore.lecturerId,
      caScore: updatedScore.ca,
      examScore: updatedScore.exam,
      totalScore: updatedScore.total,
      grade: updatedScore.grade,
      gradePoint: updatedScore.gradePoint,
      status: "DRAFT",
    });
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json(
      { error: "Failed to update result" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a result
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    // Check if result exists
    const existingScore = await prisma.score.findUnique({
      where: { id },
    });

    if (!existingScore) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    await prisma.score.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Result deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json(
      { error: "Failed to delete result" },
      { status: 500 }
    );
  }
}

// Helper function to calculate grade
function calculateGrade(score: number) {
  const gradeRules = [
    { min: 70, grade: "A", point: 5 },
    { min: 60, grade: "B", point: 4 },
    { min: 50, grade: "C", point: 3 },
    { min: 45, grade: "D", point: 2 },
    { min: 40, grade: "E", point: 1 },
    { min: 0, grade: "F", point: 0 },
  ];

  const rule =
    gradeRules.find((item) => score >= item.min) ??
    gradeRules[gradeRules.length - 1];

  return { grade: rule.grade, gradePoint: rule.point };
}
