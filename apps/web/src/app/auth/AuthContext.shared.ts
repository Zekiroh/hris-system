import { createContext } from "react";

export type BackendRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  role: BackendRole;
};

export type LoginRole = "USER" | "ADMIN";

export type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  loginRole: LoginRole;
  setLoginRole: (role: LoginRole) => void;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
