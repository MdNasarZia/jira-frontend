# Product Requirements Document — Jira Frontend

**Version**: 1.0
**Date**: 2026-03-10
**Stack**: Next.js 16 (App Router) · React 19 · Shadcn UI · Tailwind CSS 4
**Backend**: FastAPI @ `http://localhost:8000/api/v1`

---

## 1. Overview

A full-featured project management application modelled on Jira. Teams create projects, define epics and sprints, track issues through a Kanban board, and collaborate via comments. All data is persisted in the FastAPI backend.

---

## 2. User Roles

| Role                             | Scope       | Permissions                   |
| -------------------------------- | ----------- | ----------------------------- |
| `admin`                          | System-wide | All operations                |
| `project_manager`                | System-wide | Manage any project            |
| `developer`                      | System-wide | Default new-user role         |
| `project_manager` (project role) | Per project | Full project control          |
| `developer` (project role)       | Per project | Create/update issues, comment |

---

## 3. Authentication

| Feature      | Endpoint              | Notes                                    |
| ------------ | --------------------- | ---------------------------------------- |
| Register     | `POST /auth/register` | Returns `access_token` + `refresh_token` |
| Login        | `POST /auth/login`    | Tokens stored in `localStorage`          |
| Auto-refresh | `POST /auth/refresh`  | Triggered on 401 response                |
| Logout       | `POST /auth/logout`   | Clears both tokens                       |
| Get profile  | `GET /auth/me`        | Returns `UserResponse`                   |

Tokens stored as `access_token` / `refresh_token` in localStorage. All API calls include `Authorization: Bearer <access_token>`.

---

## 4. Projects

### 4.1 Features

- Create project with `name` (required), `key` (2-10 uppercase letters, required), optional `description`
- List all projects (paginated)
- View project overview with sprints and recent issues
- Edit project name / description (project creator only)
- Archive project (`POST /projects/{id}/archive`)
- Delete project (project creator only)

### 4.2 API Endpoints

```
POST   /projects
GET    /projects          ?page&limit
GET    /projects/{id}
PATCH  /projects/{id}
POST   /projects/{id}/archive
```

### 4.3 Project Response Shape

