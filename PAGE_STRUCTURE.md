# ProjectHub - Page Structure & Navigation

## Site Map

```
ProjectHub (/)
├── Landing Page (/)
│   ├── Features Overview
│   ├── Sign In Link
│   └── Get Started Link
│
├── Authentication
│   ├── Login (/auth/login)
│   │   ├── Email input
│   │   ├── Password input
│   │   └── Register link
│   │
│   └── Register (/auth/register)
│       ├── Name input
│       ├── Email input
│       ├── Password input
│       ├── Confirm password
│       └── Sign In link
│
├── Authenticated Routes [Protected]
│   ├── Dashboard (/dashboard) [Main Hub]
│   │   ├── User welcome
│   │   ├── Recent issues
│   │   ├── Projects list
│   │   ├── Quick stats
│   │   └── New project button
│   │
│   ├── Projects
│   │   ├── Projects List (/projects)
│   │   │   ├── Project search
│   │   │   ├── Project grid
│   │   │   ├── Create project form
│   │   │   └── Project cards
│   │   │
│   │   └── Project Detail (/projects/:id)
│   │       ├── Project overview
│   │       ├── Quick navigation
│   │       ├── Active sprints
│   │       ├── In-progress issues
│   │       ├── Team members
│   │       ├── Project stats
│   │       └── Navigation to sub-pages
│   │
│   ├── Project Sub-Pages (/projects/:id/*)
│   │   ├── Board (/projects/:id/board)
│   │   │   ├── Sprint selector
│   │   │   ├── Kanban columns (5)
│   │   │   │   ├── Backlog
│   │   │   │   ├── To Do
│   │   │   │   ├── In Progress
│   │   │   │   ├── In Review
│   │   │   │   └── Done
│   │   │   └── Drag-drop functionality
│   │   │
│   │   ├── Backlog (/projects/:id/backlog)
│   │   │   ├── Create sprint form
│   │   │   ├── Sprint list
│   │   │   │   ├── Sprint name & goal
│   │   │   │   ├── Sprint dates
│   │   │   │   └── Issues in sprint
│   │   │   └── Backlog section
│   │   │       └── Unscheduled issues
│   │   │
│   │   ├── Epics (/projects/:id/epics)
│   │   │   ├── Create epic form
│   │   │   └── Epic cards grid
│   │   │       ├── Epic name
│   │   │       ├── Epic description
│   │   │       ├── Epic status
│   │   │       └── Issue count
│   │   │
│   │   └── Settings (/projects/:id/settings)
│   │       ├── Project details section
│   │       │   ├── Project name
│   │       │   ├── Project key
│   │       │   ├── Description
│   │       │   └── Edit button
│   │       ├── Team members section
│   │       │   ├── Add member form
│   │       │   │   ├── Email input
│   │       │   │   ├── Role selector
│   │       │   │   └── Invite button
│   │       │   └── Members list
│   │       │       ├── Member card
│   │       │       ├── Member role
│   │       │       └── Remove button
│   │       └── Danger zone
│   │           └── Delete project button
│   │
│   ├── Issues
│   │   ├── Issues List (/issues)
│   │   │   ├── Search bar
│   │   │   ├── Filters section
│   │   │   │   ├── Status selector
│   │   │   │   ├── Priority selector
│   │   │   │   └── Reset filters
│   │   │   ├── Issues list
│   │   │   └── Create issue button
│   │   │
│   │   └── Issue Detail (/issues/:id)
│   │       ├── Issue header
│   │       │   ├── Issue key & title
│   │       │   ├── Status badge
│   │       │   ├── Priority badge
│   │       │   └── Edit button
│   │       ├── Main content
│   │       │   ├── Description section
│   │       │   └── Comments section
│   │       │       ├── Comment list
│   │       │       ├── Add comment form
│   │       │       └── Post button
│   │       └── Sidebar
│   │           ├── Status selector
│   │           ├── Assignee info
│   │           ├── Reporter info
│   │           ├── Priority badge
│   │           ├── Dates
│   │           └── Save button
│   │
│   └── Sidebar Navigation (All Pages)
│       ├── Logo & branding
│       ├── Navigation items
│       │   ├── Dashboard
│       │   ├── My Issues
│       │   ├── Projects
│       │   └── [Project-specific items when in project]
│       │       ├── Board
│       │       ├── Backlog
│       │       └── Settings
│       └── User menu
│           ├── User avatar
│           ├── User name & email
│           └── Sign out button

```

## Page-by-Page Breakdown

### 1. Landing Page (`/`)

**Route**: Public (no auth required)  
**Purpose**: Marketing and authentication entry point

**Sections**:

- Hero section with value proposition
- Feature highlights (3 main features)
- Call-to-action (Get Started, Sign In)
- Footer

**Interactions**:

- Click "Get Started" → `/auth/register`
- Click "Sign In" → `/auth/login`
- Click logo → `/dashboard` (if authenticated)

---

### 2. Login Page (`/auth/login`)

**Route**: Public  
**Purpose**: User authentication

**Components**:

- Logo and branding
- Email input
- Password input
- Sign in button
- Error message display
- "Create Account" link

**Interactions**:

- Submit form → Authenticate
- Click "Create Account" → `/auth/register`

---

### 3. Register Page (`/auth/register`)

**Route**: Public  
**Purpose**: New user account creation

**Components**:

- Logo and branding
- Name input
- Email input
- Password input
- Confirm password input
- Password requirements info
- Create account button
- Error message display
- "Sign In" link

**Interactions**:

- Submit form → Create account
- Click "Sign In" → `/auth/login`

