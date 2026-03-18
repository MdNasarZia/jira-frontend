"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import {
  useProject,
  useSprints,
  useIssues,
  useBacklog,
  useCreateSprint,
  useStartSprint,
  useCompleteSprint,
  useMoveToSprint,
} from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { IssueCard } from "@/components/issue-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Play, CheckCircle, Calendar, ArrowRight } from "lucide-react";

export default function ProjectBacklogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: project, loading: projectLoading } = useProject(id);
  const { data: sprints, loading: sprintsLoading, refetch: refetchSprints } = useSprints(id);
  const { data: allIssues, loading: issuesLoading, refetch: refetchIssues } = useIssues(id);
  const { data: backlogIssues, loading: backlogLoading, refetch: refetchBacklog } = useBacklog(id);
  const { mutate: createSprint, loading: creating } = useCreateSprint();
  const { mutate: startSprint, loading: starting } = useStartSprint();
  const { mutate: completeSprint, loading: completing } = useCompleteSprint();
  const { mutate: moveToSprint, loading: moving } = useMoveToSprint();

  const [showNewSprint, setShowNewSprint] = useState(false);
  const [sprintData, setSprintData] = useState({ name: "", goal: "", startDate: "", endDate: "" });
  const [moveTarget, setMoveTarget] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const sprintList = Array.isArray(sprints) ? sprints : [];
  const issueList = Array.isArray(allIssues) ? allIssues : [];
  const backlogList = Array.isArray(backlogIssues) ? backlogIssues : [];

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintData.name) return;
    setError("");
    try {
      await createSprint(id, {
        name: sprintData.name,
        goal: sprintData.goal || undefined,
        start_date: sprintData.startDate || undefined,
        end_date: sprintData.endDate || undefined,
      });
      setSprintData({ name: "", goal: "", startDate: "", endDate: "" });
      setShowNewSprint(false);
      refetchSprints();
    } catch (err: any) {
      setError(err.message || "Failed to create sprint");
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    setError("");
    try {
      await startSprint(id, sprintId);
      refetchSprints();
    } catch (err: any) {
      setError(err.message || "Failed to start sprint");
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!confirm("Complete this sprint? Incomplete issues will return to the backlog.")) return;
    setError("");
    try {
      await completeSprint(id, sprintId);
      refetchSprints();
      refetchIssues();
      refetchBacklog();
    } catch (err: any) {
      setError(err.message || "Failed to complete sprint");
    }
  };

  const handleMoveToSprint = async (issueId: string, sprintId: string) => {
    setError("");
    try {
      await moveToSprint(id, issueId, sprintId);
      refetchIssues();
      refetchBacklog();
      refetchSprints();
    } catch (err: any) {
      setError(err.message || "Failed to move issue to sprint");
    }
  };

  const getSprintIssues = (sprintId: string) =>
    issueList.filter((issue: any) => issue.sprintId === sprintId);

  const statusColor: Record<string, string> = {
    PLANNING: "bg-secondary text-secondary-foreground",
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CLOSED: "bg-muted text-muted-foreground",
  };

  if (projectLoading || sprintsLoading) {
    return (
      <ProtectedLayout>
        <div className="bg-background flex min-h-screen">
          <Sidebar projectId={id} currentView="backlog" />
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
          <Sidebar projectId={id} currentView="backlog" />
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
        <Sidebar projectId={id} currentView="backlog" />

        <main className="flex-1 md:ml-0">
          <div className="mx-auto max-w-7xl p-4 md:p-8">
            {/* Header */}
            <div className="mt-12 mb-6 md:mt-0">
              <Link href={`/projects/${id}`}>
                <Button variant="ghost" className="mb-4 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </Link>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-foreground text-3xl font-bold">
                    {(project as any).name} — Backlog
                  </h1>
                  <p className="text-muted-foreground mt-1">Manage sprints and backlog items</p>
                </div>
                <Button onClick={() => setShowNewSprint(!showNewSprint)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Sprint
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {/* New Sprint Form */}
            {showNewSprint && (
              <Card className="mb-6 p-6">
                <h2 className="mb-4 text-lg font-bold">Create New Sprint</h2>
                <form onSubmit={handleCreateSprint} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Sprint Name *</Label>
                      <Input
                        id="name"
                        placeholder="Sprint 1"
                        value={sprintData.name}
                        onChange={(e) => setSprintData({ ...sprintData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal">Sprint Goal</Label>
                      <Input
                        id="goal"
                        placeholder="Sprint objective..."
                        value={sprintData.goal}
                        onChange={(e) => setSprintData({ ...sprintData, goal: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={sprintData.startDate}
                        onChange={(e) =>
                          setSprintData({ ...sprintData, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={sprintData.endDate}
                        onChange={(e) => setSprintData({ ...sprintData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create Sprint"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowNewSprint(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Sprints Section */}
            <div className="space-y-6">
              {sprintList.length > 0 ? (
                sprintList.map((sprint: any) => {
                  const sprintIssues = getSprintIssues(sprint.id);
                  return (
                    <div key={sprint.id}>
                      <div className="border-border mb-3 flex items-center justify-between border-b pb-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <Calendar className="text-primary h-5 w-5 flex-shrink-0" />
                          <h2 className="text-foreground text-lg font-bold">{sprint.name}</h2>
                          <Badge className={statusColor[sprint.status] ?? ""}>
                            {sprint.status}
                          </Badge>
                          {sprint.startDate && (
                            <span className="text-muted-foreground text-xs">
                              {sprint.startDate}
                              {sprint.endDate ? ` → ${sprint.endDate}` : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            {sprintIssues.length} issue{sprintIssues.length !== 1 ? "s" : ""}
                          </span>
                          {sprint.status === "PLANNING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleStartSprint(sprint.id)}
                              disabled={starting}
                            >
                              <Play className="h-3 w-3" />
                              Start Sprint
                            </Button>
                          )}
                          {sprint.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-green-600 text-green-600 hover:bg-green-50"
                              onClick={() => handleCompleteSprint(sprint.id)}
                              disabled={completing}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete Sprint
                            </Button>
                          )}
                          <Link href={`/projects/${id}/board`}>
                            <Button size="sm" variant="ghost" className="gap-1">
                              View Board
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {sprint.goal && (
                        <p className="text-muted-foreground mb-3 text-sm italic">
                          Goal: {sprint.goal}
                        </p>
                      )}

                      {sprintIssues.length > 0 ? (
                        <div className="space-y-2">
                          {sprintIssues.map((issue: any) => (
                            <IssueCard key={issue.id} issue={issue} compact />
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground py-2 text-sm italic">
                          No issues in this sprint
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-2">No sprints created yet</p>
                  <p className="text-muted-foreground text-sm">
                    Create a sprint to start planning your work
                  </p>
                </Card>
              )}
            </div>

            {/* Backlog Section */}
            <div className="border-border mt-8 border-t pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-bold">
                  Backlog
                  {backlogList.length > 0 && (
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                      ({backlogList.length} items)
                    </span>
                  )}
                </h2>
                <Link href={`/projects/${id}/board`}>
                  <Button size="sm" variant="ghost" className="gap-1">
                    <Plus className="h-3 w-3" />
                    Create Issue
                  </Button>
                </Link>
              </div>

              {issuesLoading || backlogLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : backlogList.length > 0 ? (
                <div className="space-y-2">
                  {backlogList.map((issue: any) => (
                    <div key={issue.id} className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <IssueCard issue={issue} compact />
                      </div>
                      {/* Move to sprint */}
                      {sprintList.filter((s: any) => s.status !== "CLOSED").length > 0 && (
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <Select
                            value={moveTarget[issue.id] ?? ""}
                            onValueChange={(v) =>
                              setMoveTarget((prev) => ({ ...prev, [issue.id]: v }))
                            }
                          >
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue placeholder="Move to sprint" />
                            </SelectTrigger>
                            <SelectContent>
                              {sprintList
                                .filter((s: any) => s.status !== "CLOSED")
                                .map((s: any) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            disabled={!moveTarget[issue.id] || moving}
                            onClick={() => {
                              if (moveTarget[issue.id]) {
                                handleMoveToSprint(issue.id, moveTarget[issue.id]);
                                setMoveTarget((prev) => ({ ...prev, [issue.id]: "" }));
                              }
                            }}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground text-sm italic">
                    No backlog items — all issues are in sprints!
                  </p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
