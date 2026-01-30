import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { ClinicsTable } from "@/features/clinics/components/clinics-table";
import { getClinics } from "@/features/clinics/queries/get-clinics";
import { homePath } from "@/paths";

export default async function AdminClinicsPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const clinics = await getClinics();

  return (
    <ClinicsTable
      initialClinics={clinics}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