---

### 4. Dashboard (`/dashboard`)

**Route**: Protected  
**Purpose**: Main hub for authenticated users

**Sections**:

- Welcome header with user's name
- Recent issues (top 5 assigned to user)
- Quick stats (projects, issues, etc.)
- Projects sidebar (top 5 projects)

**Components**:

- Issue cards (compact)
- Project cards
- Stats display

**Interactions**:

- Click issue → `/issues/:id`
- Click project → `/projects/:id`
- Click "View All Issues" → `/issues`
- Click "New Project" → `/projects` (show form)

---

### 5. Projects List (`/projects`)

**Route**: Protected  
**Purpose**: Browse and manage all projects

**Sections**:

- Search bar
- Create project form (toggle)
- Projects grid (3 columns)

**Components**:

- Project cards with metadata
- Create project form
- Empty state

**Interactions**:

- Click project card → `/projects/:id`
- Submit create form → Create project
- Search filters projects

---

### 6. Project Overview (`/projects/:id`)

**Route**: Protected  
**Purpose**: Project hub with all options

**Sections**:

- Project header with metadata
- Quick navigation buttons (4 items)
- Active sprints section
- In-progress issues section
- Team sidebar
- Stats sidebar

**Interactions**:

- Click Board → `/projects/:id/board`
- Click Backlog → `/projects/:id/backlog`
- Click Epics → `/projects/:id/epics`
- Click Team → `/projects/:id/settings`

---

### 7. Sprint Board (`/projects/:id/board`)

**Route**: Protected  
**Purpose**: Kanban board for active sprint

**Sections**:

- Sprint selector dropdown
- 5-column board (Backlog, To Do, In Progress, In Review, Done)

**Features**:

- Drag-and-drop issues between columns
- Issue cards with all relevant info
- Column headers with issue counts

**Interactions**:

- Drag issue to column → Update issue status
- Click issue card → `/issues/:id`
- Select different sprint → Refresh board

---

### 8. Backlog (`/projects/:id/backlog`)

**Route**: Protected  
**Purpose**: Sprint planning and backlog management

**Sections**:

- Create sprint form (toggle)
- Sprint list (organized by status)
- Backlog section (unscheduled issues)

**Components**:

- Sprint cards with issues
- Issue cards (compact)
- Create sprint form

**Interactions**:

- Submit create form → Create sprint
- Click issue → `/issues/:id`
- View all sprints organized by status

---

### 9. Epics (`/projects/:id/epics`)

**Route**: Protected  
**Purpose**: Manage large bodies of work

**Sections**:

- Create epic form (toggle)
- Epic cards grid (3 columns)

**Components**:

- Epic cards with metadata
- Create epic form
- Empty state

**Interactions**:

- Submit create form → Create epic
- Click epic card → Epic details (expandable)

---

### 10. Project Settings (`/projects/:id/settings`)

**Route**: Protected  
**Purpose**: Project configuration and team management

**Sections**:

- Project details (with edit option)
- Team members section
  - Add member form
  - Members list
- Danger zone (delete project)

**Features**:

- Edit project info
- Add/remove team members
- Manage member roles
- Delete project

**Interactions**:

- Edit form → Update project
- Submit add member form → Add member
- Click remove button → Remove member
- Click delete button → Delete project

---

### 11. Issues List (`/issues`)

**Route**: Protected  
**Purpose**: View all assigned issues with filtering

**Sections**:

- Search bar
- Filters (status, priority)
- Issues list

**Components**:

- Filter controls
- Issue cards
- Empty state

**Interactions**:

- Type search → Filter issues
- Select status/priority → Filter issues
- Click issue → `/issues/:id`
- Click "Reset Filters" → Clear filters

---

### 12. Issue Detail (`/issues/:id`)

**Route**: Protected  
**Purpose**: Full issue information and management

**Sections**:

- Issue header (key, title, status, priority)
- Description section
- Comments section
- Sidebar (metadata and controls)

**Features**:

- Edit issue details
- Add comments
- View issue history
- Change status/priority

**Interactions**:

- Edit fields → Update issue
- Add comment → Submit comment
- Change status → Update issue
- Back button → Return to previous page

---

## Navigation Flow

### User Journey - First Time

```
Landing (/)
  ↓
Register (/auth/register)
  ↓
Login (/auth/login) [Auto after register]
  ↓
Dashboard (/dashboard)
  ↓
Projects (/projects) [Click "New Project"]
  ↓
Project (/projects/:id)
  ↓
Board (/projects/:id/board)
```

### Navigation Patterns

#### Project Context Navigation

```
/projects/:id
├── /projects/:id/board
├── /projects/:id/backlog
├── /projects/:id/epics
└── /projects/:id/settings
```

#### Sidebar Always Available

All authenticated pages have sidebar with:

- Main nav items
- Project-specific items (when in project)
- User menu with logout

#### Breadcrumb Navigation

- Dashboard → Projects → Project → Specific View
- Each page has "Back" button for mobile

## Responsive Behavior

### Mobile (< 768px)

- Sidebar: Hamburger menu toggle
- Full-width content
- Stacked filters and forms
- Single column layouts
- Touch-friendly spacing

### Tablet (768px - 1024px)

- Sidebar: Visible or toggle
- 2-column grids
- Responsive forms
- Adjusted spacing

### Desktop (> 1024px)

- Sidebar: Always visible
- Multi-column layouts
- Side-by-side forms
- Full spacing

---

This structure provides a comprehensive project management interface with clear navigation patterns and intuitive user flows.
