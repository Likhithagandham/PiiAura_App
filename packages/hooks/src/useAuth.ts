import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@piiaura/types';
import { ROLE_HOME_ROUTE } from '@piiaura/constants';
import { mockUsers, MOCK_CREDENTIALS } from '@piiaura/mock-data';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (identifier: string, password: string) => Promise<string>;
  logout: () => void;
}

function findUserByIdentifier(identifier: string): User | undefined {
  const normalized = identifier.trim().toLowerCase();
  return mockUsers.find((user) => {
    const candidates = [
      user.email,
      user.employeeCode,
      user.admissionNumber,
      user.rollNumber,
      user.phone,
    ]
      .filter(Boolean)
      .map((value) => value!.toLowerCase());

    return candidates.includes(normalized);
  });
}

function isValidCredential(identifier: string, password: string): boolean {
  const normalized = identifier.trim().toLowerCase();
  return Object.values(MOCK_CREDENTIALS).some(
    (credential) =>
      credential.password === password &&
      credential.identifiers.some((id) => id.toLowerCase() === normalized),
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      login: async (identifier: string, password: string) => {
        set({ isLoading: true });

        await new Promise((resolve) => setTimeout(resolve, 600));

        const matchedUser = findUserByIdentifier(identifier);

        if (!matchedUser || !isValidCredential(identifier, password)) {
          set({ isLoading: false });
          throw new Error('Invalid credentials. Please check your details and try again.');
        }

        set({ user: matchedUser, isAuthenticated: true, isLoading: false });
        return ROLE_HOME_ROUTE[matchedUser.role];
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'piiaura.auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
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
