import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { UserSummary } from "../types";

interface CurrentUserContextValue {
  users: UserSummary[];
  currentUserId: number | null;
  currentUser: UserSummary | null;
  setCurrentUserId: (id: number) => void;
  loading: boolean;
  refreshUsers: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const STORAGE_KEY = "silent-shift-current-user";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUsers = () => {
    api.users().then((list) => {
      setUsers(list);
      setLoading(false);
      setCurrentUserIdState((prev) => {
        if (prev && list.some((u) => u.id === prev)) return prev;
        const fallback = list.find((u) => !u.is_scenario_actor) ?? list[0];
        return fallback ? fallback.id : null;
      });
    });
  };

  useEffect(() => {
    refreshUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrentUserId = (id: number) => {
    setCurrentUserIdState(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  };

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;

  return (
    <CurrentUserContext.Provider value={{ users, currentUserId, currentUser, setCurrentUserId, loading, refreshUsers }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
