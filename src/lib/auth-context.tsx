"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@/types";

const TOKEN_KEY = "ingata_token";
const USER_KEY = "ingata_user";

// Mirrors the backend's 8h JWT so the cookie doesn't outlive the token it
// describes. Deliberately NOT httpOnly: it's written from the browser, and it
// holds no secret (just the id and role), so the only thing that can read it is
// src/proxy.ts, which uses it purely as an optimistic hint for route gating.
const SESSION_COOKIE = "ingata_session";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

type SessionHint = { id: string; role: string };

function writeSessionCookie(user: AuthUser) {
  const hint: SessionHint = { id: user.id, role: user.role };
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(hint))}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Single source of truth for "is someone logged in" across the app —
// Navbar, the account pages and AuthForm all read/write through this
// instead of touching localStorage directly, so every component re-renders
// together the moment login/logout happens.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Synchronizing with an external system (the browser's localStorage,
    // unavailable during SSR) on mount — exactly the case this effect
    // exists for, not state that could be derived during render.
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser) as AuthUser;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(storedToken);
        setUser(parsed);
        // Re-issue the hint cookie for sessions that predate it, so an
        // already-logged-in user isn't bounced to /login by the proxy once.
        writeSessionCookie(parsed);
      }
    } catch {
      // Corrupt or inaccessible storage — treat as logged out.
    }
    setReady(true);
  }, []);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    writeSessionCookie(newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearSessionCookie();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // apiFetch/apiFetchPaginated/uploadImage fire this when a request sent
    // with a token comes back 401 — the token has gone stale (expired,
    // typically), so drop it here rather than leaving every page that
    // happens to fetch something to show its own unexplained error.
    window.addEventListener("ingata:session-expired", logout);
    return () => window.removeEventListener("ingata:session-expired", logout);
  }, [logout]);

  const updateUser = useCallback((updated: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    // Keep the hint cookie in step — a role change (an admin demoting someone)
    // has to be reflected in the proxy's routing, not just in local state.
    writeSessionCookie(updated);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
