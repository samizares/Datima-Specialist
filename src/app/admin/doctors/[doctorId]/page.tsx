import { notFound, redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { DoctorProfileCard } from "@/features/doctors/components/doctor-profile-card";
import { getDoctor } from "@/features/doctors/queries/get-doctor";
import { homePath } from "@/paths";

export default async function AdminDoctorProfilePage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const { doctorId } = await params;
  const doctor = await getDoctor(doctorId);
  if (!doctor) {
    notFound();
  }

  return (
    <DoctorProfileCard
      doctor={doctor}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
    />
  );
}
