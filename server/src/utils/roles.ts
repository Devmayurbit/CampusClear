export const Role = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = (typeof Role)[keyof typeof Role];

export function normalizeRole(role?: string): UserRole | null {
  if (!role) return null;
  const normalized = role.toUpperCase() === "HOD" ? Role.SUPER_ADMIN : role.toUpperCase();
  if (
    normalized === Role.STUDENT ||
    normalized === Role.FACULTY ||
    normalized === Role.ADMIN ||
    normalized === Role.SUPER_ADMIN
  ) {
    return normalized as UserRole;
  }
  return null;
}
