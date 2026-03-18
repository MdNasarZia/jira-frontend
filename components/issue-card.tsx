"use client";

import React from "react";
import Link from "next/link";
import { Issue, IssuePriority, IssueType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bug, CheckSquare2, Square } from "lucide-react";

const priorityColors: Record<IssuePriority, string> = {
  LOWEST: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  HIGHEST: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const typeIcons: Record<IssueType, React.ReactNode> = {
  STORY: <Square className="h-4 w-4" />,
  BUG: <Bug className="h-4 w-4" />,
  TASK: <CheckSquare2 className="h-4 w-4" />,
};

interface IssueCardProps {
  issue: Issue;
  onDragStart?: (e: React.DragEvent, issue: Issue) => void;
  isDragging?: boolean;
  compact?: boolean;
}

export function IssueCard({ issue, onDragStart, isDragging, compact = false }: IssueCardProps) {
  return (
    <Link href={`/projects/${issue.projectId}/issues/${issue.id}`}>
      <div
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart?.(e, issue)}
        className={cn(
          "border-border bg-card hover:border-accent/50 cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md",
          isDragging && "opacity-50"
        )}
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="text-primary flex-shrink-0 font-mono text-xs font-semibold">
                {issue.key}
              </span>
            </div>
            <div className="flex-shrink-0">{typeIcons[issue.type]}</div>
          </div>

          {/* Title */}
          <h3 className="text-foreground line-clamp-2 text-sm font-medium">{issue.title}</h3>

          {!compact && (
            <>
              {/* Description */}
              {issue.description && (
                <p className="text-muted-foreground line-clamp-1 text-xs">{issue.description}</p>
              )}

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", priorityColors[issue.priority])}
                  >
                    {issue.priority}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  {issue.assignee && (
                    <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      {issue.assignee.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Story Points */}
              {issue.storyPoints && (
                <div className="text-muted-foreground text-xs">{issue.storyPoints} pts</div>
              )}

              {/* Labels */}
              {issue.labels && issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {issue.labels.slice(0, 2).map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  {issue.labels.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{issue.labels.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
