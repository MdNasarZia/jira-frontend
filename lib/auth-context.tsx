"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState } from "./types";
import { callApi, auth as authClient, ApiError } from "./callApi";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const user = await callApi<User>("/auth/me");
          setState({
            user,
            token,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        authClient.logout();
        setState({
          user: null,
          token: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to initialize auth",
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await authClient.login(email, password);
      const user = await callApi<User>("/auth/me");
      setState({
        user,
        token: data.access_token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setState({ user: null, token: null, isLoading: false, error: errorMessage });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await callApi<{ access_token: string; refresh_token: string; user: User }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ email, password, name }) }
      );
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setState({
        user: data.user,
        token: data.access_token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setState({ user: null, token: null, isLoading: false, error: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    authClient.logout();
    setState({ user: null, token: null, isLoading: false, error: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        isAuthenticated: !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
