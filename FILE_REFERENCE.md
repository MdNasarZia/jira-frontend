# ProjectHub - File Reference Guide

## Quick File Lookup

Find any file by its purpose or functionality.

---

## Core Application Files

### `app/layout.tsx`

**Purpose**: Root layout wrapper  
**Contains**:

- HTML structure
- AuthProvider wrapper
- Metadata configuration
  **Key Changes**: Added AuthProvider, updated metadata

### `app/globals.css`

**Purpose**: Global styles and design tokens  
**Contains**:

- CSS custom properties for theming
- Light and dark mode variables
- Tailwind CSS configuration
- Color palette definitions
  **Important**: Update here for theme changes

### `app/page.tsx`

**Purpose**: Landing page  
**Contains**:

- Marketing content
- Feature overview
- Sign up/login CTAs
- Responsive hero section

---

## Authentication Files

### `lib/auth-context.tsx`

**Purpose**: Authentication state management  
**Contains**:

- AuthProvider component
- useAuth hook
- Auth state management
- Login/register/logout functions
  **Usage**: Wrap app with `<AuthProvider>` and use `useAuth()` hook

### `app/auth/login/page.tsx`

**Purpose**: User login page  
**Contains**:

- Email/password form
- Error handling
- Form validation
- Register link

### `app/auth/register/page.tsx`

**Purpose**: User registration page  
**Contains**:

- Registration form with validation
- Password confirmation
- Error messages
- Password requirements info

---

## API Integration Files

### `lib/api.ts`

**Purpose**: API client and endpoints  
**Contains**:

- `apiFetch()` - Generic fetch wrapper
- `authApi` - Authentication endpoints
- `projectsApi` - Project CRUD
- `issuesApi` - Issue operations
- `sprintsApi` - Sprint management
- `backlogApi` - Backlog operations
- `epicsApi` - Epic management
- `membersApi` - Team management
  **Usage**: Import specific modules, e.g., `import { projectsApi } from '@/lib/api'`

### `lib/hooks.ts`

**Purpose**: Custom data fetching hooks  
**Contains**:

- `useIssues()` - Fetch issues with filters
- `useProjects()` - Fetch projects
- `useSprints()` - Fetch sprints
- `useEpics()` - Fetch epics
- `useCreateIssue()` - Create issue mutation
- `useUpdateIssue()` - Update issue mutation
- And more mutation hooks
  **Usage**: Use in components for automatic loading/error handling

### `lib/types.ts`

**Purpose**: TypeScript type definitions  
**Contains**:

- `User` interface
- `Project` interface
- `Issue` interface
- `Sprint` interface
- `Epic` interface
- `Comment` interface
- Enums for statuses and priorities
  **Usage**: Import types for type-safe development

---

## Component Files

### `components/protected-layout.tsx`

**Purpose**: Route protection wrapper  
**Contains**:

- Auth check logic
- Redirect to login if not authenticated
- Loading state display
  **Usage**: Wrap pages that require authentication

### `components/sidebar.tsx`

**Purpose**: Main navigation sidebar  
**Contains**:

- Logo and branding
- Main navigation menu
- Project-specific navigation
- User menu with logout
- Mobile toggle button
  **Features**: Responsive, mobile-friendly, context-aware

### `components/issue-card.tsx`

**Purpose**: Reusable issue display component  
**Contains**:

- Issue key, title, type icon
- Priority badge
- Assignee avatar
- Story points
- Labels
- Drag-drop support
  **Usage**: Used in lists, boards, and backlog views

### `components/board-column.tsx`

**Purpose**: Kanban board column  
**Contains**:

- Column header with issue count
- Issue list
- Drag-drop handlers
- Empty state message
  **Usage**: 5 columns create the sprint board

---

## Page Files

### Dashboard Pages

#### `app/dashboard/page.tsx`

**Purpose**: Main dashboard hub  
**Contains**: User welcome, recent issues, projects list, stats
**Uses**: `useProjects()`, `useIssues()` hooks

### Projects Pages

#### `app/projects/page.tsx`

**Purpose**: Projects listing and creation  
**Contains**: Project grid, search, create form
**Uses**: `useProjects()`, `useCreateProject()` hooks

#### `app/projects/[id]/page.tsx`

**Purpose**: Project overview  
**Contains**: Project details, sprints, issues, team
**Uses**: `useProject()`, `useSprints()`, `useIssues()` hooks

#### `app/projects/[id]/board/page.tsx`

**Purpose**: Sprint Kanban board  
**Contains**: Kanban columns, drag-drop, sprint selector
**Uses**: `useProject()`, `useSprints()`, `useIssues()`, `useUpdateIssue()` hooks

#### `app/projects/[id]/backlog/page.tsx`

**Purpose**: Backlog and sprint planning  
**Contains**: Sprint list, backlog items, create sprint form
**Uses**: `useProject()`, `useSprints()`, `useIssues()`, `useCreateSprint()` hooks

#### `app/projects/[id]/epics/page.tsx`

**Purpose**: Epic management  
**Contains**: Epic grid, create epic form
**Uses**: `useProject()`, `useEpics()` hooks

#### `app/projects/[id]/settings/page.tsx`

**Purpose**: Project settings and team management  
**Contains**: Project editing, member management, delete option
**Uses**: `useProject()`, `useAuth()` for role checking

### Issues Pages

#### `app/issues/page.tsx`

**Purpose**: Issues listing with filtering  
**Contains**: Issue list, search, filters (status, priority)
**Uses**: `useIssues()` hook with filters

#### `app/issues/[id]/page.tsx`

