"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BookOpen, Users, FileText, ClipboardEdit, GraduationCap, ArrowLeft, UserCircle, DownloadCloud, Upload, Save, Printer } from 'lucide-react';
import { CourseAllocation } from '../admin/courseAllocationComp';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '../ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Semester } from '../admin/semestersComp';
import { Session } from '../admin/sessionComp';
import { json } from 'stream/consumers';


// Types matching prisma schema (subset)
export type Course = {
  id: string
  code: string
  title: string
  creditUnit: number
  level: number
  semester: {
    id: string
    name: string
  }
  departmentId: string
  allocations?: { id: string; lecturerId: string }[]
  registrationsCount?: number // number of students registered for the course
}

type Props = {
  onViewStudents?: (course: Course) => void
  onEnterScores?: (course: Course) => void
  onViewResultSheet?: (course: Course) => void
}

type StudentRegistration = {
  id: string;
  student: {
    id: string;
    matricNo: string;
    firstName: string;
    lastName: string;
  };
  studentId: string;
  status: string;
  scores: any;
  course: any;
};

type ScoreEntry = {
  registrationId: string;
  studentId: string;
  matricNo: string;
  firstName: string;
  lastName: string;
  ca: number | null;
  exam: number | null;
  status: string;
};

type ResultRow = {
  id: string;
  matricNo: string;
  firstName: string;
  lastName: string;
  ca: number | null;
  exam: number | null;
  total: number;
  grade: string | null;
  remark: string;
};

type MessageState = {
  type: 'success' | 'error';
  text: string;
};

