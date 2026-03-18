# ProjectHub Frontend - Setup Guide

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Backend API running (see backend documentation)

### Installation Steps

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

   Replace with your actual backend URL if different.

3. **Start the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `pnpm dev` - Start development server (hot reload enabled)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linting checks

## Backend Setup

This frontend requires a compatible backend API. The backend should provide:

1. **Authentication endpoints**
   - `POST /auth/register` - User registration
   - `POST /auth/login` - User login
   - `GET /auth/me` - Get current user

2. **Project endpoints**
   - CRUD operations for projects
   - Team member management

3. **Issue endpoints**
   - Full CRUD for issues
   - Issue filtering and search
   - Comments and history tracking

4. **Sprint management**
   - Sprint CRUD operations
   - Sprint status management

5. **Backlog & Epic endpoints**
   - Backlog management
   - Epic CRUD operations

See the backend API documentation for detailed endpoint specifications.

## Project Structure

### Key Directories

- **`/app`** - Next.js App Router pages and layouts
- **`/components`** - Reusable React components
- **`/lib`** - Utilities, API client, types, hooks
- **`/public`** - Static assets

### Important Files

- **`lib/api.ts`** - API client with all endpoints
- **`lib/types.ts`** - TypeScript type definitions
- **`lib/auth-context.tsx`** - Authentication context provider
- **`lib/hooks.ts`** - Custom data fetching hooks
- **`app/globals.css`** - Global styles and design tokens

## Authentication System

### How It Works

1. User submits login/register form
2. Request sent to backend
3. Backend returns JWT token
4. Token stored in `localStorage`
5. Token included in all subsequent requests via `Authorization: Bearer` header
6. Auth context maintains user state throughout the app

### Protected Routes

Routes under `/dashboard`, `/projects`, `/issues` are protected. Unauthenticated users are redirected to login.

## API Integration

All API calls go through `lib/api.ts`. The module exports:

- **`apiFetch()`** - Generic fetch wrapper with auth
- **`authApi`** - Authentication endpoints
- **`projectsApi`** - Project management
- **`issuesApi`** - Issue management
- **`sprintsApi`** - Sprint management
- **`backlogApi`** - Backlog operations
- **`epicsApi`** - Epic management
- **`membersApi`** - Team management

### Example Usage

```typescript
// In a component
import { useIssues } from '@/lib/hooks';

export function MyComponent() {
  const { data: issues, loading, error } = useIssues(projectId);

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

## Design & Styling

### Theme System

The app uses semantic design tokens defined in `app/globals.css`:

- **Colors** are defined as CSS custom properties in `:root` (light) and `.dark` (dark mode)
- **Typography** uses Tailwind font classes
- **Spacing** follows Tailwind's spacing scale
- **Components** use shadcn/ui for consistency

### Adding Custom Styles

1. Use Tailwind CSS utility classes first
2. For component-specific styles, use `cn()` utility
3. Update design tokens in `globals.css` for theme changes

## Common Development Tasks

### Adding a New Page

1. Create file in appropriate `/app` directory
2. Wrap with `ProtectedLayout` if authentication required
3. Use `Sidebar` for consistent navigation
4. Fetch data with custom hooks from `lib/hooks`
5. Use shadcn/ui components for UI

### Adding a New API Endpoint

1. Add function to appropriate module in `lib/api.ts`
2. Create custom hook in `lib/hooks.ts` if needed
3. Export and use in components

### Creating a New Component

1. Create file in `/components`
2. Use TypeScript interfaces for props
3. Keep components focused and reusable
4. Use shadcn/ui components where possible

## Troubleshooting

### API Connection Errors

1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify backend is running
3. Check browser console for detailed errors
4. Ensure CORS is configured on backend

### Authentication Issues

1. Verify token is stored in localStorage
2. Check token in network requests (DevTools → Network → Headers)
3. Ensure backend returns token in response
4. Clear localStorage and re-login if needed

### Build Errors

1. Run `pnpm install` to ensure dependencies are installed
2. Check TypeScript errors with `pnpm tsc --noEmit`
3. Verify all imports are correct
4. Clear `.next` directory: `rm -rf .next`

## Performance Optimization

- Images are optimized with Next.js Image component
- Code splitting happens automatically with Next.js
- Tailwind CSS is purged for production builds
- API calls use React hooks to avoid redundant requests

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel project settings
4. Deploy

See [Vercel Deployment Documentation](https://vercel.com/docs) for details.

### Deploy to Other Platforms

Build and serve as standard Next.js application:

```bash
pnpm build
pnpm start
```

## Next Steps

1. Start development server: `pnpm dev`
2. Create an account at [http://localhost:3000](http://localhost:3000)
3. Create your first project
4. Explore the features

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://typescriptlang.org)

---

Happy building! 🚀
