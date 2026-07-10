import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { login as apiLogin, logout as apiLogout, restoreSession } from '@piiaura/api';
import type { Role, User } from '@piiaura/types';
import { ROLE_HOME_ROUTE } from '@piiaura/constants';

interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (identifier: string, password: string, role?: Role) => Promise<string>;
  logout: () => void;
}

function inferRole(identifier: string): Role | undefined {
  const value = identifier.trim().toUpperCase();
  if (value.startsWith('FAC') || value.startsWith('EMP')) return 'faculty';
  if (/^[A-Z]{2}\d{2}[A-Z]\d{3}$/.test(value)) return 'student';
  return undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      login: async (identifier: string, password: string, role?: Role) => {
        set({ isLoading: true });

        try {
          const resolvedRole = role ?? inferRole(identifier);
          const result = await apiLogin(identifier, password, resolvedRole);
          set({
            user: result.user,
            tokens: { access: result.access, refresh: result.refresh },
            isAuthenticated: true,
            isLoading: false,
          });
          return ROLE_HOME_ROUTE[result.user.role];
        } catch (error) {
          set({ isLoading: false });
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Unable to sign in. Please check your connection and try again.');
        }
      },

      logout: () => {
        void apiLogout();
        set({ user: null, tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: 'piiaura.auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.tokens) {
          restoreSession(state.tokens.access, state.tokens.refresh);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  return { user, isAuthenticated, isLoading, hasHydrated, login, logout };
}
