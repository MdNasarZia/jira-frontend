"use client";

import Link from "next/link";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import { useProjects } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Folder } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, loading: projectsLoading } = useProjects();

  return (
    <ProtectedLayout>
      <div className="bg-background flex min-h-screen">
        <Sidebar />

        <main className="flex-1 md:ml-0">
          <div className="mx-auto max-w-7xl p-4 md:p-8">
            {/* Header */}
            <div className="mt-12 mb-8 flex items-center justify-between md:mt-0">
              <div>
                <h1 className="text-foreground text-3xl font-bold">
                  Welcome back, {user?.name?.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's your project management dashboard
                </p>
              </div>
              {user?.system_role === "admin" && (
                <Link href="/projects?new=true">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Projects List */}
              <div className="lg:col-span-2">
                <section className="bg-card border-border rounded-lg border p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
                      <Folder className="text-primary h-5 w-5" />
                      Your Projects
                    </h2>
                    <Link href="/projects">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>

                  {projectsLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : projects && Array.isArray(projects) && projects.length > 0 ? (
                    <div className="space-y-2">
                      {projects.slice(0, 8).map((project: any) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="border-border hover:border-primary/50 hover:bg-secondary group block rounded-lg border p-3 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-foreground group-hover:text-primary truncate text-sm font-medium">
                                {project.name}
                              </p>
                              <p className="text-muted-foreground text-xs">{project.key}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Empty>
                      <EmptyMedia>
                        <Folder className="text-muted-foreground h-12 w-12" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No projects yet</EmptyTitle>
                        <EmptyDescription>Create a new project to get started</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </section>
              </div>

              {/* Quick Stats */}
              <aside>
                <section className="bg-card border-border rounded-lg border p-6">
                  <h3 className="text-foreground mb-4 font-bold">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total Projects</span>
                      <span className="text-primary text-lg font-bold">
                        {projects && Array.isArray(projects) ? projects.length : 0}
                      </span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
