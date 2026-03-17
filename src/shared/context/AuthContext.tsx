import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { APP_CONSTANTS } from "@/config/constants";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const storedUser = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER);

function getInitialUser(): User | null {
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);

  const isAuthenticated = !!currentUser;

  const login = useCallback((user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, token);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.USER,
        JSON.stringify(currentUser)
      );
    }
  }, [currentUser]);

  const value: AuthContextValue = {
    currentUser,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
