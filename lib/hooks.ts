import { useState, useEffect, useCallback, useRef } from "react";
import { Issue, Project, Sprint, Epic } from "./types";
import {
  issuesApi,
  projectsApi,
  sprintsApi,
  epicsApi,
  membersApi,
  backlogApi,
  usersApi,
} from "./api";

// Generic data fetching hook
interface UseFetchOptions {
  skip?: boolean;
  refetchInterval?: number;
  deps?: readonly unknown[];
}

function useFetch<T>(fetcher: () => Promise<T>, options: UseFetchOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (options.skip) return;

    refetch();

    if (options.refetchInterval) {
      const interval = setInterval(refetch, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetch, options.skip, options.refetchInterval, ...(options.deps ?? [])]);

  return { data, loading, error, refetch };
}

// ─── Query hooks ────────────────────────────────────────────────────────────────

export function useIssues(projectId?: string, filters?: Record<string, any>, skip?: boolean) {
  return useFetch(() => issuesApi.getAll(projectId, filters), {
    skip,
    deps: [projectId, JSON.stringify(filters)],
  });
}

export function useIssue(projectId: string, issueId: string, skip?: boolean) {
  return useFetch(() => issuesApi.getById(projectId, issueId), {
    skip: skip || !projectId || !issueId,
  });
}

export function useComments(projectId: string, issueId: string, skip?: boolean) {
  return useFetch(() => issuesApi.listComments(projectId, issueId), {
    skip: skip || !projectId || !issueId,
    deps: [projectId, issueId],
  });
}

export function useProjects(skip?: boolean) {
  return useFetch(() => projectsApi.getAll(), { skip });
}

export function useProject(projectId: string, skip?: boolean) {
  return useFetch(() => projectsApi.getById(projectId), { skip });
}

export function useSprints(projectId: string, skip?: boolean) {
  return useFetch(() => sprintsApi.getAll(projectId), { skip, deps: [projectId] });
}

export function useSprint(projectId: string, sprintId: string, skip?: boolean) {
  return useFetch(() => sprintsApi.getById(projectId, sprintId), {
    skip: skip || !projectId || !sprintId,
    deps: [projectId, sprintId],
  });
}

export function useEpics(projectId: string, skip?: boolean) {
  return useFetch(() => epicsApi.getAll(projectId), { skip, deps: [projectId] });
}

export function useMembers(projectId: string, skip?: boolean) {
  return useFetch(() => membersApi.getAll(projectId), {
    skip: skip || !projectId,
    deps: [projectId],
  });
}

export function useUsers(skip?: boolean) {
  return useFetch(() => usersApi.getAll(), { skip });
}

export function useBacklog(projectId: string, skip?: boolean) {
  return useFetch(() => backlogApi.getAll(projectId), {
    skip: skip || !projectId,
    deps: [projectId],
  });
}

// ─── Mutation hooks ─────────────────────────────────────────────────────────────

// Issue mutations
export function useCreateIssue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (data: Partial<Issue> & { projectId: string }) => {
    setLoading(true);
    try {
      const result = await issuesApi.create(data);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to create issue");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useChangeIssueStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, issueId: string, status: string) => {
    setLoading(true);
    try {
      const result = await issuesApi.changeStatus(projectId, issueId, status);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to change issue status");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdateIssue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, issueId: string, data: Partial<Issue>) => {
    setLoading(true);
    try {
      const result = await issuesApi.update(projectId, issueId, data);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to update issue");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useDeleteIssue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, issueId: string) => {
    setLoading(true);
    try {
      await issuesApi.delete(projectId, issueId);
      setError(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to delete issue");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useAddComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, issueId: string, body: string) => {
    setLoading(true);
    try {
      const result = await issuesApi.addComment(projectId, issueId, body);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to add comment");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// Project mutations
export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (data: Partial<Project>) => {
    setLoading(true);
    try {
      const result = await projectsApi.create(data as any);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to create project");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, data: Partial<Project>) => {
    setLoading(true);
    try {
      const result = await projectsApi.update(projectId, data);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to update project");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useDeleteProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      await projectsApi.delete(projectId);
      setError(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to delete project");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// Sprint mutations
export function useCreateSprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      projectId: string,
      data: { name: string; goal?: string; start_date?: string; end_date?: string }
    ) => {
      setLoading(true);
      try {
        const result = await sprintsApi.create(projectId, data);
        setError(null);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Failed to create sprint");
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}

export function useUpdateSprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, sprintId: string, data: Partial<Sprint>) => {
    setLoading(true);
    try {
      const result = await sprintsApi.update(projectId, sprintId, data);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to update sprint");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useStartSprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, sprintId: string) => {
    setLoading(true);
    try {
      const result = await sprintsApi.startSprint(projectId, sprintId);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to start sprint");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useCompleteSprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, sprintId: string) => {
    setLoading(true);
    try {
      const result = await sprintsApi.completeSprint(projectId, sprintId);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to complete sprint");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// Epic mutations
export function useCreateEpic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      projectId: string,
      data: {
        title: string;
        description?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
      }
    ) => {
      setLoading(true);
      try {
        const result = await epicsApi.create(projectId, data);
        setError(null);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Failed to create epic");
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}

export function useUpdateEpic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, epicId: string, data: Partial<Epic>) => {
    setLoading(true);
    try {
      const result = await epicsApi.update(projectId, epicId, data);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to update epic");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useDeleteEpic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, epicId: string) => {
    setLoading(true);
    try {
      await epicsApi.delete(projectId, epicId);
      setError(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to delete epic");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// Member mutations
export function useAddMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, userId: string, projectRole: string) => {
    setLoading(true);
    try {
      const result = await membersApi.addMember(projectId, userId, projectRole);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to add member");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdateMemberRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, userId: string, projectRole: string) => {
    setLoading(true);
    try {
      const result = await membersApi.updateRole(projectId, userId, projectRole);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to update member role");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useRemoveMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, userId: string) => {
    setLoading(true);
    try {
      await membersApi.removeMember(projectId, userId);
      setError(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to remove member");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// Backlog mutations
export function useMoveToSprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (projectId: string, issueId: string, sprintId: string) => {
    setLoading(true);
    try {
      const result = await backlogApi.moveToSprint(projectId, issueId, sprintId);
      setError(null);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to move issue to sprint");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
