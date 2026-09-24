"use client";

import Link from "next/link";

import {
  LogIn,
  LogOut,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { SyncStatus } from "@/components/sync/SyncStatus";

export function AuthAccount() {
  const {
    user,
    isSignedIn,
    loading,
    signOut,
  } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error(
        "InkPlan sign out failed:",
        error,
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-md px-3 py-2.5">
        <p className="text-xs text-muted-foreground">
          Checking account...
        </p>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Link
        href="/sign-in"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogIn className="size-5" />
        <span>Sign in</span>
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-md px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <UserRound className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">
            Signed in
          </p>

          <p
            className="truncate text-xs text-muted-foreground"
            title={user.email ?? ""}
          >
            {user.email ?? "Account"}
          </p>
        </div>
      </div>

      <SyncStatus />

      <button
        type="button"
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-5" />
        <span>Sign out</span>
      </button>
    </div>
  );
}