import { User } from "@prisma/client";

export const isSuperAdmin = (
  authUser: (User & { isSuperAdmin?: boolean }) | null | undefined
) => {
  return Boolean(authUser?.isSuperAdmin);
};