```json
{
  "id": "uuid",
  "name": "string",
  "key": "PROJ",
  "description": "string|null",
  "is_archived": false,
  "created_by": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 5. Team Members

### 5.1 Features

- List project members (loaded separately from project, not embedded)
- Add member by selecting from registered users list + assigning a project role
- Update member role (project_manager / developer)
- Remove member
- Only project creator (`created_by`) can manage members

### 5.2 API Endpoints

```
GET    /projects/{project_id}/members         ?page&limit
POST   /projects/{project_id}/members         { user_id, project_role }
PATCH  /projects/{project_id}/members/{user_id} { project_role }
DELETE /projects/{project_id}/members/{user_id}
GET    /users                                 ?page&limit  (to search users to add)
```

### 5.3 Project Roles

- `project_manager` — full project control
- `developer` — create/update issues, comment

---

## 6. Epics

### 6.1 Features

- Create epic with `title` (3–255 chars, required), optional `description`, `status`, `start_date`, `end_date`
- List all epics for a project
- Edit epic title, description, status, dates inline
- Delete epic
- Display issue count per epic
- Epic status shown with badge (Backlog / In Progress / Done)

### 6.2 API Endpoints

```
POST   /projects/{project_id}/epics
GET    /projects/{project_id}/epics      ?page&limit
GET    /projects/{project_id}/epics/{id}
PATCH  /projects/{project_id}/epics/{id}
DELETE /projects/{project_id}/epics/{id}
```

### 6.3 Epic Response Shape

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "string", // NOTE: "title" not "name"
  "description": "string|null",
  "status": "backlog|in_progress|done",
  "start_date": "date|null",
  "end_date": "date|null",
  "created_by": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 6.4 Epic Status Values

`backlog` · `in_progress` · `done`

---

## 7. Sprints

### 7.1 Features

- Create sprint with `name` (required), optional `goal`, `start_date`, `end_date`
- List all sprints for a project with issue count per sprint
- **Start sprint** — transitions `planned → active` (only one active sprint at a time)
- **Complete sprint** — transitions `active → completed`; incomplete issues return to backlog
- Edit sprint name, goal, dates
- Delete sprint (only when `planned`)
- Sprint status badge (Planning / Active / Closed)
- Link to Sprint Board from backlog view

### 7.2 API Endpoints

```
POST   /projects/{project_id}/sprints
GET    /projects/{project_id}/sprints           ?page&limit
GET    /projects/{project_id}/sprints/{id}
PATCH  /projects/{project_id}/sprints/{id}
DELETE /projects/{project_id}/sprints/{id}
POST   /projects/{project_id}/sprints/{id}/start
POST   /projects/{project_id}/sprints/{id}/complete
```

### 7.3 Sprint Response Shape

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "goal": "string|null",
  "status": "planned|active|completed",
  "start_date": "date|null",
  "end_date": "date|null",
  "started_at": "datetime|null",
  "completed_at": "datetime|null",
  "created_by": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 7.4 Sprint Status Values

`planned` (→ frontend `PLANNING`) · `active` (→ `ACTIVE`) · `completed` (→ `CLOSED`)

---

## 8. Issues

### 8.1 Features

- Create issue: `title` (required), `type`, `priority`, optional `description`, `epic_id`, `sprint_id`, `parent_id`, `story_points`, `assignee_id`
- List issues with filters: `type`, `status`, `priority`, `assignee_id`, `epic_id`, `sprint_id`
- View issue detail: description, status, priority, story points, assignee, reporter, dates
- Edit issue: description, status, priority, story points inline
- Delete issue
- Change status via drag-and-drop on board
- Comments: create, list, update, delete
- Issue history: view field changes

### 8.2 API Endpoints

```
POST   /projects/{project_id}/issues
GET    /projects/{project_id}/issues      ?page&limit&type&status&priority&assignee_id&epic_id&sprint_id
GET    /projects/{project_id}/issues/{id}
PATCH  /projects/{project_id}/issues/{id}
DELETE /projects/{project_id}/issues/{id}
PATCH  /projects/{project_id}/issues/{id}/status    { status }
GET    /projects/{project_id}/issues/{id}/history
POST   /projects/{project_id}/issues/{id}/comments  { body }
GET    /projects/{project_id}/issues/{id}/comments  ?page&limit
PATCH  /projects/{project_id}/issues/{id}/comments/{comment_id}  { body }
DELETE /projects/{project_id}/issues/{id}/comments/{comment_id}
```

### 8.3 Issue Types

`story` · `task` · `bug`

### 8.4 Issue Priorities

`lowest` · `low` · `medium` (default) · `high` · `highest`

### 8.5 Issue Statuses

`backlog` · `todo` · `in_progress` · `review` (→ frontend `IN_REVIEW`) · `done`

> **Important**: The API uses `review` not `in_review`. The frontend maps `review ↔ IN_REVIEW`.

### 8.6 Issue Response Shape

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "epic_id": "uuid|null",
  "parent_id": "uuid|null",
  "sprint_id": "uuid|null",
  "type": "story|task|bug",
  "title": "string",
  "description": "string|null",
  "status": "backlog|todo|in_progress|review|done",
  "priority": "lowest|low|medium|high|highest",
  "story_points": "int|null",
  "assignee_id": "uuid|null",
  "reporter_id": "uuid",
  "backlog_rank": "int",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 9. Backlog

### 9.1 Features

- View all backlog issues (issues not assigned to any sprint)
- View all sprints with their issues grouped below
- **Move issue to sprint** — select sprint from dropdown + confirm
- Reorder backlog issues (drag-and-drop)
- Start / Complete sprint directly from backlog view
- Link to board view per sprint

### 9.2 API Endpoints

```
GET  /projects/{project_id}/backlog                          ?page&limit
POST /projects/{project_id}/backlog/{issue_id}/move-to-sprint  { sprint_id }
POST /projects/{project_id}/backlog/reorder                  { issue_ids: [] }
```

---

## 10. Kanban Board

### 10.1 Features

- 5 columns: Backlog · To Do · In Progress · In Review · Done
- Sprint selector — defaults to active sprint
- Displays sprint status badge, dates, and goal in header
- **Drag-and-drop** issues between columns → updates status via API
- **Create Issue** modal — creates issue directly into the selected sprint
- **Start Sprint** / **Complete Sprint** buttons visible when applicable
- Board is per-project (route `/projects/[id]/board`)
- Global issues board at `/issues` supports project selector + "My Issues" tab

### 10.2 Board vs Sprint Board

Both `/issues` (global) and `/projects/[id]/board` (sprint board) use the same 5-column Kanban layout. The project board also shows sprint lifecycle controls and the sprint selector.

---

## 11. Routes

| Route                             | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `/`                               | Landing page — redirects to `/dashboard` if authenticated |
| `/auth/login`                     | Login                                                     |
| `/auth/register`                  | Registration                                              |
| `/dashboard`                      | Overview: recent projects + stats                         |
| `/projects`                       | All projects + create form                                |
| `/projects/[id]`                  | Project overview (sprints + recent issues)                |
| `/projects/[id]/board`            | Sprint Kanban board                                       |
| `/projects/[id]/backlog`          | Backlog + sprint management                               |
| `/projects/[id]/epics`            | Epic management                                           |
| `/projects/[id]/settings`         | Project settings + team members                           |
| `/projects/[id]/issues/[issueId]` | Issue detail + comments                                   |
| `/issues`                         | Global issues board (all projects)                        |

---

## 12. Known Bugs Fixed

| #   | Bug                                                                         | Fix Applied                                            |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | Epics API used wrong URL (`/epics?projectId=…`)                             | Changed to `/projects/{id}/epics`                      |
| 2   | Members API used wrong URL (`/members?…`)                                   | Changed to `/projects/{id}/members`                    |
| 3   | Sprint create used `/sprints` (root)                                        | Changed to `/projects/{id}/sprints`                    |
| 4   | Sprint update used `/sprints/{id}`                                          | Changed to `/projects/{id}/sprints/{id}`               |
| 5   | Backlog API used `/backlog?projectId=…`                                     | Changed to `/projects/{id}/backlog`                    |
| 6   | `projectsApi.update` used PUT                                               | Changed to PATCH                                       |
| 7   | Comment body field was `text`                                               | Changed to `body` (API spec)                           |
| 8   | `IssueStatus.IN_REVIEW` ≠ API `review`                                      | Added bidirectional status mapping                     |
| 9   | Epic model used `name` field                                                | Changed to `title` (API spec)                          |
| 10  | `IssuePriority` had `CRITICAL` (not in API)                                 | Updated to `LOWEST/LOW/MEDIUM/HIGH/HIGHEST`            |
| 11  | `IssueType` had `SUBTASK`, `EPIC` (not in API)                              | Restricted to `STORY/TASK/BUG`                         |
| 12  | Settings showed `project.members` / `project.lead` (not in ProjectResponse) | Added `useMembers` hook with separate API call         |
| 13  | Add member used email (API requires `user_id`)                              | Added user select from `/users` list                   |
| 14  | Member remove used DELETE on `/members` with body                           | Changed to `DELETE /projects/{id}/members/{userId}`    |
| 15  | No Start/Complete sprint buttons                                            | Added to both Board and Backlog pages                  |
| 16  | "Create Issue" board button did nothing                                     | Added full Create Issue modal                          |
| 17  | "Post Comment" button did nothing                                           | Wired to `addComment` API with `useAddComment` hook    |
| 18  | Comments not loaded on issue detail                                         | Added `useComments` hook → `GET /issues/{id}/comments` |
| 19  | Sprint issues used `sprint.issues` (not in SprintResponse)                  | Fixed to filter `allIssues` by `sprintId`              |
| 20  | Move-to-sprint not available in backlog                                     | Added inline sprint selector + move button per issue   |

---

## 13. Future Enhancements

- **Subtasks** — parent/child issue hierarchy
- **Issue labels** — multi-tag filtering
- **Assignee avatar** — fetch user details in member list
- **Backlog drag-and-drop reorder** — wire to `POST /backlog/reorder`
- **Sprint velocity chart** — story points completed per sprint
- **Epic progress bar** — % of linked issues done
- **Notifications** — in-app alerts for assignments
- **User profile** — edit name, avatar
- **Dark/light theme toggle** — UI control
- **Issue search** — global full-text search across all projects
- **Pagination** — load-more for large issue lists
