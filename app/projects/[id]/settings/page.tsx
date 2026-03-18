"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useMembers,
  useUsers,
  useAddMember,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2, UserPlus, ShieldOff } from "lucide-react";
import { ApiError } from "@/lib/callApi";

const ROLE_OPTIONS = [
  { value: "developer", label: "Developer" },
  { value: "project_manager", label: "Project Manager" },
];

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrator",
  project_manager: "Project Manager",
  developer: "Developer",
};

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { data: project, loading: projectLoading, refetch: refetchProject } = useProject(id);
  const { data: members, loading: membersLoading, refetch: refetchMembers } = useMembers(id);
  const { data: allUsers, error: usersError } = useUsers();
  const { user } = useAuth();
  const { mutate: updateProject, loading: updating } = useUpdateProject();
  const { mutate: deleteProject, loading: deleting } = useDeleteProject();
  const { mutate: addMember, loading: inviting } = useAddMember();
  const { mutate: removeMember } = useRemoveMember();
  const { mutate: updateRole } = useUpdateMemberRole();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberRole, setMemberRole] = useState("developer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const proj = project as any;
  const memberList = Array.isArray(members) ? members : [];
  const userList = Array.isArray(allUsers) ? allUsers : [];

  // Current user is the project creator
  const isProjectLead = proj?.created_by === user?.id;

  // Users not yet in the project
  const memberUserIds = new Set(memberList.map((m: any) => m.userId));
  const availableUsers = userList.filter((u: any) => !memberUserIds.has(u.id) && u.id !== user?.id);

  const handleUpdateProject = async () => {
    if (!editData) return;
    setError("");
    try {
      await updateProject(id, { name: editData.name, description: editData.description });
      setIsEditing(false);
      refetchProject();
      setSuccess("Project updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update project");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setError("");
    try {
      await addMember(id, selectedUserId, memberRole);
      setSelectedUserId("");
      setMemberRole("developer");
      refetchMembers();
      setSuccess("Member added successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setError("");
    try {
      await removeMember(id, userId);
      refetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setError("");
    try {
      await updateRole(id, userId, role);
      refetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete "${proj?.name}"? This action cannot be undone.`))
      return;
    setError("");
    try {
      await deleteProject(id);
      router.push("/projects");
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setError("Only admins can delete projects.");
        } else if (err.status === 404) {
          setError("Project not found.");
        } else if (err.status === 410) {
          setError("Project is already archived.");
        } else {
          setError("Failed to delete project. Please try again.");
        }
      } else {
        setError("Failed to delete project. Please try again.");
      }
    }
  };

  // Find user details — prefer embedded user object from member response
  const getUserById = (member: any) =>
    member.user ?? userList.find((u: any) => u.id === member.userId);

  if (projectLoading) {
    return (
      <ProtectedLayout>
        <div className="bg-background flex min-h-screen">
          <Sidebar projectId={id} currentView="settings" />
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
          <Sidebar projectId={id} currentView="settings" />
          <main className="flex-1 md:ml-0">
            <div className="mx-auto max-w-4xl p-4 md:p-8">
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
        <Sidebar projectId={id} currentView="settings" />

        <main className="flex-1 md:ml-0">
          <div className="mx-auto max-w-4xl p-4 md:p-8">
            {/* Header */}
            <div className="mt-12 mb-6 md:mt-0">
              <Link href={`/projects/${id}`}>
                <Button variant="ghost" className="mb-4 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </Link>
              <h1 className="text-foreground text-3xl font-bold">Project Settings</h1>
              <p className="text-muted-foreground mt-1">Manage project details and team members</p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {success}
              </div>
            )}

            <div className="space-y-6">
              {/* Project Details */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-bold">Project Details</h2>
                  {isProjectLead && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(!isEditing);
                        setEditData(proj);
                      }}
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          value={editData?.name || ""}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                          id="description"
                          className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                          rows={4}
                          value={editData?.description || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                          }
                        />
                      </div>
                      <Button onClick={handleUpdateProject} disabled={updating}>
                        {updating ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Name</p>
                        <p className="text-foreground">{proj.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Key</p>
                        <p className="text-foreground font-mono">{proj.key}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Description</p>
                        <p className="text-foreground">{proj.description || "No description"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Created</p>
                        <p className="text-foreground">
                          {proj.created_at
                            ? new Date(proj.created_at).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Team Members */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-bold">
                    Team Members
                    {memberList.length > 0 && (
                      <span className="text-muted-foreground ml-2 text-sm font-normal">
                        ({memberList.length})
                      </span>
                    )}
                  </h2>
                </div>

                {/* Add Member Form */}
                <form
                  onSubmit={handleAddMember}
                  className="border-border mb-6 space-y-4 border-b pb-6"
                >
                  <h3 className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <UserPlus className="h-4 w-4" />
                    Add Team Member
                  </h3>
                  {usersError && (
                    <div className="rounded-md bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      <span className="font-medium">Cannot load user list:</span>{" "}
                      {usersError.message || "Access denied"}. Only admins can browse all users.
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="userSelect">User</Label>
                      <Select
                        value={selectedUserId}
                        onValueChange={setSelectedUserId}
                        disabled={!!usersError}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              usersError ? "Unavailable (admin only)" : "Select a user..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.length > 0 ? (
                            availableUsers.map((u: any) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name} ({u.email})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="__none__" disabled>
                              No users available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={memberRole} onValueChange={setMemberRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="submit"
                        disabled={inviting || !selectedUserId || !!usersError}
                        className="w-full"
                      >
                        {inviting ? "Adding..." : "Add Member"}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Members List */}
                {membersLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner className="h-5 w-5" />
                  </div>
                ) : memberList.length > 0 ? (
                  <div className="space-y-3">
                    {memberList.map((member: any) => {
                      const memberUser = getUserById(member);
                      return (
                        <div
                          key={member.id}
                          className="border-border hover:bg-secondary flex items-center justify-between rounded-lg border p-3 transition-colors"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="bg-primary text-primary-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold">
                              {(memberUser?.name ?? member.userId)?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-foreground font-medium">
                                {memberUser?.name ?? member.userId}
                              </p>
                              {memberUser?.email && (
                                <p className="text-muted-foreground text-xs">{memberUser.email}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            {isProjectLead && member.projectRole !== "administrator" ? (
                              <Select
                                value={member.projectRole}
                                onValueChange={(v) => handleUpdateRole(member.userId, v)}
                              >
                                <SelectTrigger className="h-8 w-36 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                      {r.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {ROLE_LABELS[member.projectRole] ?? member.projectRole}
                              </Badge>
                            )}
                            {isProjectLead &&
                              member.userId !== user?.id &&
                              member.projectRole !== "administrator" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveMember(member.userId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No team members yet. Add the first one above.
                  </p>
                )}
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/50 p-6">
                <h2 className="text-destructive mb-4 text-lg font-bold">Danger Zone</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Once you delete a project, there is no going back. Please be certain.
                </p>
                {user?.system_role === "admin" ? (
                  <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete Project"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button variant="destructive" disabled>
                      <ShieldOff className="mr-2 h-4 w-4" />
                      Delete Project
                    </Button>
                    <p className="text-muted-foreground text-sm">
                      Only admins can delete projects.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
