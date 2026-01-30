import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { DoctorSchedulesTable } from "@/features/doctor-schedules/components/doctor-schedules-table";
import { getDoctorSchedules } from "@/features/doctor-schedules/queries/get-doctor-schedules";
import { homePath } from "@/paths";
import { prisma } from "@/lib/prisma";

export default async function AdminDoctorSchedulesPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const [schedules, doctors, clinics] = await Promise.all([
    getDoctorSchedules(),
    prisma.doctor.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.clinic.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <DoctorSchedulesTable
      initialSchedules={schedules}
      doctors={doctors}
      clinics={clinics}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
