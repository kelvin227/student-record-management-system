"use server";

import { prisma } from "@/lib/db";

export async function calculateGPA(
  studentId: string,
  sessionId: string,
  semesterId: string
) {
  try {
    if (!studentId || !sessionId || !semesterId) {
      return {
        success: false,
        score: 0,
        message: "Missing required fields",
      };
    }

    const scores = await prisma.score.findMany({
      where: {
        studentId,
        sessionId,
        semesterId,
        status: "PUBLISHED",
      },
      include: {
        course: true,
      },
    });

    if (scores.length === 0) {
      return {
        success: false,
        score: 0,
        message:
          "There are no published results for this student in this semester.",
      };
    }

    let totalPoints = 0;
    let totalUnits = 0;

    scores.forEach((score) => {
      totalPoints += score.gradePoint * score.course.creditUnit;
      totalUnits += score.course.creditUnit;
    });

    if (totalUnits === 0) {
      return {
        success: false,
        score: 0,
        message: "No valid credit units found.",
      };
    }

    const gpa = Number((totalPoints / totalUnits).toFixed(2));

    return {
      success: true,
      score: gpa,
      message: "GPA calculated successfully",
    };
  } catch (error) {
    console.error("GPA Calculation Error:", error);

    return {
      success: false,
      score: 0,
      message: "Failed to calculate GPA",
    };
  }
}

export async function calculateCGPA(studentId: string) {
  try {
    if (!studentId) {
      return {
        success: false,
        cgpa: 0,
        message: "Student ID is required",
      };
    }

    const records = await prisma.gPARecord.findMany({
      where: {
        studentId,
      },
    });

    if (records.length === 0) {
      return {
        success: true,
        cgpa: 0,
        message: "No GPA records found",
      };
    }

    const total = records.reduce(
      (sum, record) => sum + record.gpa,
      0
    );

    const cgpa = Number((total / records.length).toFixed(2));

    return {
      success: true,
      cgpa,
      message: "CGPA calculated successfully",
    };
  } catch (error) {
    console.error("CGPA Calculation Error:", error);

    return {
      success: false,
      cgpa: 0,
      message: "Failed to calculate CGPA",
    };
  }
}

