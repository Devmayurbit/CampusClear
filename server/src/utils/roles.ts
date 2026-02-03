export const Role = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof Role)[keyof typeof Role];

export function normalizeRole(role?: string): UserRole | null {
  if (!role) return null;
  const normalized = role.toUpperCase();
  if (normalized === Role.STUDENT || normalized === Role.FACULTY || normalized === Role.ADMIN) {
    return normalized as UserRole;
  }
  return null;
}
