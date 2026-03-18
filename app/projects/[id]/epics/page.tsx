"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import { useProject, useEpics, useCreateEpic, useUpdateEpic, useDeleteEpic } from "@/lib/hooks";
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
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

const EPIC_COLORS = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Green", value: "bg-green-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Pink", value: "bg-pink-500" },
];

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_BADGE: Record<string, string> = {
  BACKLOG: "secondary",
  IN_PROGRESS: "default",
  DONE: "outline",
};

export default function ProjectEpicsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: project, loading: projectLoading } = useProject(id);
  const { data: epics, loading: epicsLoading, refetch: refetchEpics } = useEpics(id);
  const { mutate: createEpic, loading: creating } = useCreateEpic();
  const { mutate: updateEpic, loading: updating } = useUpdateEpic();
  const { mutate: deleteEpic } = useDeleteEpic();

  const [showNewEpic, setShowNewEpic] = useState(false);
  const [epicData, setEpicData] = useState({
    title: "",
    description: "",
    status: "backlog",
    start_date: "",
    end_date: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epicData.title) return;
    setError("");
    try {
      await createEpic(id, {
        title: epicData.title,
        description: epicData.description || undefined,
        status: epicData.status,
        start_date: epicData.start_date || undefined,
        end_date: epicData.end_date || undefined,
      });
      setEpicData({ title: "", description: "", status: "backlog", start_date: "", end_date: "" });
      setShowNewEpic(false);
      refetchEpics();
    } catch (err: any) {
      setError(err.message || "Failed to create epic");
    }
  };

  const handleUpdateEpic = async (epicId: string) => {
    setError("");
    try {
      await updateEpic(id, epicId, {
        title: editData.title,
        description: editData.description || undefined,
        status: editData.status?.toLowerCase(),
        startDate: editData.start_date || undefined,
        endDate: editData.end_date || undefined,
      });
      setEditingId(null);
      setEditData(null);
      refetchEpics();
    } catch (err: any) {
      setError(err.message || "Failed to update epic");
    }
  };

  const handleDeleteEpic = async (epicId: string) => {
    if (!confirm("Delete this epic? This cannot be undone.")) return;
    setError("");
    try {
      await deleteEpic(id, epicId);
      refetchEpics();
    } catch (err: any) {
      setError(err.message || "Failed to delete epic");
    }
  };

  if (projectLoading || epicsLoading) {
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

  const epicList = Array.isArray(epics) ? epics : [];

  return (
    <ProtectedLayout>
      <div className="bg-background flex min-h-screen">
        <Sidebar projectId={id} />

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
                    {(project as any).name} — Epics
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage large bodies of work across your project
                  </p>
                </div>
                <Button onClick={() => setShowNewEpic(!showNewEpic)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Epic
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {/* New Epic Form */}
            {showNewEpic && (
              <Card className="mb-6 p-6">
                <h2 className="mb-4 text-lg font-bold">Create New Epic</h2>
                <form onSubmit={handleCreateEpic} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title">Epic Title *</Label>
                      <Input
                        id="title"
                        placeholder="Mobile App Redesign"
                        value={epicData.title}
                        onChange={(e) => setEpicData({ ...epicData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        placeholder="Epic description..."
                        className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                        rows={3}
                        value={epicData.description}
                        onChange={(e) => setEpicData({ ...epicData, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={epicData.status}
                        onValueChange={(v) => setEpicData({ ...epicData, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={epicData.start_date}
                        onChange={(e) => setEpicData({ ...epicData, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={epicData.end_date}
                        onChange={(e) => setEpicData({ ...epicData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create Epic"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowNewEpic(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Epics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {epicList.length > 0 ? (
                epicList.map((epic: any) => (
                  <Card key={epic.id} className="hover:border-primary/50 group p-6 transition-all">
                    {editingId === epic.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editData?.title ?? ""}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          placeholder="Epic title"
                        />
                        <textarea
                          className="border-border bg-input text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                          rows={2}
                          value={editData?.description ?? ""}
                          onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                          }
                          placeholder="Description"
                        />
                        <Select
                          value={editData?.status?.toLowerCase() ?? "backlog"}
                          onValueChange={(v) => setEditData({ ...editData, status: v })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="backlog">Backlog</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Start Date</Label>
                            <Input
                              type="date"
                              className="h-8 text-xs"
                              value={editData?.start_date ?? editData?.startDate ?? ""}
                              onChange={(e) =>
                                setEditData({ ...editData, start_date: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End Date</Label>
                            <Input
                              type="date"
                              className="h-8 text-xs"
                              value={editData?.end_date ?? editData?.endDate ?? ""}
                              onChange={(e) =>
                                setEditData({ ...editData, end_date: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateEpic(epic.id)}
                            disabled={updating}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-foreground group-hover:text-primary truncate font-bold transition-colors">
                              {epic.title}
                            </h3>
                          </div>
                          <div className="ml-2 flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                setEditingId(epic.id);
                                setEditData({
                                  title: epic.title,
                                  description: epic.description ?? "",
                                  status: (epic.status ?? "BACKLOG").toLowerCase(),
                                  start_date: epic.startDate ?? epic.start_date ?? "",
                                  end_date: epic.endDate ?? epic.end_date ?? "",
                                });
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive h-7 w-7 p-0"
                              onClick={() => handleDeleteEpic(epic.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {epic.description && (
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {epic.description}
                          </p>
                        )}

                        {(epic.startDate || epic.endDate) && (
                          <p className="text-muted-foreground text-xs">
                            {epic.startDate}
                            {epic.endDate ? ` → ${epic.endDate}` : ""}
                          </p>
                        )}

                        <div className="border-border flex items-center justify-between border-t pt-3">
                          <Badge variant="outline" className="text-xs">
                            {STATUS_LABELS[epic.status] ?? epic.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground mb-2">No epics yet</p>
                    <p className="text-muted-foreground text-sm">
                      Create your first epic to organize large bodies of work
                    </p>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
