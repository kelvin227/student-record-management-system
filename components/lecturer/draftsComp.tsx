"use client";

import { useState, useEffect } from "react";
import { Score } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Send, ArrowBigDown, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

interface ScoreWithRelations extends Score {
  student?: { firstName: string; lastName: string };
  course?: { code: string; title: string };
}

export function DraftsComp() {
  const [draftScores, setDraftScores] = useState<ScoreWithRelations[]>([]);
  const [submittedScores, setSubmittedScores] = useState<ScoreWithRelations[]>(
    [],
  );
  const [selectedCourse, setSelectedCourse] = useState<
    { id: string; code: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDraftCourse, setSelectedDraftCourse] = useState<string | null>("all");
  const [selectedSubmittedCourse, setSelectedSubmittedCourse] =
    useState<string>("all");
  const [assignedCourses, setAssignedCourses] = useState<
    { id: string; code: string; title: string }[]
  >([]);
  const [draftPageSize, setDraftPageSize] = useState(5);
  const [submittedPageSize, setSubmittedPageSize] = useState(5);
  const [draftCurrentPage, setDraftCurrentPage] = useState(1);
  const [submittedCurrentPage, setSubmittedCurrentPage] = useState(1);

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    setDraftCurrentPage(1);
  }, [selectedDraftCourse, draftPageSize]);

  useEffect(() => {
    setSubmittedCurrentPage(1);
  }, [selectedSubmittedCourse, submittedPageSize]);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/lecturer/scores");
      if (!response.ok) throw new Error("Failed to fetch scores");

      const data = await response.json();
      const allScores = [...(data.drafts || []), ...(data.submitted || [])];
      const courseMap = new Map<
        string,
        { id: string; code: string; title: string }
      >();

      allScores.forEach((score: ScoreWithRelations) => {
        if (score.course?.code) {
          const courseCode = score.course.code;
          if (!courseMap.has(courseCode)) {
            courseMap.set(courseCode, {
              id: score.courseId,
              code: courseCode,
              title: score.course.title || courseCode,
            });
          }
        }
      });

      setDraftScores(data.drafts || []);
      setSubmittedScores(data.submitted || []);
      setAssignedCourses(Array.from(courseMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (scoreId: string) => {
    try {
      const response = await fetch(`/api/lecturer/scores/submit`, {
        method: "DELETE",
        body: JSON.stringify({ scoreId }),
      });

      if (!response.ok) throw new Error("Failed to delete draft");

      setDraftScores(draftScores.filter((s) => s.id !== scoreId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete draft");
    }
  };

  const handleSubmitDraft = async (scoreId: string) => {
    try {
      const response = await fetch(`/api/lecturer/scores/submit`, {
        method: "PUT",
      });

      if (!response.ok) throw new Error("Failed to submit score");

      const updatedScore = await response.json();
      setDraftScores(draftScores.filter((s) => s.id !== scoreId));
      setSubmittedScores([...submittedScores, updatedScore]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
    }
  };

  const filterScoresByCourse = (
    scores: ScoreWithRelations[],
    selectedCourse: string,
  ) => {
    if (selectedCourse === "all") return scores;
    return scores.filter((score) => score.course?.code === selectedCourse);
  };

  const draftFilteredScores = filterScoresByCourse(
    draftScores,
    selectedDraftCourse as string,
  );
  const submittedFilteredScores = filterScoresByCourse(
    submittedScores,
    selectedSubmittedCourse,
  );
  const draftTotalPages = Math.max(
    1,
    Math.ceil(draftFilteredScores.length / draftPageSize),
  );
  const submittedTotalPages = Math.max(
    1,
    Math.ceil(submittedFilteredScores.length / submittedPageSize),
  );
  const paginatedDraftScores = draftFilteredScores.slice(
    (draftCurrentPage - 1) * draftPageSize,
    draftCurrentPage * draftPageSize,
  );
  const paginatedSubmittedScores = submittedFilteredScores.slice(
    (submittedCurrentPage - 1) * submittedPageSize,
    submittedCurrentPage * submittedPageSize,
  );
  const submit = async () => {
    try {
      const response = await fetch(`/api/lecturer/scores/submit`, {
        method: "PATCH",
        body: JSON.stringify({courseId: selectedCourse?.id}),
      });

      if (!response.ok) throw new Error("Failed to submit score");

      const updatedScore = await response.json();
      await fetchScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading scores...</div>;
  }

  return (
    <div className="w-full space-y-6 p-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drafts">
            Draft Results ({draftScores.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted Results ({submittedScores.length})
          </TabsTrigger>
        </TabsList>

        {/* Draft Results Tab */}
        <TabsContent value="drafts" className="space-y-4">
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              Draft Results - Not Yet Submitted
            </h2>

            <div className="flex flex-wrap items-center justify-between bg-gray-600/40 p-2 rounded-md gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm">Assigned course</label>
                <Select
                  value={selectedDraftCourse}
                  onValueChange={(value) =>
                    setSelectedDraftCourse(value)
                  }
                ><SelectTrigger>
                  <SelectValue placeholder="All assigned courses">All assigned courses</SelectValue>
                </SelectTrigger>
                  <SelectContent>
                                    {assignedCourses.map((course) => (
                    <SelectItem key={course.id} value={course.code}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                  </SelectContent>

                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Rows</label>
                <select
                  value={draftPageSize}
                  onChange={(event) =>
                    setDraftPageSize(Number(event.target.value))
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {draftScores.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                No draft results yet
              </div>
            ) : draftFilteredScores.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                No draft results for the selected assigned course
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>CA</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDraftScores.map((score) => (
                        <TableRow key={score.id}>
                          <TableCell>
                            {score.student?.firstName} {score.student?.lastName}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {score.course?.code}
                              </p>
                              <p className="text-sm text-gray-600">
                                {score.course?.title}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{score.ca}</TableCell>
                          <TableCell>{score.exam}</TableCell>
                          <TableCell className="font-semibold">
                            {score.total}
                          </TableCell>
                          <TableCell>{score.grade}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Continue Editing
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger className="gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  Delete Draft
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogTitle>
                                    Delete Draft
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this draft?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                  <div className="flex gap-2">
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteDraft(score.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>

                              <Button
                                className="gap-2 bg-green-600 hover:bg-green-700"
                                size="sm"
                                onClick={() => handleSubmitDraft(score.id)}
                              >
                                <Send className="h-4 w-4" />
                                Submit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
                  <p className="text-sm">
                    Showing{" "}
                    {Math.min(
                      (draftCurrentPage - 1) * draftPageSize + 1,
                      draftFilteredScores.length,
                    )}
                    -
                    {Math.min(
                      draftCurrentPage * draftPageSize,
                      draftFilteredScores.length,
                    )}{" "}
                    of {draftFilteredScores.length} draft results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDraftCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={draftCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {draftCurrentPage} of {draftTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDraftCurrentPage((page) =>
                          Math.min(draftTotalPages, page + 1),
                        )
                      }
                      disabled={draftCurrentPage === draftTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
            <Dialog>
              <DialogTrigger disabled={draftScores.length === 0} className={"flex w-full justify-center bg-white/50 rounded-lg p-2 mt-4"}>
                Submit Drafts <ArrowDown />
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select a Course</DialogTitle>
                  <DialogDescription>
                    select a course to submit all student drafted result
                  </DialogDescription>
                </DialogHeader>

                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={(value) =>
                        setSelectedCourse(value)
                      }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course">{selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : "Select a course"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {assignedCourses.map((c) => (
                      <SelectItem key={c.id} value={c}>
                        {c.code} - {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => submit()} className={"w-full"}>
                  Submit Drafts
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Submitted Results Tab */}
        <TabsContent value="submitted" className="space-y-4">
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              Submitted Results - Awaiting Approval
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm">Assigned course</label>
                <select
                  value={selectedSubmittedCourse}
                  onChange={(event) =>
                    setSelectedSubmittedCourse(event.target.value)
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">All assigned courses</option>
                  {assignedCourses.map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Rows</label>
                <select
                  value={submittedPageSize}
                  onChange={(event) =>
                    setSubmittedPageSize(Number(event.target.value))
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {submittedScores.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                No submitted results yet
              </div>
            ) : submittedFilteredScores.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                No submitted results for the selected assigned course
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>CA</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubmittedScores.map((score) => (
                        <TableRow key={score.id} className="opacity-75">
                          <TableCell>
                            {score.student?.firstName} {score.student?.lastName}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {score.course?.code}
                              </p>
                              <p className="text-sm">
                                {score.course?.title}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{score.ca}</TableCell>
                          <TableCell>{score.exam}</TableCell>
                          <TableCell className="font-semibold">
                            {score.total}
                          </TableCell>
                          <TableCell>{score.grade}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Awaiting Approval</Badge>
                          </TableCell>
                          <TableCell>
                            {score.updatedAt
                              ? new Date(score.updatedAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
                  <p className="text-sm ">
                    Showing{" "}
                    {Math.min(
                      (submittedCurrentPage - 1) * submittedPageSize + 1,
                      submittedFilteredScores.length,
                    )}
                    -
                    {Math.min(
                      submittedCurrentPage * submittedPageSize,
                      submittedFilteredScores.length,
                    )}{" "}
                    of {submittedFilteredScores.length} submitted results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSubmittedCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={submittedCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {submittedCurrentPage} of {submittedTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSubmittedCurrentPage((page) =>
                          Math.min(submittedTotalPages, page + 1),
                        )
                      }
                      disabled={submittedCurrentPage === submittedTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
