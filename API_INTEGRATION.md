# API Integration Guide

## Overview

The ProjectHub frontend communicates with a backend API to manage all data. This guide explains how the API integration works and how to use it.

## Base API Configuration

The API base URL is configured via environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

All API requests are made relative to this base URL.

## Authentication

### Token Management

1. After successful login/registration, the backend returns a JWT token
2. Token is stored in browser's `localStorage` as `token`
3. Token is automatically included in all subsequent requests
4. Token is included as `Authorization: Bearer <token>` header

### Auth Flow

```
User Login
   ↓
POST /auth/login → Backend
   ↓
Returns { token, user }
   ↓
Store token in localStorage
   ↓
Update auth context
   ↓
Redirect to /dashboard
```

### Example Auth Request

```typescript
// In lib/api.ts
const response = await apiFetch<{
  token: string;
  user: User;
}>("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
```

## API Endpoints Reference

### Authentication

```typescript
// Register new user
POST / auth / register;
Body: {
  (email, password, name);
}
Returns: {
  (token, user);
}

// Login user
POST / auth / login;
Body: {
  (email, password);
}
Returns: {
  (token, user);
}

// Get current user
GET / auth / me;
Headers: Authorization: Bearer<token>;
Returns: User;
```

### Projects

```typescript
// Get all projects
GET /projects
Headers: Authorization: Bearer <token>
Returns: Project[]

// Get project by ID
GET /projects/:id
Headers: Authorization: Bearer <token>
Returns: Project

// Create project
POST /projects
Headers: Authorization: Bearer <token>
Body: { name, description?, key }
Returns: Project

// Update project
PUT /projects/:id
Headers: Authorization: Bearer <token>
Body: Partial<Project>
Returns: Project

// Delete project
DELETE /projects/:id
Headers: Authorization: Bearer <token>
Returns: { success: boolean }
```

### Issues

```typescript
// Get all issues (with optional filters)
GET /issues?projectId=:projectId&status=:status&priority=:priority&assignee=:assignee
Headers: Authorization: Bearer <token>
Returns: Issue[]

// Get issue by ID
GET /issues/:id
Headers: Authorization: Bearer <token>
Returns: Issue

// Create issue
POST /issues
Headers: Authorization: Bearer <token>
Body: {
  projectId,
  title,
  description?,
  status,
  priority,
  type,
  assigneeId?,
  epicId?,
  sprintId?,
  storyPoints?,
  dueDate?
}
Returns: Issue

// Update issue
PUT /issues/:id
Headers: Authorization: Bearer <token>
Body: Partial<Issue>
Returns: Issue

// Delete issue
DELETE /issues/:id
Headers: Authorization: Bearer <token>
Returns: { success: boolean }

// Add comment to issue
POST /issues/:id/comments
Headers: Authorization: Bearer <token>
Body: { text }
Returns: Comment
```

### Sprints

```typescript
// Get all sprints for project
GET /sprints?projectId=:projectId
Headers: Authorization: Bearer <token>
Returns: Sprint[]

// Get sprint by ID
GET /sprints/:id
Headers: Authorization: Bearer <token>
Returns: Sprint

// Create sprint
POST /sprints
Headers: Authorization: Bearer <token>
Body: {
  projectId,
  name,
  description?,
  goal?,
  startDate,
  endDate,
  status
}
Returns: Sprint

// Update sprint
PUT /sprints/:id
Headers: Authorization: Bearer <token>
Body: Partial<Sprint>
Returns: Sprint

// Update issue status in sprint (drag-drop)
PUT /sprints/:id/issues/:issueId
Headers: Authorization: Bearer <token>
Body: { status }
Returns: { success: boolean }
```

### Backlog

```typescript
// Get backlog items (issues not in sprint)
GET /backlog?projectId=:projectId
Headers: Authorization: Bearer <token>
Returns: Issue[]

// Add issue to backlog
POST /backlog/:issueId
Headers: Authorization: Bearer <token>
Body: { projectId }
Returns: Issue
```

### Epics

```typescript
// Get all epics for project
GET /epics?projectId=:projectId
Headers: Authorization: Bearer <token>
Returns: Epic[]

// Create epic
POST /epics
Headers: Authorization: Bearer <token>
Body: { projectId, name, description?, color? }
Returns: Epic

// Update epic
PUT /epics/:id
Headers: Authorization: Bearer <token>
Body: Partial<Epic>
Returns: Epic
```

