import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { UsersTable } from "@/features/users/components/users-table";
import { getUsers } from "@/features/users/queries/get-users";
import { homePath } from "@/paths";

export default async function AdminUsersPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const users = await getUsers();

  return (
    <UsersTable
      initialUsers={users}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
      canAssignRoles={isSuperAdmin(user)}
    />
  );
}
