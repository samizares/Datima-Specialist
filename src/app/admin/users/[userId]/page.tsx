import { notFound, redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { UserProfileCard } from "@/features/users/components/user-profile-card";
import { getUser } from "@/features/users/queries/get-user";
import { homePath } from "@/paths";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const { userId } = await params;
  const profile = await getUser(userId);
  if (!profile) {
    notFound();
  }

  return (
    <UserProfileCard
      user={profile}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canAssignRoles={isSuperAdmin(user)}
    />
  );
}
