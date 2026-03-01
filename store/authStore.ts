import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("forge_token", token);
        }
        set({ user, token });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("forge_token");
        }
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: "forge-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);