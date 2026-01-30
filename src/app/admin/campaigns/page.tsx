import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { CampaignsTable } from "@/features/campaigns/components/campaigns-table";
import { getCampaigns } from "@/features/campaigns/queries/get-campaigns";
import { homePath } from "@/paths";

export default async function AdminCampaignsPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const campaigns = await getCampaigns();

  return (
    <CampaignsTable
      initialCampaigns={campaigns}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
