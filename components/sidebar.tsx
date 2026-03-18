"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ListTodo,
  GitBranch,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  projectId?: string;
  currentView?: "issues" | "board" | "backlog" | "settings";
}

export function Sidebar({ projectId, currentView }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "My Issues",
      icon: ListTodo,
      href: "/issues",
      active: pathname === "/issues",
    },
    {
      label: "Projects",
      icon: BookOpen,
      href: "/projects",
      active: pathname === "/projects",
    },
    ...(projectId
      ? [
          {
            label: "Board",
            icon: GitBranch,
            href: `/projects/${projectId}/board`,
            active: currentView === "board",
          },
          {
            label: "Backlog",
            icon: ListTodo,
            href: `/projects/${projectId}/backlog`,
            active: currentView === "backlog",
          },
          {
            label: "Settings",
            icon: Settings,
            href: `/projects/${projectId}/settings`,
            active: currentView === "settings",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-card border-border hover:bg-secondary fixed top-4 left-4 z-50 rounded-lg border p-2 transition-colors md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-sidebar-border fixed top-0 left-0 z-40 h-screen w-64 border-r transition-transform md:static md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <Link href="/dashboard" className="mt-2 mb-8 flex items-center gap-2">
            <div className="bg-sidebar-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="text-sidebar-primary-foreground font-bold">PH</span>
            </div>
            <h1 className="text-sidebar-foreground text-lg font-bold">ProjectHub</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors",
                    item.active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="border-sidebar-border border-t pt-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hover:bg-sidebar-accent text-sidebar-foreground flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sidebar-foreground truncate text-sm font-medium">
                      {user?.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-transform",
                    isUserMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="bg-card border-border absolute right-0 bottom-full left-0 z-50 mb-2 overflow-hidden rounded-lg border shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/5 flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
