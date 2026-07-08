// prisma/seed.ts

import { prisma } from "@/lib/db"


async function main() {
  await prisma.course.createMany({
    data: [
      {
        code: 'CSC101',
        title: 'Introduction to Computer Science',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 100,
        semesterId: 'first-sem-id',
      },
      {
        code: 'CSC102',
        title: 'Programming Fundamentals',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 100,
        semesterId: 'second-sem-id',
      },
      {
        code: 'CSC201',
        title: 'Data Structures & Algorithms',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 200,
        semesterId: 'first-sem-id',
      },
      {
        code: 'CSC202',
        title: 'Database Systems',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 200,
        semesterId: 'second-sem-id',
      },
      {
        code: 'CSC301',
        title: 'Operating Systems',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 300,
        semesterId: 'first-sem-id',
      },
      {
        code: 'CSC302',
        title: 'Software Engineering',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 300,
        semesterId: 'second-sem-id',
      },
      {
        code: 'CSC401',
        title: 'Artificial Intelligence',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 400,
        semesterId: 'first-sem-id',
      },
      {
        code: 'CSC402',
        title: 'Computer Networks',
        creditUnit: 3,
        departmentId: 'CSC-dept-id',
        level: 400,
        semesterId: 'second-sem-id',
      },
      {
        code: 'MTH101',
        title: 'General Mathematics I',
        creditUnit: 3,
        departmentId: 'MTH-dept-id',
        level: 100,
        semesterId: 'first-sem-id',
      },
      {
        code: 'MTH102',
        title: 'General Mathematics II',
        creditUnit: 3,
        departmentId: 'MTH-dept-id',
        level: 100,
        semesterId: 'second-sem-id',
      },
    ],
  })
}

main()
  .then(() => console.log('Courses seeded'))
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
