"use client";

import React from "react";
import Link from "next/link";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import { useProject, useSprints, useIssues } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { IssueCard } from "@/components/issue-card";
import { GitBranch, ListTodo, BookOpen, Users, ArrowLeft, Plus, Settings } from "lucide-react";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: project, loading: projectLoading } = useProject(id);
  const { data: sprints, loading: sprintsLoading } = useSprints(id);
  const { data: issues, loading: issuesLoading } = useIssues(id);

  if (projectLoading || sprintsLoading) {
    return (
      <ProtectedLayout>
        <div className="bg-background flex min-h-screen">
          <Sidebar projectId={id} />
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
          <Sidebar projectId={id} />
          <main className="flex-1 md:ml-0">
            <div className="mx-auto max-w-7xl p-4 md:p-8">
              <p className="text-muted-foreground">Project not found</p>
            </div>
          </main>
        </div>
      </ProtectedLayout>
    );
  }

  const activeSprints = sprints?.filter((s: any) => s.status === "ACTIVE") || [];
  const planningSprints = sprints?.filter((s: any) => s.status === "PLANNING") || [];
  const todoIssues = issues?.filter((i: any) => i.status === "TODO") || [];
  const inProgressIssues = issues?.filter((i: any) => i.status === "IN_PROGRESS") || [];

  return (
    <ProtectedLayout>
      <div className="bg-background flex min-h-screen">
        <Sidebar projectId={id} />

        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          <div className="mx-auto max-w-7xl p-4 md:p-8">
            {/* Header */}
            <div className="mt-12 mb-8 md:mt-0">
              <Link href="/projects">
                <Button variant="ghost" className="mb-4 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
              </Link>

              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h1 className="text-foreground text-3xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground font-mono text-sm">
                    Project Key: {project.key}
                  </p>
                </div>
                <Link href={`/projects/${id}/settings`}>
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>

              {project.description && <p className="text-foreground mt-2">{project.description}</p>}
            </div>

            {/* Quick Navigation */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              <Link href={`/projects/${id}/board`}>
                <Button variant="outline" className="h-auto w-full gap-2 py-3">
                  <GitBranch className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Sprint Board</p>
                    <p className="text-muted-foreground text-xs">View kanban board</p>
                  </div>
                </Button>
              </Link>

              <Link href={`/projects/${id}/backlog`}>
                <Button variant="outline" className="h-auto w-full gap-2 py-3">
                  <ListTodo className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Backlog</p>
                    <p className="text-muted-foreground text-xs">Manage sprints</p>
                  </div>
                </Button>
              </Link>

              <Link href={`/projects/${id}/epics`}>
                <Button variant="outline" className="h-auto w-full gap-2 py-3">
                  <BookOpen className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Epics</p>
                    <p className="text-muted-foreground text-xs">Epic management</p>
                  </div>
                </Button>
              </Link>

              <Link href={`/projects/${id}/settings`}>
                <Button variant="outline" className="h-auto w-full gap-2 py-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Team</p>
                    <p className="text-muted-foreground text-xs">Manage members</p>
                  </div>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-6 lg:col-span-2">
                {/* Active Sprints */}
                <Card className="p-6">
                  <h2 className="text-foreground mb-4 text-lg font-bold">Active Sprints</h2>
                  {activeSprints && activeSprints.length > 0 ? (
                    <div className="space-y-3">
                      {activeSprints.map((sprint: any) => (
                        <Link
                          key={sprint.id}
                          href={`/projects/${id}/board`}
                          className="border-border hover:border-primary/50 hover:bg-secondary block rounded-lg border p-4 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-foreground font-semibold">{sprint.name}</h3>
                              {sprint.goal && (
                                <p className="text-muted-foreground text-sm">Goal: {sprint.goal}</p>
                              )}
                            </div>
                            <span className="bg-primary/10 text-primary flex-shrink-0 rounded px-2 py-1 text-xs">
                              {sprint.issues?.length || 0} issues
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No active sprints</p>
                  )}
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h2 className="text-foreground mb-4 text-lg font-bold">
                    In Progress ({inProgressIssues?.length || 0})
                  </h2>
                  {inProgressIssues && inProgressIssues.length > 0 ? (
                    <div className="space-y-3">
                      {inProgressIssues.slice(0, 5).map((issue: any) => (
                        <IssueCard key={issue.id} issue={issue} compact />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No issues in progress</p>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Project Stats */}
                <Card className="p-6">
                  <h3 className="text-foreground mb-4 font-bold">Project Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total Issues</span>
                      <span className="text-primary text-lg font-bold">{issues?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Sprints</span>
                      <span className="text-primary text-lg font-bold">{sprints?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Team Members</span>
                      <span className="text-primary text-lg font-bold">
                        {project.members?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Done</span>
                      <span className="text-primary text-lg font-bold">
                        {issues?.filter((i: any) => i.status === "DONE").length || 0}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Team */}
                <Card className="p-6">
                  <h3 className="text-foreground mb-4 font-bold">Team</h3>
                  {project.members && project.members.length > 0 ? (
                    <div className="space-y-2">
                      {project.members.map((member: any) => (
                        <div
                          key={member.id}
                          className="hover:bg-secondary flex items-center gap-2 rounded p-2"
                        >
                          <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground truncate text-sm font-medium">
                              {member.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No team members yet</p>
                  )}
                </Card>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