### Team Members

```typescript
// Get project members
GET /members?projectId=:projectId
Headers: Authorization: Bearer <token>
Returns: TeamMember[]

// Add member to project
POST /members
Headers: Authorization: Bearer <token>
Body: { projectId, userId, role }
Returns: TeamMember

// Remove member from project
DELETE /members
Headers: Authorization: Bearer <token>
Body: { projectId, userId }
Returns: { success: boolean }
```

## API Response Format

### Success Response

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
```

## Using the API Client

### Direct API Calls

```typescript
import { apiFetch } from "@/lib/api";

// Get projects
const projects = await apiFetch<Project[]>("/projects", {
  method: "GET",
});

// Create project
const newProject = await apiFetch<Project>("/projects", {
  method: "POST",
  body: JSON.stringify({ name: "My Project", key: "MP" }),
});
```

### Using Specialized API Modules

```typescript
import { projectsApi, issuesApi } from "@/lib/api";

// Projects
const projects = await projectsApi.getAll();
const project = await projectsApi.getById(id);
const created = await projectsApi.create({ name, key });

// Issues
const issues = await issuesApi.getAll(projectId, filters);
const issue = await issuesApi.getById(id);
const updated = await issuesApi.update(id, { status: "DONE" });
```

### Using Custom Hooks

```typescript
import { useIssues, useProjects, useCreateIssue } from '@/lib/hooks';

export function IssuesList({ projectId }) {
  // Fetch data
  const { data: issues, loading, error } = useIssues(projectId);

  // Create mutation
  const { mutate: createIssue, loading: creating } = useCreateIssue();

  const handleCreate = async (data) => {
    await createIssue(data);
  };

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {issues?.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
```

## Error Handling

### API Errors

```typescript
import { ApiError } from "@/lib/api";

try {
  const data = await apiFetch("/issues/invalid");
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`Error ${error.status}: ${error.statusText}`);
    console.log(error.message);
  }
}
```

### In Components

```typescript
const { data, loading, error } = useIssues(projectId);

if (error) {
  return (
    <div className="p-4 bg-destructive/10 text-destructive">
      {error.message}
    </div>
  );
}
```

## Request/Response Examples

### Login Request

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Create Issue Request

```
POST /issues
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "projectId": "proj-123",
  "title": "Fix login bug",
  "description": "Users unable to login with email",
  "status": "TODO",
  "priority": "HIGH",
  "type": "BUG",
  "assigneeId": "user-456",
  "storyPoints": 5
}

Response 201:
{
  "success": true,
  "data": {
    "id": "issue-789",
    "key": "PROJ-123",
    "title": "Fix login bug",
    "status": "TODO",
    "priority": "HIGH",
    "type": "BUG",
    ...
  }
}
```

## Best Practices

1. **Always include error handling** - Wrap API calls in try-catch
2. **Use hooks for data fetching** - Leverage built-in hooks for consistency
3. **Handle loading states** - Show spinners/skeletons while loading
4. **Validate input** - Check data before sending to API
5. **Use TypeScript** - Leverage type safety for API responses
6. **Avoid race conditions** - Use loading flags before making requests
7. **Cache when appropriate** - Reuse data from context/hooks

## Debugging

### Enable Request Logging

Add to `lib/api.ts` for development:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[API Request]', endpoint, options);
  const result = await fetch(...);
  console.log('[API Response]', await result.json());
  return result;
}
```

### Check Network Tab

1. Open DevTools → Network tab
2. Filter by Fetch/XHR
3. Inspect request headers (Authorization, Content-Type)
4. Check response status and body
5. Verify token is included in requests

### Verify Auth Token

In browser console:

```javascript
localStorage.getItem("token");
```

Should return your JWT token.

## Troubleshooting

### 401 Unauthorized

- Token may be expired
- Token not being sent in request
- Token format incorrect (should be "Bearer <token>")

**Solution**: Clear localStorage and re-login

### 404 Not Found

- Endpoint URL incorrect
- Resource ID doesn't exist
- Backend not running

**Solution**: Verify endpoint and base URL configuration

### 500 Server Error

- Backend error
- Database connection issue
- Invalid request data

**Solution**: Check backend logs for details

### CORS Errors

- Backend not allowing requests from frontend origin
- Missing CORS headers in backend response

**Solution**: Configure CORS on backend

---

For more details on specific endpoints, refer to the backend API documentation.