export default function CourseManagement(){
  const [activeCourseId, setActiveCourseId] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'students' | 'scores' | 'result' | null>(null);
  const [semester, setSemester] = useState<Semester[]>([]);
  const [session, setSession] = useState<Session[]>([]);


  useEffect(() => {
    fetchData();
  }, []);

  
       const fetchData = async () => {
    try {
      const [semesterRes, sessionRes] = await Promise.all([
        fetch('/api/lecturer/semester'),
        fetch('/api/lecturer/session'),

      ]);

      if (!semesterRes.ok || !sessionRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const semesterData = await semesterRes.json();
      const sessionData = await sessionRes.json();

      setSemester(semesterData);
      setSession(sessionData);
    } catch (err) {
      console.log('Failed to load data. Please try again.');
      console.error(err);
    } finally {
    }
  };

  if (activeCourseId) {
    if (viewMode === 'scores') {
      return <EnterScoresView course={activeCourseId} session={session} semester={semester} onBack={() => { setActiveCourseId(null); setViewMode(null); }} />
    }

    if (viewMode === 'result') {
      return <ResultSheetView course={activeCourseId} onBack={() => { setActiveCourseId(null); setViewMode(null); }} />
    }

    return (
      <StudentView
        course={activeCourseId}
        onBack={() => { setActiveCourseId(null); setViewMode(null); }}
      />
    )
  }

  return (
    <CourseComp 
      onViewStudents={(id) => { setActiveCourseId(id); setViewMode('students'); }}
      onEnterScores={(id) => { setActiveCourseId(id); setViewMode('scores'); }}
      onViewResultSheet={(id) => { setActiveCourseId(id); setViewMode('result'); }}
    />
  )
}

export function CourseComp({ onViewStudents, onEnterScores, onViewResultSheet }: Props) {
  const [courses, setCourses] = useState<CourseAllocation[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchCourses();
  }, []);


  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lecturer/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold light:text-zinc-900">Assigned Courses</h2>
          <p className="text-sm text-zinc-500">Manage your current academic semester load</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl text-zinc-400">
          No courses currently assigned to your profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c.course?.id} className="hover:shadow-md transition-shadow border-zinc-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="font-mono">{c.course?.code}</Badge>
                  <span className="text-xs font-medium text-zinc-500">{c.course?.level} Level</span>
                </div>
                <h3 className="font-semibold text-lg leading-tight mt-2">{c.course?.title}</h3>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex gap-4 text-sm text-zinc-600">
                  <span className="flex items-center gap-1.5"><GraduationCap size={14} /> {c.course?.creditUnit} Units</span>
                  <span className="flex items-center gap-1.5"><BookOpen size={14} /> {c.course?.semester?.name}</span>
                  <span className="flex items-center gap-1.5"><Users size={14} /> {c.course?.registrations?.length || 0} Students</span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t bg-zinc-50/50 p-4 gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => onViewStudents?.(c.course as Course)}>
                  <Users size={16} className="mr-1.5" /> Students
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-emerald-200 hover:bg-emerald-50" onClick={() => onEnterScores?.(c.course as Course)}>
                  <ClipboardEdit size={16} className="mr-1.5" /> Grades
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => onViewResultSheet?.(c.course as Course)}>
                  <FileText size={16} className="mr-1.5" /> Results
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentView({ course, onBack }: { course: Course; onBack: () => void }) {
  const [students, setStudents] = useState<StudentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lecturer/courses/${course.id}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .finally(() => setLoading(false));
  }, [course]);

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-2">
        <ArrowLeft size={16} /> Back to Courses
      </Button>

      <div className=" border rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Registered Students</h2>
          <p className="text-sm text-zinc-500">Total students: {students.length}</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matric No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : students.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell className="font-mono font-medium">{reg.student.matricNo}</TableCell>
                <TableCell className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                    <UserCircle size={18} className="text-zinc-500" />
                  </div>
                  {reg.student.lastName} {reg.student.firstName}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={reg.status === "APPROVED" ? "default" : "secondary"}>
                    {reg.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function EnterScoresView({ course, semester, session, onBack }: { course: Course; semester: Semester[]; session: Session[]; onBack: () => void }) {
  const [students, setStudents] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openDownloadMenu, setOpenDownloadMenu] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
      if (!selectedSession || !selectedSemester) return;


    fetchStudents();
  }, [course, selectedSemester, selectedSession]);

      const fetchStudents = async () => {
      setLoading(true);
      try {

        const response = await fetch(`/api/lecturer/courses/${course.id}/registration?sessionId=${selectedSession?.id}&semesterId=${selectedSemester?.id}`);
        const data: StudentRegistration[] = await response.json();
        setStudents(data.map((registration) => ({
          registrationId: registration.id,
          studentId: registration.studentId,
          matricNo: registration.student.matricNo,
          firstName: registration.student.firstName,
          lastName: registration.student.lastName,
          ca: registration.course.scores.ca,
          exam: registration.course.scores.exam,
          status: registration.status,
          scores: registration.course.scores
        })));
      } catch (error) {
        console.error('Unable to load registered students:', error);
        setMessage({ type: 'error', text: 'Unable to load registered students. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

  const updateScore = (registrationId: string, field: 'ca' | 'exam', value: string) => {
    const parsed = value === '' ? null : Number(value);
    if (value !== '' && Number.isNaN(parsed)) {
      return;
    }

    setStudents((current) =>
      current.map((row) =>
        row.registrationId === registrationId
          ? { ...row, [field]: parsed }
          : row,
      ),
    );
  };

  const saveScores = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const payload = students
        .filter((row) => row.ca !== null || row.exam !== null)
        .map((row) => ({
          registrationId: row.registrationId,
          studentId: row.studentId,
          ca: row.ca ?? 0,
          exam: row.exam ?? 0,
        }));

      if (payload.length === 0) {
        setMessage({ type: 'error', text: 'Enter at least one CA or exam score before saving.' });
        return;
      }


      const response = await fetch(`/api/lecturer/courses/${course.id}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scores: payload, sessionId: selectedSession?.id,
        semesterId: selectedSemester?.id, }),
      });

      if (!response.ok) {
        throw new Error('Save request failed');
      }

      setMessage({ type: 'success', text: 'Scores saved successfully.' });
    } catch (error) {
      console.error('Failed to save scores:', error);
      setMessage({ type: 'error', text: 'Failed to save scores. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const exportTemplate = async () => {
    if (students.length === 0) {
      setMessage({ type: 'error', text: 'There are no registered students to export.' });
      return;
    }
    if (!selectedSession || !selectedSemester) {
      setMessage({ type: 'error', text: 'Please select both session and semester before downloading the template.' });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const XLSX: any = await import('xlsx');
      const header = ['Matric No', 'First Name', 'Last Name', 'courseId', 'studentId', 'RegistrationId', 'sessionId', 'semesterId', 'CA', 'Exam'];
      const rows = students.map((row) => [row.matricNo, row.firstName, row.lastName, course.id, row.studentId, row.registrationId, selectedSession.id, selectedSemester.id, '', '']);
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');
      const fileData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([fileData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `score-entry-template-${course.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Template downloaded. Fill CA and Exam columns and import the file.' });
    } catch (error) {
      console.error('Failed to export template:', error);
      setMessage({ type: 'error', text: 'Unable to create the Excel template. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const normalizeKeys = (row: Record<string, any>) => {
    return Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key.toString().trim().toLowerCase()] = String(value ?? '').trim();
      return acc;
    }, {});
  };

  const importScores = async (file: File) => {
    if (!file) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const XLSX: any = await import('xlsx');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const importedRows = rawRows.map((row) => {
        const normalized = normalizeKeys(row);
        const registrationId = normalized['registration id'] || normalized['registration_id'] || normalized['registrationid'] || normalized['id'] || '';
        const matricNo = normalized['matric no'] || normalized['matric_no'] || normalized['matricno'] || '';
        const caValue = normalized['ca'] || normalized['continuous assessment'] || '';
        const examValue = normalized['exam'] || normalized['examination'] || '';
        return {
          registrationId,
          matricNo,
          ca: caValue === '' ? null : Number(caValue),
          exam: examValue === '' ? null : Number(examValue),
        };
      });

      const updated = students.map((student) => {
        const match = importedRows.find(
          (row) =>
            (row.registrationId && row.registrationId === student.registrationId) ||
            (row.matricNo && row.matricNo.toLowerCase() === student.matricNo.toLowerCase()),
        );

        if (!match) {
          return student;
        }

        return {
          ...student,
          ca: match.ca !== null ? match.ca : student.ca,
          exam: match.exam !== null ? match.exam : student.exam,
        };
      });

      setStudents(updated);
      setMessage({ type: 'success', text: 'Scores loaded from the spreadsheet. Review and save to persist.' });
    } catch (error) {
      console.error('Failed to import scores:', error);
      setMessage({ type: 'error', text: 'Failed to import scores from the spreadsheet. Verify the file format and headers.' });
    } finally {
      setBusy(false);
    }
  };
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.matricNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch;
  });
  const filterSemester = semester.filter((s) => {
    const matchSemester = s.id.includes(course.semester.id);
    return matchSemester;
  })
  return (
    <div className="p-6 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            importScores(file);
            event.target.value = '';
          }
        }}
      />

      <Button variant="ghost" onClick={onBack} className="pl-0 gap-2">
        <ArrowLeft size={16} /> Back to Courses
      </Button>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold light:text-zinc-900">Score Entry</h2>
          <p className="text-sm text-zinc-500">Enter CA and exam scores for registered students individually or in bulk.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Dialog open={openDownloadMenu} onOpenChange={setOpenDownloadMenu}>
            <DialogTrigger className={"flex items-center justify-center border px-4 rounded-md bg-gray-500/10"} onClick={() => setOpenDownloadMenu(true)} disabled={busy || students.length === 0}>
              <DownloadCloud size={16} className="mr-2" /> Download Template
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Download Template</DialogTitle>
                <DialogDescription>
                  Click the button below to download the score entry template.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col justify-center gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label>Session</Label>
                  <Select value={selectedSession} onValueChange={(value) => {
                    setSelectedSession(value);
                  }}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select session">{selectedSession ? selectedSession.name : "Select session"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {session.map((s) => (
                          <SelectItem key={s.id} value={s}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                  <div className="flex flex-col gap-2">
                  <Label>Semester</Label>
                  <Select value={selectedSemester} onValueChange={(value) => setSelectedSemester(value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select semester">{selectedSemester ? selectedSemester.name : "Select semester"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {semester.map((s) => (
                          <SelectItem key={s.id} value={s}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={exportTemplate} >
                  <DownloadCloud size={16} className="mr-2" /> Download Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportTemplate} className="hidden">
            <DownloadCloud size={16} className="mr-2" /> Download Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy || students.length === 0}>
            <Upload size={16} className="mr-2" /> Import XLSX
          </Button>
          <Button onClick={saveScores} disabled={saving || busy || students.length === 0}>
            <Save size={16} className="mr-2" /> Save Scores
          </Button>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {message.text}
        </div>
      )}

             <div className={showScoreEntry? "hidden" :"flex flex-col justify-center gap-4 mt-4"}>
                <div className="flex flex-col gap-2">
                  <Label>Session</Label>
                  <Select value={selectedSession} onValueChange={(value) => {
                    setSelectedSession(value);
                  }}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select session">{selectedSession ? selectedSession.name : "Select session"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {session.map((s) => (
                          <SelectItem key={s.id} value={s}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                  <div className="flex flex-col gap-2">
                  <Label>Semester</Label>
                  <Select value={selectedSemester} onValueChange={(value) => setSelectedSemester(value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select semester">{selectedSemester ? selectedSemester.name : "Select semester"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filterSemester.map((s) => (
                          <SelectItem key={s.id} value={s}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => setShowScoreEntry(true)} >
                  View Student
                </Button>
              </div>

      <div className={showScoreEntry?"rounded-xl border shadow-sm overflow-x-auto" :"hidden"}>
        <Input type='search' placeholder='search for a student but matric number' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matric No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">CA</TableHead>
              <TableHead className="text-center">Exam</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading registered students...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                  No registered students found for this course.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const total = (student.ca ?? 0) + (student.exam ?? 0);
                return (
                  <TableRow key={student.registrationId}>
                    <TableCell className="font-mono font-medium">{student.matricNo}</TableCell>
                    <TableCell className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                        <UserCircle size={18} className="text-zinc-500" />
                      </div>
                      {student.lastName} {student.firstName}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={student.ca === null ? '' : student.ca}
                        onChange={(event) => updateScore(student.registrationId, 'ca', event.target.value)}
                        type="number"
                        min={0}
                        step="0.5"
                        className="w-full"
                        placeholder="CA"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={student.exam === null ? '' : student.exam}
                        onChange={(event) => updateScore(student.registrationId, 'exam', event.target.value)}
                        type="number"
                        min={0}
                        step="0.5"
                        className="w-full"
                        placeholder="Exam"
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium">{total}</TableCell>
                    <TableCell className="text-center">
                      <Button>
                        Save as Draft
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="light:bg-zinc-50 border-zinc-200">
        <CardHeader>
          <h3 className="text-lg font-semibold">Bulk Score Import</h3>
        </CardHeader>
        <CardContent className="space-y-3 text-sm light:text-zinc-600">
          <div>
            Download the template and fill the CA and Exam columns for each student. Keep the Registration ID or Matric No values intact so the system can map scores correctly.
          </div>
          <div>
            Supported spreadsheet columns:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Registration ID</li>
              <li>Matric No</li>
              <li>First Name</li>
              <li>Last Name</li>
              <li>CA</li>
              <li>Exam</li>
            </ul>
          </div>
          <div className="text-xs light:text-zinc-500">
            Empty CA or Exam values will not overwrite existing score values when imported.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ResultSheetView({ course, onBack }: { course: Course; onBack: () => void }) {
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const inferGrade = (total: number) => {
      if (total >= 70) return 'A';
      if (total >= 60) return 'B';
      if (total >= 50) return 'C';
      if (total >= 45) return 'D';
      return 'F';
    };

    const buildRemark = (grade: string) => (grade === 'F' ? 'FAIL' : 'PASS');

    const normalizeRow = (row: any): ResultRow => {
      const caValue = row.ca ?? row.caScore ?? row.ca_value ?? null;
      const examValue = row.exam ?? row.examScore ?? row.exam_value ?? null;
      const ca = caValue === null || caValue === '' ? null : Number(caValue);
      const exam = examValue === null || examValue === '' ? null : Number(examValue);
      const total = Number(ca ?? 0) + Number(exam ?? 0);
      const grade = row.grade ?? inferGrade(total);

      return {
        id: row.id ?? row.registrationId ?? row.studentId ?? `${row.matricNo}-${total}`,
        matricNo: row.matricNo ?? row.student?.matricNo ?? '',
        firstName: row.firstName ?? row.student?.firstName ?? '',
        lastName: row.lastName ?? row.student?.lastName ?? '',
        ca: Number.isFinite(ca) ? ca : null,
        exam: Number.isFinite(exam) ? exam : null,
        total,
        grade,
        remark: buildRemark(grade),
      };
    };

    const loadResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/lecturer/courses/${course.id}/scores`);
        if (!response.ok) {
          throw new Error('Unable to fetch result data');
        }

        const data = await response.json();
        const rawRows = Array.isArray(data) ? data : data.scores ?? data;
        const firstRow = Array.isArray(rawRows) && rawRows.length > 0 ? rawRows[0] : null;
        const courses = firstRow?.course ?? (Array.isArray(data) ? {} : data.course ?? data.courseInfo ?? {});

        setCourseCode(courses?.code ?? '');
        setCourseTitle(courses?.title ?? '');
        setResults(Array.isArray(rawRows) ? rawRows.map(normalizeRow) : []);
      } catch (err) {
        console.error('Unable to load result sheet:', err);
        setError('Unable to load result sheet. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [course]);

  const exportPdf = () => {
    window.print();
  };

  const printSheet = () => {
    window.print();
  };

  const downloadExcel = async () => {
    if (results.length === 0) {
      return;
    }

    setBusy(true);

    try {
      const XLSX: any = await import('xlsx');
      const header = ['Matric No', 'First Name', 'Last Name', 'CA', 'Exam', 'Total', 'Grade', 'Remark'];
      const rows = results.map((row) => [row.matricNo, row.firstName, row.lastName, row.ca ?? '', row.exam ?? '', row.total, row.grade ?? '', row.remark]);
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Result Sheet');
      const fileData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([fileData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = courseCode ? `${courseCode}-result-sheet.xlsx` : `result-sheet-${course.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Unable to export result sheet:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-2">
        <ArrowLeft size={16} /> Back to Courses
      </Button>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold light:text-zinc-900">Result Sheet</h2>
          <p className="text-sm text-zinc-500">This view is read-only. Use the actions below to print or export the result sheet.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="outline" onClick={exportPdf} disabled={busy || loading || results.length === 0}>
            <FileText size={16} className="mr-2" /> Export PDF
          </Button>
          <Button variant="outline" onClick={printSheet} disabled={busy || loading || results.length === 0}>
            <Printer size={16} className="mr-2" /> Print
          </Button>
          <Button variant="outline" onClick={downloadExcel} disabled={busy || loading || results.length === 0}>
            <DownloadCloud size={16} className="mr-2" /> Download Excel
          </Button>
        </div>
      </div>

      {(courseCode || courseTitle) && (
        <div className="rounded-xl border light:bg-zinc-50 p-4">
          <div className="text-sm text-zinc-500">Course</div>
          <div className="mt-1 text-lg font-semibold">{courseCode} {courseTitle}</div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matric No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">CA</TableHead>
              <TableHead className="text-center">Exam</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-center">Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Loading result sheet...
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                  No results found for this course.
                </TableCell>
              </TableRow>
            ) : (
              results.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono font-medium">{row.matricNo}</TableCell>
                  <TableCell>{row.lastName} {row.firstName}</TableCell>
                  <TableCell className="text-center">{row.ca ?? '-'}</TableCell>
                  <TableCell className="text-center">{row.exam ?? '-'}</TableCell>
                  <TableCell className="text-center font-medium">{row.total}</TableCell>
                  <TableCell className="text-center">{row.grade}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={row.remark === 'PASS' ? 'default' : 'secondary'}>
                      {row.remark}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