**Purpose**: Issue details  
**Contains**: Full issue info, description, comments, edit form
**Uses**: `useIssue()`, `useUpdateIssue()` hooks

---

## Utility Files

### `lib/utils.ts`

**Purpose**: Helper utilities  
**Contains**: `cn()` function for classname merging
**Usage**: Combine conditional Tailwind classes

### `.env.example`

**Purpose**: Environment variable template  
**Contains**: `NEXT_PUBLIC_API_URL` configuration example
**Usage**: Copy to `.env.local` and configure

---

## Component Structure Map

```
/components/ui/               ← shadcn/ui components
├── button.tsx
├── input.tsx
├── label.tsx
├── card.tsx
├── badge.tsx
├── select.tsx
├── spinner.tsx
├── empty.tsx
└── ... other components

/components/
├── sidebar.tsx              ← Navigation
├── issue-card.tsx           ← Issue display
├── board-column.tsx         ← Kanban column
└── protected-layout.tsx     ← Route protection
```

---

## Page Hierarchy

```
/app/
├── page.tsx                          ← Landing page (public)
├── layout.tsx                        ← Root layout
├── globals.css                       ← Global styles
│
├── auth/
│   ├── login/page.tsx               ← Login (public)
│   └── register/page.tsx            ← Register (public)
│
├── dashboard/
│   └── page.tsx                     ← Dashboard (protected)
│
├── projects/
│   ├── page.tsx                     ← Projects list (protected)
│   └── [id]/
│       ├── page.tsx                 ← Project detail (protected)
│       ├── board/
│       │   └── page.tsx             ← Sprint board (protected)
│       ├── backlog/
│       │   └── page.tsx             ← Backlog (protected)
│       ├── epics/
│       │   └── page.tsx             ← Epics (protected)
│       └── settings/
│           └── page.tsx             ← Settings (protected)
│
└── issues/
    ├── page.tsx                     ← Issues list (protected)
    └── [id]/
        └── page.tsx                 ← Issue detail (protected)
```

---

## Dependency Overview

### External Libraries

- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **tailwindcss** - Styling
- **shadcn/ui** - Component library
- **lucide-react** - Icons

### Internal Modules

- **lib/api.ts** - API communication
- **lib/auth-context.tsx** - State management
- **lib/hooks.ts** - Data fetching
- **lib/types.ts** - Type definitions
- **components/** - React components

---

## File Size Overview

| File                                | Type      | Lines | Purpose          |
| ----------------------------------- | --------- | ----- | ---------------- |
| lib/api.ts                          | Utility   | 250+  | API client       |
| lib/auth-context.tsx                | Context   | 140+  | Auth state       |
| lib/hooks.ts                        | Hooks     | 200+  | Data fetching    |
| lib/types.ts                        | Types     | 140+  | Type definitions |
| components/sidebar.tsx              | Component | 180+  | Navigation       |
| app/projects/[id]/board/page.tsx    | Page      | 185+  | Sprint board     |
| app/projects/[id]/settings/page.tsx | Page      | 305+  | Settings         |
| app/issues/[id]/page.tsx            | Page      | 280+  | Issue detail     |

---

## Critical Files to Know

### Must-Know Files

1. **lib/api.ts** - All API communication happens here
2. **lib/auth-context.tsx** - Authentication state
3. **app/layout.tsx** - App initialization
4. **app/globals.css** - Theme and styling

### Important Components

1. **components/sidebar.tsx** - Main navigation
2. **components/issue-card.tsx** - Issue display
3. **components/board-column.tsx** - Board columns

### Key Pages

1. **app/dashboard/page.tsx** - Home/hub
2. **app/projects/[id]/board/page.tsx** - Main feature
3. **app/issues/page.tsx** - Issue management

---

## Where to Make Changes

### Add New Page

- Create file in `/app` with appropriate folder
- Import components and hooks
- Wrap with `ProtectedLayout` if needed

### Add New API Endpoint

- Add function to corresponding module in `lib/api.ts`
- Create hook in `lib/hooks.ts` if needed
- Use in components

### Update Theme

- Edit `app/globals.css`
- Change CSS custom properties
- Both light and dark modes

### Add New Component

- Create in `/components` directory
- Keep focused and reusable
- Use shadcn/ui components
- Export for use in pages

### Update Sidebar

- Edit `components/sidebar.tsx`
- Add new navigation items
- Update context-aware menu

---

## Import Patterns

### Common Imports

```typescript
// API
import { projectsApi, issuesApi } from "@/lib/api";

// Hooks
import { useProjects, useCreateProject } from "@/lib/hooks";

// Types
import { Project, Issue, Sprint } from "@/lib/types";

// Auth
import { useAuth } from "@/lib/auth-context";

// Components
import { Sidebar } from "@/components/sidebar";
import { IssueCard } from "@/components/issue-card";
import { Button } from "@/components/ui/button";

// Utilities
import { cn } from "@/lib/utils";
```

---

## Quick Reference

| Need          | File                     | Use                    |
| ------------- | ------------------------ | ---------------------- |
| API endpoint  | `lib/api.ts`             | Add function to module |
| Data fetching | `lib/hooks.ts`           | Use or create hook     |
| Types         | `lib/types.ts`           | Import interface       |
| Auth check    | `lib/auth-context.tsx`   | Use `useAuth()` hook   |
| New page      | `app/`                   | Create file/folder     |
| Navigation    | `components/sidebar.tsx` | Add menu item          |
| Styling       | `app/globals.css`        | Update tokens          |
| Component     | `components/`            | Create .tsx file       |

---

This guide should help you quickly locate and understand any file in the ProjectHub frontend codebase.
