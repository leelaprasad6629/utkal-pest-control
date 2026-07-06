/**
 * UserContext — single source of truth for the authenticated local user record.
 *
 * Usage:
 *   const { user, loading, refreshUser } = useUserContext();
 *
 * Role values returned from the server are always one of:
 *   "customer" | "technician" | "admin"
 * ("manager" is normalised to "admin" by the backend before storage.)
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { apiFetch } from "@/lib/api";
import type { LocalUser } from "@/lib/types";

interface UserContextValue {
  user: LocalUser | null;
  loading: boolean;
  /** Call after any action that might change the user's role / data. */
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const token = await getToken();
      const data = await apiFetch<LocalUser>("/me", { token });
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    setLoading(true);
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}

/** Returns true when the user has admin/manager-level access. */
export function isAdmin(user: LocalUser | null): boolean {
  return user?.role === "admin";
}

/** Returns true when the user is a technician. */
export function isTechnician(user: LocalUser | null): boolean {
  return user?.role === "technician";
}

/** Returns true when the user is a regular customer. */
export function isCustomer(user: LocalUser | null): boolean {
  return !user || user.role === "customer";
}
