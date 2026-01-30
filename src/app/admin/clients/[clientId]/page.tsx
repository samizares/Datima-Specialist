import { notFound, redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { ClientProfileCard } from "@/features/clients/components/client-profile-card";
import { getClient } from "@/features/clients/queries/get-client";
import { homePath } from "@/paths";

export default async function AdminClientProfilePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) {
    notFound();
  }

  return (
    <ClientProfileCard
      client={client}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
    />
  );
}
