"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import { useProjects, useIssues, useChangeIssueStatus } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { BoardColumn } from "@/components/board-column";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueStatus } from "@/lib/types";

const COLUMNS: { status: IssueStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "IN_REVIEW", label: "In Review" },
  { status: "DONE", label: "Done" },
];

type ViewTab = "all" | "mine";

export default function IssuesPage() {
  const { user } = useAuth();
  const { data: projects, loading: projectsLoading } = useProjects();
  const projectList = Array.isArray(projects) ? projects : [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tab, setTab] = useState<ViewTab>("all");
  const [localIssues, setLocalIssues] = useState<any[]>([]);
  const [draggedIssue, setDraggedIssue] = useState<any>(null);
  const [dragOverStatus, setDragOverStatus] = useState<IssueStatus | null>(null);

  const { mutate: changeStatus } = useChangeIssueStatus();

  // Auto-select first project once loaded
  useEffect(() => {
    if (!selectedProjectId && projectList.length > 0) {
      setSelectedProjectId(projectList[0].id);
    }
  }, [projectList, selectedProjectId]);

  const filters = tab === "mine" && user?.id ? { assignee_id: user.id } : {};

  const { data: issues, loading: issuesLoading } = useIssues(
    selectedProjectId || undefined,
    filters,
    !selectedProjectId
  );

  // Sync fetched issues into local state for optimistic DnD updates
  useEffect(() => {
    setLocalIssues(Array.isArray(issues) ? issues : []);
  }, [issues]);

  const handleDragStart = (_e: React.DragEvent, issue: any) => {
    setDraggedIssue(issue);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    if (!draggedIssue || draggedIssue.status === targetStatus) {
      setDraggedIssue(null);
      setDragOverStatus(null);
      return;
    }

    // Optimistic update
    setLocalIssues((prev) =>
      prev.map((i) => (i.id === draggedIssue.id ? { ...i, status: targetStatus } : i))
    );

    try {
      await changeStatus(draggedIssue.projectId, draggedIssue.id, targetStatus);
    } catch {
      // Rollback on failure
      setLocalIssues((prev) =>
        prev.map((i) => (i.id === draggedIssue.id ? { ...i, status: draggedIssue.status } : i))
      );
    } finally {
      setDraggedIssue(null);
      setDragOverStatus(null);
    }
  };

  return (
    <ProtectedLayout>
      <div className="bg-background flex min-h-screen">
        <Sidebar />

        <main className="flex-1 overflow-hidden md:ml-0">
          <div className="flex h-screen flex-col p-4 md:p-8">
            {/* Header */}
            <div className="mt-12 mb-6 flex flex-shrink-0 flex-wrap items-center justify-between gap-4 md:mt-0">
              <div>
                <h1 className="text-foreground text-3xl font-bold">Issues</h1>
                <p className="text-muted-foreground mt-1">Drag and drop to change issue status</p>
              </div>

              {/* Project Selector */}
              <div className="w-64">
                {projectsLoading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <Select
                    value={selectedProjectId}
                    onValueChange={(val) => {
                      setSelectedProjectId(val);
                      setLocalIssues([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectList.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-muted mb-6 flex w-fit flex-shrink-0 gap-1 rounded-lg p-1">
              {(["all", "mine"] as ViewTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "all" ? "All Issues" : "My Issues"}
                </button>
              ))}
            </div>

            {/* Board */}
            {!selectedProjectId ? (
              <p className="text-muted-foreground">Select a project to view issues.</p>
            ) : issuesLoading ? (
              <div className="flex justify-center py-16">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                  <BoardColumn
                    key={col.status}
                    status={col.status}
                    title={col.label}
                    issues={localIssues.filter((i: any) => i.status === col.status)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnter={(s) => setDragOverStatus(s)}
                    isDragOver={dragOverStatus === col.status}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
