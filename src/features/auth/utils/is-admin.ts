import { User } from "@prisma/client";

export const isAdmin = (authUser: (User & { isAdmin?: boolean }) | null | undefined) => {
  return Boolean(authUser?.isAdmin);
};
