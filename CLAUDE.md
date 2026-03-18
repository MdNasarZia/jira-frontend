# CLAUDE.md — Jira Frontend

## Project Overview

Next.js 16 (App Router) + React 19 Jira-like project management app.
Backend: FastAPI running on `http://localhost:8000/api/v1`.

## Tech Stack

- **Framework**: Next.js 16 (App Router, `'use client'` components)
- **UI**: Shadcn UI + Radix UI + Tailwind CSS 4
- **Forms**: react-hook-form + zod
- **Icons**: lucide-react
- **HTTP client**: `lib/callApi.ts` (JWT + auto-refresh)

## Key Files

| File                              | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `lib/callApi.ts`                  | **Primary API client** — JWT Bearer, auto-refresh on 401 |
| `lib/api.ts`                      | API object wrappers — delegates to `callApi.ts`          |
| `lib/hooks.ts`                    | Data-fetching + mutation hooks used by all pages         |
| `lib/auth-context.tsx`            | `useAuth()` — user, login, register, logout              |
| `lib/types.ts`                    | All TypeScript interfaces (User, Issue, Project, etc.)   |
| `components/protected-layout.tsx` | Auth guard — wraps all protected pages                   |

## Auth Flow

- **Login**: `POST /auth/login` → stores `access_token` + `refresh_token` in localStorage
- **Token refresh**: Automatic on 401 — `POST /auth/refresh` → retry original request
- **Logout**: Clears both tokens from localStorage
- **Token keys**: `access_token` and `refresh_token` (NOT the old `token` key)

## Environment

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Must be in `.env.local` (`.env.example` is the template). Restart dev server after changes.

## API Client Usage

```ts
import { callApi } from "@/lib/callApi";

// GET
const data = await callApi<Project[]>("/projects");

// POST
const issue = await callApi<Issue>("/issues", {
  method: "POST",
  body: JSON.stringify({ title, projectId }),
});
```

## Hooks Pattern

```ts
// Fetch data
const { data, loading, error, refetch } = useProjects();

// Mutate
const { mutate, loading } = useCreateIssue();
await mutate({ title, projectId, status: "TODO" });
refetch(); // always refetch after mutation
```

## Route Structure

```
/                      → Landing (redirects to /dashboard if authed)
/auth/login            → Login page
/auth/register         → Register page
/dashboard             → Overview: projects + assigned issues
/projects              → Projects list + create
/projects/[id]         → Project overview
/projects/[id]/board   → Kanban board (drag-drop)
/projects/[id]/backlog → Sprint backlog
/projects/[id]/epics   → Epic management
/projects/[id]/settings → Project settings + team members
/issues                → All issues with filters
/issues/[id]           → Issue detail + comments
```

## Common Conventions

- All pages are `'use client'` and wrapped in `<ProtectedLayout>`
- Data arrays from API may need `Array.isArray()` guard before mapping
- After any mutation, call `refetch()` from the relevant query hook
- Error shape from backend: `{ error: { code, message, details } }` or `{ detail: ... }`
- `ApiError` from `callApi.ts` exposes `.status` and `.body`

## Dev Commands

```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Production build
npm run lint   # ESLint
```
