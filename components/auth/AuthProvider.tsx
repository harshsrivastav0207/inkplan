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

import {
  clearAllLocalData,
  countForeignQueueItems,
} from "@/lib/db/sync/cleanup";

import {
  getStoredOwner,
  setStoredOwner,
  clearStoredOwner,
} from "@/lib/db/sync/identity";

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

    /*
     * Best-effort push. We never block sign-out on sync failures,
     * because a permanent failure (e.g. RLS conflict with a
     * different account's row) would otherwise leave the user
     * unable to log out at all.
     */
    try {
      const { pushPendingSync } = await import(
        "@/lib/db/sync/push"
      );

      await pushPendingSync();
    } catch (error) {
      console.error(
        "[InkPlan Auth] Final sync before logout failed:",
        error,
      );
    }

    /*
     * Regardless of whether sync succeeded, wipe the local
     * account data so the next user does not inherit it.
     */
    await clearAllLocalData();
    clearStoredOwner();

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
      if (!user) {
        return;
      }

      /*
       * Step 1 — Bootstrap recovery.
       *
       * If the local queue contains RLS failures
       * (code=42501), the local data belongs to a
       * different Supabase account. Clear everything
       * before doing anything else.
       *
       * This is a one-time repair for the state that
       * existed before this fix was added.
       */
      try {
        const foreignCount =
          await countForeignQueueItems();

        if (foreignCount > 0) {
          console.warn(
            "[InkPlan Auth] Detected cross-account local data. Clearing local tables.",
          );

          await clearAllLocalData();
        }
      } catch (error) {
        console.error(
          "[InkPlan Auth] Cross-account check failed:",
          error,
        );
      }

      if (cancelled) {
        return;
      }

      /*
       * Step 2 — Identity check.
       *
       * If the stored owner is a different user id
       * than the current one, wipe local data before
       * pulling. This handles deliberate account
       * switching (A → B) without sign-out in between.
       */
      try {
        const storedOwner = getStoredOwner();

        if (
          storedOwner &&
          storedOwner !== user.id
        ) {
          console.warn(
            "[InkPlan Auth] Local data belongs to a different account. Clearing.",
          );

          await clearAllLocalData();
        }

        setStoredOwner(user.id);
      } catch (error) {
        console.error(
          "[InkPlan Auth] Identity check failed:",
          error,
        );
      }

      if (cancelled) {
        return;
      }

      /*
       * Step 3 — Pull remote data for the current user.
       */
      try {
        await pullRemoteData();
      } catch (error) {
        console.error(
          "[InkPlan Sync] Initial sync failed:",
          error,
        );
      }

      if (cancelled) {
        return;
      }

      /*
       * Step 4 — Migrate any remaining local-only data
       * up to the cloud (idempotent per user).
       */
      try {
        await migrateLocalDataToCloud(user.id);
      } catch (error) {
        console.error(
          "[InkPlan Sync] Migration failed:",
          error,
        );
      }

      if (cancelled) {
        return;
      }

      /*
       * Step 5 — Start the push engine.
       */
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