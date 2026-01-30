import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { TestimonialsTable } from "@/features/testimonials/components/testimonials-table";
import { getTestimonials } from "@/features/testimonials/queries/get-testimonials";
import { homePath } from "@/paths";
import { prisma } from "@/lib/prisma";

export default async function AdminTestimonialsPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const [testimonials, clients] = await Promise.all([
    getTestimonials(),
    prisma.client.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <TestimonialsTable
      initialTestimonials={testimonials}
      clients={clients}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
