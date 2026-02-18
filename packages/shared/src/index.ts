export type Role = "admin" | "hr" | "payroll" | "employee";

export type UserDto = {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};