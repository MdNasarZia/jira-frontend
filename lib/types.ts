// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  system_role?: string;
  is_active?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  is_archived?: boolean;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

// Issue types — aligned with API enums
export type IssueStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type IssuePriority = "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
export type IssueType = "STORY" | "BUG" | "TASK";

export interface Issue {
  id: string;
  key?: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  projectId: string;
  sprintId?: string;
  epicId?: string;
  parentId?: string;
  assigneeId?: string;
  reporterId?: string;
  assignee?: User;
  reporter?: User;
  labels?: string[];
  storyPoints?: number;
  dueDate?: string;
  backlogRank?: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  history?: IssueHistory[];
}

// Sprint types — aligned with API enums
export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  startedAt?: string;
  completedAt?: string;
  status: "PLANNING" | "ACTIVE" | "CLOSED";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Epic types — API uses `title` not `name`
export type EpicStatus = "BACKLOG" | "IN_PROGRESS" | "DONE";

export interface Epic {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: EpicStatus;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  body: string;
  author_id?: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

// Issue History types
export interface IssueHistory {
  id: string;
  issueId: string;
  action: string;
  changes: Record<string, any>;
  author?: User;
  createdAt: string;
}

// Team Member types
export interface TeamMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  projectRole: "administrator" | "project_manager" | "developer";
  joinedAt: string;
}

// Filter types
export interface IssueFilters {
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assignee_id?: string;
  epic_id?: string;
  sprint_id?: string;
  search?: string;
}

// Board types
export interface BoardColumn {
  status: IssueStatus;
  title: string;
  issues: Issue[];
}

export interface Board {
  sprint: Sprint;
  columns: BoardColumn[];
}

// Backlog types
export interface Backlog {
  issues: Issue[];
  sprints: Sprint[];
}
