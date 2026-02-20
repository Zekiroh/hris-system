import type { Role } from "../types/role";

export type UserDto = {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
};