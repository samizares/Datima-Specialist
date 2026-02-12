import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { AdminCalendar } from "@/features/appointments/components/admin-calendar";
import { homePath } from "@/paths";
import { prisma } from "@/lib/prisma";

export default async function AdminAppointmentsPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const [clients, clinics, doctors] = await Promise.all([
    prisma.client.findMany({
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
    prisma.doctor.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <AdminCalendar
        clients={clients}
        clinics={clinics}
        doctors={doctors}
        canEdit={isAdmin(user) || isSuperAdmin(user)}
        canDelete={isSuperAdmin(user)}
      />
    </div>
  );
}
