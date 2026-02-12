import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { ClinicSchedulesTable } from "@/features/clinic-schedules/components/clinic-schedules-table";
import { getClinicSchedules } from "@/features/clinic-schedules/queries/get-clinic-schedules";
import { homePath } from "@/paths";
import { prisma } from "@/lib/prisma";

export default async function AdminClinicSchedulesPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const [schedules, doctors, clinics] = await Promise.all([
    getClinicSchedules(),
    prisma.doctor.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.clinic.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        operatingTimes: {
          select: {
            openDay: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    }),
  ]);

  return (
    <ClinicSchedulesTable
      initialSchedules={schedules}
      doctors={doctors}
      clinics={clinics}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
