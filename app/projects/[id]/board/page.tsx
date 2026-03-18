"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import {
  useProject,
  useSprints,
  useIssues,
  useEpics,
  useMembers,
  useCreateIssue,
  useChangeIssueStatus,
  useStartSprint,
  useCompleteSprint,
} from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { BoardColumn } from "@/components/board-column";
import { IssueStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Play, CheckCircle } from "lucide-react";

const STATUSES: { value: IssueStatus; label: string }[] = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
];

const ISSUE_TYPES = ["story", "task", "bug"] as const;
const PRIORITIES = ["lowest", "low", "medium", "high", "highest"] as const;

export default function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: project, loading: projectLoading } = useProject(id);
  const { data: sprints, loading: sprintsLoading, refetch: refetchSprints } = useSprints(id);
  const { data: issues, loading: issuesLoading, refetch: refetchIssues } = useIssues(id);
  const { data: epics } = useEpics(id);
  const { data: members } = useMembers(id);
  const { mutate: createIssue, loading: creating } = useCreateIssue();
  const { mutate: changeStatus } = useChangeIssueStatus();
  const { mutate: startSprint, loading: starting } = useStartSprint();
  const { mutate: completeSprint, loading: completing } = useCompleteSprint();

  const [selectedSprint, setSelectedSprint] = useState<string>("");
  const [draggedIssue, setDraggedIssue] = useState<any>(null);
  const [dragOverStatus, setDragOverStatus] = useState<IssueStatus | null>(null);
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: "",
    type: "task",
    priority: "medium",
    description: "",
    epicId: "",
    assigneeId: "",
    storyPoints: "",
  });
  const [createError, setCreateError] = useState("");
  const [sprintError, setSprintError] = useState("");

  const sprintList = Array.isArray(sprints) ? sprints : [];
  const defaultSprint =
    sprintList.find((s: any) => s.status === "ACTIVE")?.id ?? sprintList[0]?.id ?? "";
  const activeSprint = selectedSprint || defaultSprint;
  const currentSprint = sprintList.find((s: any) => s.id === activeSprint);

  const issueList = Array.isArray(issues) ? issues : [];
  const sprintIssues = activeSprint
    ? issueList.filter((issue: any) => issue.sprintId === activeSprint)
    : issueList.filter((issue: any) => !issue.sprintId);

  const boardColumns = STATUSES.map((status) => ({
    status: status.value,
    title: status.label,
    issues: sprintIssues.filter((issue: any) => issue.status === status.value),
  }));

  const epicList = Array.isArray(epics) ? epics : [];
  const memberList = Array.isArray(members) ? members : [];

  // ─── Drag & drop ──────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, issue: any) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    if (!draggedIssue || draggedIssue.status === status) {
      setDraggedIssue(null);
      setDragOverStatus(null);
      return;
    }
    try {
      await changeStatus(id, draggedIssue.id, status);
      refetchIssues();
    } catch (error) {
      console.error("Failed to update issue status:", error);
    } finally {
      setDraggedIssue(null);
      setDragOverStatus(null);
    }
  };

  // ─── Create issue ──────────────────────────────────────────────────────────
  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.title) return;
    setCreateError("");
    try {
      await createIssue({
        projectId: id,
        title: newIssue.title,
        type: newIssue.type as any,
        priority: newIssue.priority as any,
        description: newIssue.description || undefined,
        epicId: newIssue.epicId || undefined,
        assigneeId: newIssue.assigneeId || undefined,
        sprintId: activeSprint || undefined,
        storyPoints: newIssue.storyPoints ? parseInt(newIssue.storyPoints) : undefined,
      });
      setNewIssue({
        title: "",
        type: "task",
        priority: "medium",
        description: "",
        epicId: "",
        assigneeId: "",
        storyPoints: "",
      });
      setShowCreateIssue(false);
      refetchIssues();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create issue");
    }
  };

  // ─── Sprint lifecycle ──────────────────────────────────────────────────────
  const handleStartSprint = async () => {
    if (!activeSprint) return;
    setSprintError("");
    try {
      await startSprint(id, activeSprint);
      refetchSprints();
    } catch (err: any) {
      setSprintError(err.message || "Failed to start sprint");
    }
  };

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    if (!confirm("Complete this sprint? Incomplete issues will return to the backlog.")) return;
    setSprintError("");
    try {
      await completeSprint(id, activeSprint);
      refetchSprints();
      refetchIssues();
    } catch (err: any) {
      setSprintError(err.message || "Failed to complete sprint");
    }
  };

  if (projectLoading || sprintsLoading) {
    return (
      <ProtectedLayout>
        <div className="bg-background flex min-h-screen">
          <Sidebar projectId={id} currentView="board" />
          <main className="flex flex-1 items-center justify-center md:ml-0">
            <Spinner className="h-8 w-8" />
          </main>
        </div>
      </ProtectedLayout>
    );
  }

  if (!project) {
    return (
      <ProtectedLayout>
        <div className="bg-background flex min-h-screen">
          <Sidebar projectId={id} currentView="board" />
          <main className="flex-1 md:ml-0">
            <div className="mx-auto max-w-7xl p-4 md:p-8">
              <p className="text-muted-foreground">Project not found</p>
            </div>
          </main>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="bg-background flex min-h-screen">
        <Sidebar projectId={id} currentView="board" />

        <main className="flex-1 overflow-x-auto md:ml-0">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="bg-background sticky top-0 z-10 mt-12 mb-6 pb-4 md:mt-0">
              <Link href={`/projects/${id}`}>
                <Button variant="ghost" className="mb-4 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </Link>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-foreground text-3xl font-bold">
                    {(project as any).name} — Board
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Drag and drop issues to update their status
                  </p>
                </div>
                <Button className="gap-2" onClick={() => setShowCreateIssue(true)}>
                  <Plus className="h-4 w-4" />
                  Create Issue
                </Button>
              </div>

              {/* Sprint Selector + controls */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-foreground text-sm font-medium">Sprint:</span>
                <Select
                  value={activeSprint || "backlog"}
                  onValueChange={(v) => setSelectedSprint(v === "backlog" ? "" : v)}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">No Sprint (Backlog)</SelectItem>
                    {sprintList.map((sprint: any) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentSprint && (
                  <Badge
                    className={
                      currentSprint.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : currentSprint.status === "CLOSED"
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary text-secondary-foreground"
                    }
                  >
                    {currentSprint.status}
                  </Badge>
                )}

                {currentSprint?.status === "PLANNING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={handleStartSprint}
                    disabled={starting}
                  >
                    <Play className="h-3 w-3" />
                    Start Sprint
                  </Button>
                )}
                {currentSprint?.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-green-600 text-green-600 hover:bg-green-50"
                    onClick={handleCompleteSprint}
                    disabled={completing}
                  >
                    <CheckCircle className="h-3 w-3" />
                    Complete Sprint
                  </Button>
                )}

                {currentSprint?.startDate && (
                  <span className="text-muted-foreground text-xs">
                    {currentSprint.startDate}
                    {currentSprint.endDate ? ` → ${currentSprint.endDate}` : ""}
                  </span>
                )}
                {currentSprint?.goal && (
                  <span className="text-muted-foreground text-xs italic">
                    Goal: {currentSprint.goal}
                  </span>
                )}
              </div>

              {sprintError && (
                <div className="bg-destructive/10 text-destructive mt-2 rounded p-2 text-sm">
                  {sprintError}
                </div>
              )}
            </div>

            {/* Board Columns */}
            {issuesLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="flex min-h-[calc(100vh-300px)] gap-4 pb-8">
                {boardColumns.map((column) => (
                  <BoardColumn
                    key={column.status}
                    status={column.status}
                    title={column.title}
                    issues={column.issues}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnter={(s) => setDragOverStatus(s)}
                    isDragOver={dragOverStatus === column.status}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Issue Dialog */}
      <Dialog open={showCreateIssue} onOpenChange={setShowCreateIssue}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Issue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateIssue} className="mt-2 space-y-4">
            {createError && (
              <div className="bg-destructive/10 text-destructive rounded p-3 text-sm">
                {createError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="issueTitle">Title *</Label>
              <Input
                id="issueTitle"
                placeholder="Issue title"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newIssue.type}
                  onValueChange={(v) => setNewIssue({ ...newIssue, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newIssue.priority}
                  onValueChange={(v) => setNewIssue({ ...newIssue, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDesc">Description</Label>
              <textarea
                id="issueDesc"
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                rows={3}
                placeholder="Optional description..."
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {epicList.length > 0 && (
                <div className="space-y-2">
                  <Label>Epic</Label>
                  <Select
                    value={newIssue.epicId || "none"}
                    onValueChange={(v) =>
                      setNewIssue({ ...newIssue, epicId: v === "none" ? "" : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No epic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No epic</SelectItem>
                      {epicList.map((epic: any) => (
                        <SelectItem key={epic.id} value={epic.id}>
                          {epic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {memberList.length > 0 && (
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select
                    value={newIssue.assigneeId || "none"}
                    onValueChange={(v) =>
                      setNewIssue({ ...newIssue, assigneeId: v === "none" ? "" : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {memberList.map((m: any) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.user?.name ?? m.userId}
                          {m.user?.email ? ` (${m.user.email})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min={0}
                max={100}
                placeholder="Optional"
                value={newIssue.storyPoints}
                onChange={(e) => setNewIssue({ ...newIssue, storyPoints: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Issue"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateIssue(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  );
}