export async function validateStudentResults(
  studentId: string,
  sessionId: string,
  semesterId: string
) {
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return {
        valid: false,
        errors: [
          {
            code: "STUDENT_NOT_FOUND",
            message: "Student does not exist",
          },
        ],
      };
    }

    const registrations = await prisma.courseRegistration.findMany({
      where: {
        studentId,
        sessionId,
        semesterId,
      },
      include: {
        course: true,
      },
    });

    if (registrations.length === 0) {
      return {
        valid: false,
        errors: [
          {
            code: "NO_REGISTERED_COURSES",
            message:
              "Student has not registered any course for this semester",
          },
        ],
      };
    }

    const scores = await prisma.score.findMany({
      where: {
        studentId,
        sessionId,
        semesterId,
      },
      include: {
        course: true,
      },
    });

    if (scores.length === 0) {
      return {
        valid: false,
        errors: [
          {
            code: "NO_RESULTS",
            message:
              "No score records were found for this student",
          },
        ],
      };
    }

    const errors: any[] = [];

    const registeredCourseIds = registrations.map(
      (registration) => registration.courseId
    );

    const scoreCourseIds = scores.map(
      (score) => score.courseId
    );

    const missingCourses = registrations.filter(
      (registration) =>
        !scoreCourseIds.includes(registration.courseId)
    );

    if (missingCourses.length > 0) {
      errors.push({
        code: "INCOMPLETE_RESULTS",
        message:
          "Some registered courses do not have scores",
        courses: missingCourses.map(
          (course) =>
            `${course.course.code} - ${course.course.title}`
        ),
      });
    }

    const extraScores = scores.filter(
      (score) =>
        !registeredCourseIds.includes(score.courseId)
    );

    if (extraScores.length > 0) {
      errors.push({
        code: "INVALID_SCORE_RECORDS",
        message:
          "Scores exist for courses that were not registered",
        courses: extraScores.map(
          (score) =>
            `${score.course.code} - ${score.course.title}`
        ),
      });
    }

    const unpublishedResults = scores.filter(
      (score) => score.status !== "PUBLISHED"
    );

    if (unpublishedResults.length > 0) {
      errors.push({
        code: "UNPUBLISHED_RESULTS",
        message:
          "Some scores have not been published",
        courses: unpublishedResults.map(
          (score) =>
            `${score.course.code} - ${score.course.title}`
        ),
      });
    }

    const ungradedResults = scores.filter(
      (score) =>
        score.gradePoint === null ||
        score.gradePoint === undefined
    );

    if (ungradedResults.length > 0) {
      errors.push({
        code: "UNPROCESSED_GRADES",
        message:
          "Some scores do not have grade points assigned",
        courses: ungradedResults.map(
          (score) =>
            `${score.course.code} - ${score.course.title}`
        ),
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      registeredCourses: registrations.length,
      submittedScores: scores.length,
    };
  } catch (error) {
    console.error(error);

    return {
      valid: false,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message:
            "An unexpected error occurred while validating results",
        },
      ],
    };
  }
}
export async function validateAcademicHistory(
  studentId: string,
  sessionId: string
) {
  try {
    // Get all semesters for the session
    const semesters = await prisma.semester.findMany({
      where: {
        sessionId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (semesters.length === 0) {
      return {
        success: false,
        message: "No semesters found for this session",
      };
    }

    // GPA records generated for this student in this session
    const gpaRecords = await prisma.gPARecord.findMany({
      where: {
        studentId,
        sessionId,
      },
      select: {
        semesterId: true,
      },
    });

    const generatedSemesterIds = new Set(
      gpaRecords.map((record) => record.semesterId)
    );

    const missingSemesters = semesters.filter(
      (semester) => !generatedSemesterIds.has(semester.id)
    );

    if (missingSemesters.length > 0) {
      return {
        success: false,
        complete: false,
        missingSemesters: missingSemesters.map((s) => s.name),
        message: `Missing GPA records for ${missingSemesters.length} semester(s)`,
      };
    }

    return {
      success: true,
      complete: true,
      message: "Academic history is complete",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      complete: false,
      message: "Failed to validate academic history",
    };
  }
}
export async function generateGPARecord(
  studentId: string,
  sessionId: string,
  semesterId: string
) {
  try {
    if (!studentId || !sessionId || !semesterId) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const gpaResult = await calculateGPA(
      studentId,
      sessionId,
      semesterId
    );

    if (!gpaResult.success) {
      return {
        success: false,
        message: gpaResult.message,
      };
    }

    const currentGPA = gpaResult.score;

    // Get all existing GPA records except the current semester
    const existingRecords = await prisma.gPARecord.findMany({
      where: {
        studentId,
        NOT: {
          sessionId,
          semesterId,
        },
      },
    });

    const totalPreviousGPA = existingRecords.reduce(
      (sum, record) => sum + record.gpa,
      0
    );

    const totalSemesters = existingRecords.length + 1;

    const cgpa = Number(
      (
        (totalPreviousGPA + currentGPA) /
        totalSemesters
      ).toFixed(2)
    );

    const record = await prisma.gPARecord.upsert({
      where: {
        studentId_sessionId_semesterId: {
          studentId,
          sessionId,
          semesterId,
        },
      },
      update: {
        gpa: currentGPA,
        cgpa,
      },
      create: {
        studentId,
        sessionId,
        semesterId,
        gpa: currentGPA,
        cgpa,
      },
    });

    return {
      success: true,
      message: "GPA record generated successfully",
      data: record,
    };
  } catch (error) {
    console.error("Generate GPA Record Error:", error);

    return {
      success: false,
      message: "Failed to generate GPA record",
    };
  }
}


export async function generateBatchGPARecord(
  level: number,
  department: string,
  sessionId: string,
  semesterId: string
) {
  try {
        const failedStudents = [];
const successfulStudents = [];
    if (!level || !department || !sessionId || !semesterId) {
      console.log(level)
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const students = await prisma.student.findMany({
      where: { level, departmentId: department, },
    })

    let gpaResult;
    let record;
for (const student of students) {
  const validation = await validateStudentResults(
    student.id,
    sessionId,
    semesterId
  );

  if (!validation.valid) {
    failedStudents.push({
      studentId: student.id,
      studentName: student.lastName + student.firstName,
      errors: validation.errors,
    });

    continue;
  }

   gpaResult = await calculateGPA(
      student.id,
      sessionId,
      semesterId
    );

    record = await prisma.gPARecord.upsert({
      where: {
        studentId_sessionId_semesterId: {
          studentId: student.id,
          sessionId,
          semesterId,
        },
      },
      update: {
        gpa: gpaResult.score,
        // cgpa,
      },
      create: {
        studentId: student.id,
        sessionId,
        semesterId,
        gpa: gpaResult.score,
        cgpa: 0,
      },
    });

  successfulStudents.push(student.id);
}



    if (!gpaResult?.success) {
      return {
        success: false,
        message: gpaResult?.message as string,
      };
    }

    // // Get all existing GPA records except the current semester
    // const existingRecords = await prisma.gPARecord.findMany({
    //   where: {
    //     student.id,
    //     NOT: {
    //       sessionId,
    //       semesterId,
    //     },
    //   },
    // });

    // const totalPreviousGPA = existingRecords.reduce(
    //   (sum, record) => sum + record.gpa,
    //   0
    // );

    // const totalSemesters = existingRecords.length + 1;

    // const cgpa = Number(
    //   (
    //     (totalPreviousGPA + currentGPA) /
    //     totalSemesters
    //   ).toFixed(2)
    // );
    console.log("skipped", failedStudents.length);
    console.log("generated", successfulStudents.length);
    console.log("failed student", failedStudents);
    console.log("successful student", successfulStudents);

    return {
      success: true,
      message: "GPA record generated successfully",
      generated: successfulStudents.length,
      skipped: failedStudents.length,
      successfulStudents,
      failedStudents,
      data: record,
    };
  } catch (error) {
    console.error("Generate GPA Record Error:", error);

    return {
      success: false,
      message: "Failed to generate GPA record",
    };
  }
}

export async function generateBatchCGPARecord(
  level: number,
  department: string,
  sessionId: string,
) {
  try {
    if (!level || !department || !sessionId ) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const students = await prisma.student.findMany({
      where: {
        level,
        departmentId: department,
      },
      select: {
        id: true,
        matricNo: true,
        firstName: true,
        lastName: true,
      },
    });

    if (students.length === 0) {
      return {
        success: false,
        message: "No students found for the selected department and level",
      };
    }

    const successfulStudents: {
      studentId: string;
      matricNumber: string;
      cgpa: number;
    }[] = [];

    const failedStudents: {
      studentId: string;
      matricNumber: string;
      reason: string;
    }[] = [];

    for (const student of students) {
      try {
        // Check if GPA records are complete
        const validation = await validateAcademicHistory(
          student.id,
          sessionId
        );

        if (!validation.complete) {
          failedStudents.push({
            studentId: student.id,
            matricNumber: student.matricNo,
            reason:
              validation.message ||
              "Academic history validation failed",
          });

          continue;
        }

        const cgpaResult = await calculateCGPA(student.id);

        if (!cgpaResult.success) {
          failedStudents.push({
            studentId: student.id,
            matricNumber: student.matricNo,
            reason: cgpaResult.message,
          });

          continue;
        }

        await prisma.gPARecord.updateMany({
          where: {
            studentId: student.id,
            sessionId,
          },
          data: {
            cgpa: cgpaResult.cgpa,
          },
        });

        successfulStudents.push({
          studentId: student.id,
          matricNumber: student.matricNo,
          cgpa: cgpaResult.cgpa,
        });
      } catch (studentError) {
        console.error(
          `CGPA Generation Error for student ${student.id}:`,
          studentError
        );

        failedStudents.push({
          studentId: student.id,
          matricNumber: student.matricNo,
          reason: "Unexpected error occurred",
        });
      }
    }

    return {
      success: true,
      message: `CGPA generation completed. ${successfulStudents.length} successful, ${failedStudents.length} skipped.`,
      generated: successfulStudents.length,
      skipped: failedStudents.length,
      successfulStudents,
      failedStudents,
    };
  } catch (error) {
    console.error("Batch CGPA Generation Error:", error);

    return {
      success: false,
      message: "Failed to generate CGPA records",
    };
  }
}
