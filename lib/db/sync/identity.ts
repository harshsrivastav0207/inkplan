const OWNER_KEY = "inkplan:local-data-owner";

export function getStoredOwner(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(OWNER_KEY);
}

export function setStoredOwner(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(OWNER_KEY, userId);
}

export function clearStoredOwner(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(OWNER_KEY);
}