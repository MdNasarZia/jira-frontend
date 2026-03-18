"use client";

import React from "react";
import { Issue, IssueStatus } from "@/lib/types";
import { IssueCard } from "./issue-card";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  status: IssueStatus;
  title: string;
  issues: Issue[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: IssueStatus) => void;
  onDragStart: (e: React.DragEvent, issue: Issue) => void;
  onDragEnter?: (status: IssueStatus) => void;
  isDragOver?: boolean;
}

export function BoardColumn({
  status,
  title,
  issues,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnter,
  isDragOver,
}: BoardColumnProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragEnter={() => onDragEnter?.(status)}
      onDrop={(e) => onDrop(e, status)}
      className={cn(
        "border-border bg-secondary/30 flex min-w-72 flex-1 flex-col rounded-lg border transition-colors",
        isDragOver && "border-primary/50 bg-primary/5"
      )}
    >
      {/* Header */}
      <div className="border-border bg-card sticky top-0 rounded-t-lg border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-bold">{title}</h3>
          <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs font-semibold">
            {issues.length}
          </span>
        </div>
      </div>

      {/* Issues */}
      <div className="max-h-[calc(100vh-200px)] flex-1 space-y-3 overflow-y-auto p-4">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div key={issue.id} onDragStart={(e) => onDragStart(e, issue)}>
              <IssueCard issue={issue} />
            </div>
          ))
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm">No issues in this column</p>
            <p className="text-xs">Drag issues here to move them</p>
          </div>
        )}
      </div>
    </div>
  );
}
