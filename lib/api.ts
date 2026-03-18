// Delegates all requests to callApi (JWT + auto-refresh via FastAPI backend)
import { callApi } from "./callApi";
import { Project } from "./types";

export { ApiError } from "./callApi";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return callApi<T>(endpoint, options);
}

// Auth endpoints
export const authApi = {
  register: async (userData: { email: string; password: string; name: string }) => {
    return await apiFetch<{ access_token: string; refresh_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return await apiFetch<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return await apiFetch("/auth/me", { method: "GET" });
  },
};

// Users endpoints
export const usersApi = {
  getAll: async (page = 1, limit = 100) => {
    const res: any = await apiFetch(`/users?page=${page}&limit=${limit}`, { method: "GET" });
    return Array.isArray(res) ? res : (res?.items ?? []);
  },

  getById: async (userId: string) => {
    return await apiFetch(`/users/${userId}`, { method: "GET" });
  },
};

// Projects endpoints
export const projectsApi = {
  getAll: async () => {
    const res: any = await apiFetch("/projects", { method: "GET" });
    return Array.isArray(res) ? res : (res?.items ?? []);
  },

  getById: async (id: string) => {
    return await apiFetch<Project>(`/projects/${id}`, { method: "GET" });
  },

  create: async (data: { name: string; description?: string; key: string }) => {
    return await apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{ name: string; description: string; key: string }>) => {
    return await apiFetch(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return await apiFetch(`/projects/${id}`, { method: "DELETE" });
  },

  archive: async (id: string) => {
    return await apiFetch(`/projects/${id}/archive`, { method: "POST" });
  },
};

// Status mapping: API value → frontend display value
const STATUS_FROM_API: Record<string, string> = {
  backlog: "BACKLOG",
  todo: "TODO",
  in_progress: "IN_PROGRESS",
  review: "IN_REVIEW",
  done: "DONE",
};

// Status mapping: frontend value → API value
const STATUS_TO_API: Record<string, string> = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "review",
  DONE: "done",
};

function transformIssue(raw: any) {
  const rawStatus = (raw.status ?? "").toLowerCase();
  return {
    ...raw,
    projectId: raw.project_id ?? raw.projectId,
    epicId: raw.epic_id ?? raw.epicId,
    parentId: raw.parent_id ?? raw.parentId,
    sprintId: raw.sprint_id ?? raw.sprintId,
    storyPoints: raw.story_points ?? raw.storyPoints,
    assigneeId: raw.assignee_id ?? raw.assigneeId,
    reporterId: raw.reporter_id ?? raw.reporterId,
    backlogRank: raw.backlog_rank ?? raw.backlogRank,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
    type: (raw.type ?? "").toUpperCase(),
    status: STATUS_FROM_API[rawStatus] ?? raw.status?.toUpperCase(),
    priority: (raw.priority ?? "").toUpperCase(),
  };
}

// Issues endpoints
export const issuesApi = {
  getAll: async (projectId?: string, filters?: Record<string, any>) => {
    if (!projectId) return [];
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    const res: any = await apiFetch(`/projects/${projectId}/issues${query}`, { method: "GET" });
    const items = Array.isArray(res) ? res : (res?.items ?? []);
    return items.map(transformIssue);
  },

  getById: async (projectId: string, issueId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/issues/${issueId}`, { method: "GET" });
    return transformIssue(res);
  },

  create: async (data: any) => {
    const { projectId, ...body } = data;
    // Map frontend field names to API field names
    const apiBody: any = {
      title: body.title,
      type: (body.type ?? "").toLowerCase(),
      priority: (body.priority ?? "medium").toLowerCase(),
    };
    if (body.description) apiBody.description = body.description;
    if (body.epicId || body.epic_id) apiBody.epic_id = body.epicId ?? body.epic_id;
    if (body.sprintId || body.sprint_id) apiBody.sprint_id = body.sprintId ?? body.sprint_id;
    if (body.parentId || body.parent_id) apiBody.parent_id = body.parentId ?? body.parent_id;
    if (body.storyPoints !== undefined || body.story_points !== undefined)
      apiBody.story_points = body.storyPoints ?? body.story_points;
    if (body.assigneeId || body.assignee_id)
      apiBody.assignee_id = body.assigneeId ?? body.assignee_id;
    return await apiFetch(`/projects/${projectId}/issues`, {
      method: "POST",
      body: JSON.stringify(apiBody),
    });
  },

  update: async (projectId: string, issueId: string, data: Partial<any>) => {
    // Map status if present
    const body: any = { ...data };
    if (body.status) body.status = STATUS_TO_API[body.status] ?? body.status.toLowerCase();
    if (body.priority) body.priority = body.priority.toLowerCase();
    if (body.epicId) {
      body.epic_id = body.epicId;
      delete body.epicId;
    }
    if (body.sprintId) {
      body.sprint_id = body.sprintId;
      delete body.sprintId;
    }
    if (body.assigneeId) {
      body.assignee_id = body.assigneeId;
      delete body.assigneeId;
    }
    if (body.storyPoints !== undefined) {
      body.story_points = body.storyPoints;
      delete body.storyPoints;
    }
    return await apiFetch(`/projects/${projectId}/issues/${issueId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete: async (projectId: string, issueId: string) => {
    return await apiFetch(`/projects/${projectId}/issues/${issueId}`, { method: "DELETE" });
  },

  changeStatus: async (projectId: string, issueId: string, status: string) => {
    const apiStatus = STATUS_TO_API[status] ?? status.toLowerCase();
    return await apiFetch(`/projects/${projectId}/issues/${issueId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: apiStatus }),
    });
  },

  addComment: async (projectId: string, issueId: string, body: string) => {
    return await apiFetch(`/projects/${projectId}/issues/${issueId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  listComments: async (projectId: string, issueId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/issues/${issueId}/comments`, {
      method: "GET",
    });
    return Array.isArray(res) ? res : (res?.items ?? []);
  },

  updateComment: async (projectId: string, issueId: string, commentId: string, body: string) => {
    return await apiFetch(`/projects/${projectId}/issues/${issueId}/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    });
  },

  deleteComment: async (projectId: string, issueId: string, commentId: string) => {
    return await apiFetch(`/projects/${projectId}/issues/${issueId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },

  getHistory: async (projectId: string, issueId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/issues/${issueId}/history`, {
      method: "GET",
    });
    return Array.isArray(res) ? res : (res?.items ?? []);
  },
};

const SPRINT_STATUS_MAP: Record<string, string> = {
  planned: "PLANNING",
  planning: "PLANNING",
  active: "ACTIVE",
  completed: "CLOSED",
  closed: "CLOSED",
};

function transformSprint(raw: any) {
  const rawStatus = (raw.status ?? "").toLowerCase();
  return {
    ...raw,
    projectId: raw.project_id ?? raw.projectId,
    startDate: raw.start_date ?? raw.startDate,
    endDate: raw.end_date ?? raw.endDate,
    startedAt: raw.started_at ?? raw.startedAt,
    completedAt: raw.completed_at ?? raw.completedAt,
    createdBy: raw.created_by ?? raw.createdBy,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
    status: SPRINT_STATUS_MAP[rawStatus] ?? rawStatus.toUpperCase(),
  };
}

// Sprints endpoints
export const sprintsApi = {
  getAll: async (projectId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/sprints`, { method: "GET" });
    const items = Array.isArray(res) ? res : (res?.items ?? []);
    return items.map(transformSprint);
  },

  getById: async (projectId: string, sprintId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/sprints/${sprintId}`, {
      method: "GET",
    });
    return transformSprint(res);
  },

  create: async (
    projectId: string,
    data: { name: string; goal?: string; start_date?: string; end_date?: string }
  ) => {
    return await apiFetch(`/projects/${projectId}/sprints`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (projectId: string, sprintId: string, data: Partial<any>) => {
    return await apiFetch(`/projects/${projectId}/sprints/${sprintId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (projectId: string, sprintId: string) => {
    return await apiFetch(`/projects/${projectId}/sprints/${sprintId}`, { method: "DELETE" });
  },

  startSprint: async (projectId: string, sprintId: string) => {
    return await apiFetch(`/projects/${projectId}/sprints/${sprintId}/start`, { method: "POST" });
  },

  completeSprint: async (projectId: string, sprintId: string) => {
    return await apiFetch(`/projects/${projectId}/sprints/${sprintId}/complete`, {
      method: "POST",
    });
  },
};

// Backlog endpoints
export const backlogApi = {
  getAll: async (projectId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/backlog`, { method: "GET" });
    const items = Array.isArray(res) ? res : (res?.items ?? []);
    return items.map(transformIssue);
  },

  moveToSprint: async (projectId: string, issueId: string, sprintId: string) => {
    return await apiFetch(`/projects/${projectId}/backlog/${issueId}/move-to-sprint`, {
      method: "POST",
      body: JSON.stringify({ sprint_id: sprintId }),
    });
  },

  reorder: async (projectId: string, issueIds: string[]) => {
    return await apiFetch(`/projects/${projectId}/backlog/reorder`, {
      method: "POST",
      body: JSON.stringify({ issue_ids: issueIds }),
    });
  },
};

function transformEpic(raw: any) {
  return {
    ...raw,
    projectId: raw.project_id ?? raw.projectId,
    createdBy: raw.created_by ?? raw.createdBy,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
    startDate: raw.start_date ?? raw.startDate,
    endDate: raw.end_date ?? raw.endDate,
    // Normalize status to uppercase
    status: (raw.status ?? "").toUpperCase(),
  };
}

// Epics endpoints
export const epicsApi = {
  getAll: async (projectId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/epics`, { method: "GET" });
    const items = Array.isArray(res) ? res : (res?.items ?? []);
    return items.map(transformEpic);
  },

  getById: async (projectId: string, epicId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/epics/${epicId}`, { method: "GET" });
    return transformEpic(res);
  },

  create: async (
    projectId: string,
    data: {
      title: string;
      description?: string;
      status?: string;
      start_date?: string;
      end_date?: string;
    }
  ) => {
    return await apiFetch(`/projects/${projectId}/epics`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (projectId: string, epicId: string, data: Partial<any>) => {
    return await apiFetch(`/projects/${projectId}/epics/${epicId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (projectId: string, epicId: string) => {
    return await apiFetch(`/projects/${projectId}/epics/${epicId}`, { method: "DELETE" });
  },
};

function transformMember(raw: any) {
  return {
    ...raw,
    projectId: raw.project_id ?? raw.projectId,
    userId: raw.user_id ?? raw.userId,
    projectRole: raw.project_role ?? raw.projectRole,
    joinedAt: raw.joined_at ?? raw.joinedAt,
    // user object is embedded in the response
    user: raw.user ?? null,
  };
}

// Team members endpoints
export const membersApi = {
  getAll: async (projectId: string) => {
    const res: any = await apiFetch(`/projects/${projectId}/members`, { method: "GET" });
    const items = Array.isArray(res) ? res : (res?.items ?? []);
    return items.map(transformMember);
  },

  addMember: async (projectId: string, userId: string, projectRole: string) => {
    return await apiFetch(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, project_role: projectRole }),
    });
  },

  updateRole: async (projectId: string, userId: string, projectRole: string) => {
    return await apiFetch(`/projects/${projectId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ project_role: projectRole }),
    });
  },

  removeMember: async (projectId: string, userId: string) => {
    return await apiFetch(`/projects/${projectId}/members/${userId}`, { method: "DELETE" });
  },
};
