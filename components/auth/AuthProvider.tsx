"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

import {
  startSyncEngine,
  stopSyncEngine,
} from "@/lib/db/sync/engine";

import { pullRemoteData } from "@/lib/db/sync/pull";

import { migrateLocalDataToCloud } from "@/lib/db/sync/migration";

type AuthContextValue = {
  user: User | null;
  isSignedIn: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const signOut = useCallback(async () => {
    stopSyncEngine();

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } =
        await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      setUser(data.user ?? null);
      setLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      stopSyncEngine();
    };
  }, [supabase]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      stopSyncEngine();
      return;
    }

    let cancelled = false;

    async function syncOnAuth() {
      try {
        await pullRemoteData();

        if (cancelled) {
          return;
        }

        await migrateLocalDataToCloud();
      } catch (error) {
        console.error(
          "[InkPlan Sync] Initial sync failed:",
          error,
        );
      }

      if (cancelled) {
        return;
      }

      startSyncEngine();
    }

    void syncOnAuth();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isSignedIn: Boolean(user),
      loading,
      signOut,
    }),
    [user, loading, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}