import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { DoctorsTable } from "@/features/doctors/components/doctors-table";
import { getDoctors } from "@/features/doctors/queries/get-doctors";
import { homePath } from "@/paths";
import { prisma } from "@/lib/prisma";

export default async function AdminDoctorsPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const [doctors, clinics] = await Promise.all([
    getDoctors(),
    prisma.clinic.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <DoctorsTable
      initialDoctors={doctors}
      clinicOptions={clinics}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
