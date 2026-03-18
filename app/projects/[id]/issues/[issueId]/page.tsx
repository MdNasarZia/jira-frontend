"use client";

import React, { useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Sidebar } from "@/components/sidebar";
import { useIssue, useComments, useUpdateIssue, useAddComment } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const PRIORITIES = ["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST"];

export default function IssuePage({
  params,
}: {
  params: Promise<{ id: string; issueId: string }>;
}) {
  const { id, issueId } = React.use(params);
  const { data: issue, loading, refetch: refetchIssue } = useIssue(id, issueId);
  const {
    data: comments,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useComments(id, issueId);
  const { mutate: updateIssue, loading: updating } = useUpdateIssue();
  const { mutate: addComment, loading: posting } = useAddComment();
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");

  const handleUpdate = async () => {
    try {
      await updateIssue(id, issueId, {
        description: editData?.description,
        status: editData?.status,
        priority: editData?.priority,
        storyPoints: editData?.storyPoints,
      });
      setIsEditing(false);
      refetchIssue();
    } catch (error: any) {
      console.error("Failed to update issue:", error);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    setCommentError("");
    try {
      await addComment(id, issueId, comment.trim());
      setComment("");
      refetchComments();
    } catch (err: any) {
      setCommentError(err.message || "Failed to post comment");
    }
  };

  if (loading) {
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

  if (!issue) {
    return (
      <ProtectedLayout>
        <div className="bg-background flex min-h-screen">
          <Sidebar projectId={id} />
          <main className="flex-1 md:ml-0">
            <div className="mx-auto max-w-4xl p-4 md:p-8">
              <p className="text-muted-foreground">Issue not found</p>
            </div>
          </main>
        </div>
      </ProtectedLayout>
    );
  }

  const iss = issue as any;
  const commentList = Array.isArray(comments) ? comments : [];

  return (
    <ProtectedLayout>
      <div className="bg-background flex min-h-screen">
        <Sidebar projectId={id} />

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

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    {iss.key && (
                      <span className="text-primary font-mono text-sm font-bold">{iss.key}</span>
                    )}
                    <Badge variant="outline">{iss.type}</Badge>
                    <Badge variant="outline">{iss.status}</Badge>
                    <Badge variant="outline">{iss.priority}</Badge>
                  </div>
                  <h1 className="text-foreground text-3xl font-bold">{iss.title}</h1>
                </div>
                <Button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditData({ ...iss });
                  }}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-6 lg:col-span-2">
                {/* Description */}
                <Card className="p-6">
                  <h2 className="text-foreground mb-4 font-bold">Description</h2>
                  {isEditing ? (
                    <textarea
                      className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                      rows={6}
                      value={editData?.description || ""}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground whitespace-pre-wrap">
                      {iss.description || "No description provided"}
                    </p>
                  )}
                </Card>

                {/* Comments */}
                <Card className="p-6">
                  <h2 className="text-foreground mb-4 flex items-center gap-2 font-bold">
                    <MessageCircle className="h-5 w-5" />
                    Comments
                    {commentList.length > 0 && (
                      <span className="text-muted-foreground text-sm font-normal">
                        ({commentList.length})
                      </span>
                    )}
                  </h2>

                  {commentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="mb-6 space-y-4">
                      {commentList.length > 0 ? (
                        commentList.map((c: any) => (
                          <div key={c.id} className="border-border border-l-2 pl-4">
                            <div className="mb-1 flex items-center gap-2">
                              <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                                {(c.author?.name ?? c.author_id ?? "?").charAt(0).toUpperCase()}
                              </div>
                              <p className="text-foreground text-sm font-medium">
                                {c.author?.name ?? c.author_id ?? "Unknown"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {c.created_at
                                  ? new Date(c.created_at).toLocaleDateString()
                                  : c.createdAt
                                    ? new Date(c.createdAt).toLocaleDateString()
                                    : ""}
                              </p>
                            </div>
                            <p className="text-foreground pl-8 text-sm">{c.body}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No comments yet</p>
                      )}
                    </div>
                  )}

                  {/* Post comment */}
                  <div className="border-border space-y-2 border-t pt-4">
                    <Label>Add a comment</Label>
                    {commentError && <p className="text-destructive text-xs">{commentError}</p>}
                    <div className="flex items-start gap-2">
                      <div className="bg-primary text-primary-foreground mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 space-y-2">
                        <textarea
                          className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                          rows={3}
                          placeholder="Share your thoughts..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handlePostComment();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={handlePostComment}
                          disabled={posting || !comment.trim()}
                        >
                          <Send className="h-3 w-3" />
                          {posting ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <aside className="space-y-4">
                {/* Status */}
                <Card className="p-4">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">Status</p>
                  {isEditing ? (
                    <Select
                      value={editData?.status || ""}
                      onValueChange={(value) => setEditData({ ...editData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge>{iss.status}</Badge>
                  )}
                </Card>

                {/* Priority */}
                <Card className="p-4">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                    Priority
                  </p>
                  {isEditing ? (
                    <Select
                      value={editData?.priority || ""}
                      onValueChange={(value) => setEditData({ ...editData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{iss.priority}</Badge>
                  )}
                </Card>

                {/* Story Points */}
                <Card className="p-4">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                    Story Points
                  </p>
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="border-border bg-input text-foreground focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                      value={editData?.storyPoints ?? ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          storyPoints: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                    />
                  ) : (
                    <p className="text-foreground font-medium">{iss.storyPoints ?? "—"}</p>
                  )}
                </Card>

                {/* Assignee */}
                <Card className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <p className="text-foreground text-sm font-medium">Assignee</p>
                  </div>
                  {iss.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                        {iss.assignee.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-foreground text-sm">{iss.assignee.name}</p>
                    </div>
                  ) : iss.assigneeId ? (
                    <p className="text-muted-foreground text-sm">{iss.assigneeId}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm">Unassigned</p>
                  )}
                </Card>

                {/* Reporter */}
                <Card className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <p className="text-foreground text-sm font-medium">Reporter</p>
                  </div>
                  {iss.reporter ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                        {iss.reporter?.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-foreground text-sm">{iss.reporter?.name}</p>
                    </div>
                  ) : iss.reporterId ? (
                    <p className="text-muted-foreground text-sm text-xs">{iss.reporterId}</p>
                  ) : null}
                </Card>

                {/* Dates */}
                <Card className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <p className="text-foreground text-sm font-medium">Dates</p>
                  </div>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <p>Created: {new Date(iss.createdAt).toLocaleDateString()}</p>
                    <p>Updated: {new Date(iss.updatedAt).toLocaleDateString()}</p>
                    {iss.dueDate && <p>Due: {new Date(iss.dueDate).toLocaleDateString()}</p>}
                  </div>
                </Card>

                {isEditing && (
                  <Button onClick={handleUpdate} disabled={updating} className="w-full">
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
