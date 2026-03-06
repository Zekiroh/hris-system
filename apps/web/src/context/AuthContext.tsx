import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type BackendRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  role: BackendRole;
};

type LoginResponse = AuthUser & { token: string };

// UI-only: login tab selection (NOT the backend role)
type LoginRole = "USER" | "ADMIN";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;

  loginRole: LoginRole;
  setLoginRole: (role: LoginRole) => void;

  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Storage keys (single source of truth)
const AUTH_USER_KEY = "auth.user";
const AUTH_TOKEN_KEY = "auth.token";
const AUTH_LOGIN_ROLE_KEY = "auth.loginRole";

// Legacy keys from old attempts (we will cleanup)
const LEGACY_KEYS = ["token", "ui.loginRole"] as const;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function cleanupLegacyKeys() {
  for (const k of LEGACY_KEYS) {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  }
}

function loadInitialAuth(): { user: AuthUser | null; token: string | null } {
  // Prefer localStorage first (remembered), then sessionStorage (temporary)
  const rawUser = localStorage.getItem(AUTH_USER_KEY) ?? sessionStorage.getItem(AUTH_USER_KEY);
  const rawToken = localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY);

  const user = safeJsonParse<AuthUser>(rawUser);
  const token = rawToken ?? null;

  // if one is missing, treat as logged out
  if (!user || !token) return { user: null, token: null };

  return { user, token };
}

function loadInitialLoginRole(): LoginRole {
  const raw = localStorage.getItem(AUTH_LOGIN_ROLE_KEY);
  return raw === "ADMIN" ? "ADMIN" : "USER";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // cleanup legacy keys once (in effect, not during render)
  useEffect(() => {
    cleanupLegacyKeys();
  }, []);

  const initial = loadInitialAuth();

  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

  const [loginRole, setLoginRoleState] = useState<LoginRole>(() => loadInitialLoginRole());

  const isLoggedIn = !!token && !!user;

  // prevent accidental duplicate login calls (StrictMode / double click / fast refresh quirks)
  const loginInFlightRef = useRef(false);

  const setLoginRole = useCallback((role: LoginRole) => {
    setLoginRoleState(role);
    localStorage.setItem(AUTH_LOGIN_ROLE_KEY, role);

    // ensure no old duplicate keys exist
    localStorage.removeItem("ui.loginRole");
    sessionStorage.removeItem("ui.loginRole");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    // clear both persistent and session
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);

    cleanupLegacyKeys();
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      if (loginInFlightRef.current) return;
      loginInFlightRef.current = true;

      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Login failed (${res.status})`);
        }

        const data = (await res.json()) as LoginResponse;

        // Enforce tab selection vs backend role
        const isBackendAdmin = data.role === "SUPER_ADMIN" || data.role === "ADMIN";
        const isBackendUser = data.role === "USER";

        const validForTab =
          (loginRole === "ADMIN" && isBackendAdmin) || (loginRole === "USER" && isBackendUser);

        if (!validForTab) {
          // kill any existing session
          logout();
          throw new Error(
            loginRole === "ADMIN"
              ? "This account is not an admin. Please use User Login."
              : "This account is an admin. Please use Admin Login."
          );
        }

        const nextUser: AuthUser = {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          roleId: data.roleId,
          role: data.role,
        };

        // Store based on remember
        if (remember) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);

          // clear session copy to avoid confusion
          sessionStorage.removeItem(AUTH_USER_KEY);
          sessionStorage.removeItem(AUTH_TOKEN_KEY);
        } else {
          sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
          sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);

          // clear persistent copy to avoid sticky login
          localStorage.removeItem(AUTH_USER_KEY);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }

        // update state
        setUser(nextUser);
        setToken(data.token);

        cleanupLegacyKeys();
      } finally {
        loginInFlightRef.current = false;
      }
    },
    [loginRole, logout]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoggedIn,
      loginRole,
      setLoginRole,
      login,
      logout,
    }),
    [user, token, isLoggedIn, loginRole, setLoginRole, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}