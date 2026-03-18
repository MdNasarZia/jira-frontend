"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import { useProjects, useCreateProject } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Folder, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProjectsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { data: projects, loading, refetch: refetchProjects } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewProject, setShowNewProject] = useState(searchParams.get("new") === "true");
  const [formData, setFormData] = useState({ name: "", description: "", key: "" });
  const { mutate: createProject, loading: creating } = useCreateProject();
  const isAdmin = user?.system_role === "admin";

  const filteredProjects =
    projects?.filter(
      (p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.key.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) return;

    try {
      await createProject(formData);
      setFormData({ name: "", description: "", key: "" });
      setShowNewProject(false);
      refetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <ProtectedLayout>
      <div className="bg-background flex min-h-screen">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          <div className="mx-auto max-w-7xl p-4 md:p-8">
            {/* Header */}
            <div className="mt-12 mb-8 flex items-center justify-between md:mt-0">
              <div>
                <h1 className="text-foreground text-3xl font-bold">Projects</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and organize your team's projects
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => setShowNewProject(!showNewProject)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              )}
            </div>

            {/* New Project Form */}
            {isAdmin && showNewProject && (
              <Card className="mb-6 p-6">
                <h2 className="mb-4 text-lg font-bold">Create New Project</h2>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        placeholder="My Awesome Project"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="key">Project Key</Label>
                      <Input
                        id="key"
                        placeholder="MAP"
                        value={formData.key}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            key: e.target.value.toUpperCase(),
                          })
                        }
                        maxLength={5}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      placeholder="Project description..."
                      className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create Project"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewProject(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : filteredProjects && filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project: any) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="group">
                    <Card className="hover:border-primary/50 h-full p-6 transition-all hover:shadow-lg">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
                              <Folder className="text-primary h-5 w-5" />
                            </div>
                            <h3 className="text-foreground group-hover:text-primary font-bold transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-muted-foreground mt-1 font-mono text-xs">
                              {project.key}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        {project.description && (
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {project.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="text-muted-foreground border-border flex items-center gap-4 border-t pt-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {project.member_count ?? project.members?.length ?? 0} members
                            </span>
                          </div>
                          {/* <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </div> */}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyMedia>
                  <Folder className="text-muted-foreground h-16 w-16" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No projects found</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm
                      ? "No projects match your search"
                      : "Create your first project to get started"}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
