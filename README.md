# ProjectHub - Production-Level Jira Clone Frontend

A complete React/Next.js 16 frontend for a production-level project management system similar to Jira. Built with TypeScript, shadcn/ui, and Tailwind CSS.

## Features

### Authentication

- User registration and login
- JWT token-based authentication with localStorage persistence
- Protected routes with automatic redirects
- Session management with auth context

### Project Management

- **Projects Dashboard**: Create, view, and manage projects
- **Issue Tracking**: Create, update, delete, and filter issues
- **Sprint Planning**: Create sprints, manage sprint goals and dates
- **Sprint Board**: Kanban-style board with drag-and-drop issue management
- **Backlog Management**: Organize backlog items and manage sprint planning
- **Epic Management**: Create and organize epics (large bodies of work)
- **Team Collaboration**: Assign issues, add comments, track issue history

### User Experience

- Responsive design (mobile-first)
- Dark/Light theme support
- Professional UI with shadcn/ui components
- Real-time drag-and-drop functionality
- Advanced filtering and search capabilities
- Intuitive navigation with sidebar menu

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx                 # Root layout with AuthProvider
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Global styles with design tokens
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Registration page
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard
│   ├── issues/
│   │   ├── page.tsx               # Issues list with filters
│   │   └── [id]/page.tsx          # Issue detail page
│   └── projects/
│       ├── page.tsx               # Projects listing
│       └── [id]/
│           ├── page.tsx           # Project overview
│           ├── board/page.tsx      # Sprint board (Kanban)
│           ├── backlog/page.tsx    # Backlog management
│           ├── epics/page.tsx      # Epic management
│           └── settings/page.tsx   # Project settings & team management
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── sidebar.tsx                # Main navigation sidebar
│   ├── issue-card.tsx             # Issue display card
│   ├── board-column.tsx           # Kanban board column
│   ├── protected-layout.tsx       # Auth protection wrapper
├── lib/
│   ├── api.ts                     # API utilities and endpoints
│   ├── types.ts                   # TypeScript type definitions
│   ├── auth-context.tsx           # Auth provider and hooks
│   ├── hooks.ts                   # Custom data fetching hooks
│   └── utils.ts                   # Utility functions
└── package.json                   # Dependencies
```

## API Integration

The frontend connects to a backend API (configure `NEXT_PUBLIC_API_URL`):

### Key API Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET/POST /projects` - Project management
- `GET/POST /issues` - Issue management
- `GET/POST /sprints` - Sprint management
- `GET /backlog` - Backlog items
- `GET/POST /epics` - Epic management
- `GET /members` - Team members

See `lib/api.ts` for complete API client implementation.

## Environment Setup

### Required Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Running the Application

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start development server**

   ```bash
   pnpm dev
   ```

3. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

## Key Technologies

- **Framework**: Next.js 16 with App Router
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS with semantic design tokens
- **State Management**: React Context API
- **Type Safety**: TypeScript
- **HTTP Client**: Native Fetch API with custom wrapper
- **Icons**: lucide-react

## Component Architecture

### Protected Routes

All authenticated pages are wrapped with `ProtectedLayout` which:

- Checks authentication status
- Redirects unauthenticated users to login
- Shows loading state while verifying auth

### Sidebar Navigation

The `Sidebar` component provides:

- Main navigation menu
- User profile menu with logout
- Context-aware navigation (changes based on current project)
- Mobile responsive toggle

### Data Fetching Hooks

Custom hooks in `lib/hooks.ts` provide:

- Query hooks for fetching data (`useIssues`, `useProjects`, etc.)
- Mutation hooks for creating/updating data (`useCreateIssue`, `useUpdateIssue`, etc.)
- Automatic loading and error states
- Refetch capabilities

## Authentication Flow

1. User visits landing page → redirects to login if not authenticated
2. User registers/logs in
3. Backend returns JWT token
4. Token stored in localStorage and auth context
5. Token included in all subsequent API requests
6. Protected routes check auth context before rendering
7. Logout clears token and auth context

## Design System

### Colors

- **Primary**: Deep blue (oklch 0.37 0.2 254) - Main brand color
- **Accent**: Bright blue (oklch 0.55 0.25 254) - Interactive elements
- **Destructive**: Red (oklch 0.65 0.25 15) - Delete/error actions
- **Neutrals**: Gray scale for background, cards, borders

### Typography

- **Headings**: Font system default (Geist)
- **Body**: Font system default (Geist)
- **Mono**: Geist Mono for code/IDs

### Spacing & Radius

- Uses Tailwind spacing scale
- Default radius: 0.5rem
- Consistent gap usage for component spacing

## Notable Features

### Drag-and-Drop Board

- Implemented with native HTML5 Drag API
- Issues can be moved between columns (statuses)
- Real-time API updates
- Visual feedback during drag operations

### Advanced Filtering

- Filter issues by status, priority, assignee
- Search by issue key or title
- Clear filters button for quick reset

### Team Management

- Project lead can add/remove team members
- Role-based access (Admin, Developer, Viewer)
- Display team members with avatars

### Issue Tracking

- Full issue lifecycle management
- Status: Backlog → Todo → In Progress → In Review → Done
- Priority levels: Low, Medium, High, Critical
- Issue types: Story, Bug, Task, Subtask, Epic
- Story points, due dates, labels support

## Future Enhancements

- Real-time updates with WebSockets
- Advanced filtering with saved filters
- Workflow automation and rules
- Custom fields and issue types
- Activity timeline and audit logs
- Notifications and mentions
- Integration with external services
- Advanced reporting and analytics

## Deployment

Deploy to Vercel using the deploy button or:

```bash
vercel deploy
```

Ensure `NEXT_PUBLIC_API_URL` environment variable is set in Vercel project settings.

## Support

For issues or questions, refer to the backend API documentation provided in the PRD.

---

Built with Next.js 16, shadcn/ui, and Tailwind CSS.
