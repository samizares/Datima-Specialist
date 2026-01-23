import { AppointmentBookForm } from "@/features/appointment/components/appointment-book-form";
import { prisma } from "@/lib/prisma";

export default async function AppointmentPage() {
  const [clinics, doctors] = await Promise.all([
    prisma.clinic.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.doctor.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-24">
        <div className="rounded-3xl border bg-white p-8 shadow-xl">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Appointment
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-foreground sm:text-4xl">
              Book an appointment
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Provide your details below so we can save your profile before booking your appointment.
            </p>
          </div>

          <div className="mt-8">
            <AppointmentBookForm clinics={clinics} doctors={doctors} />
          </div>
        </div>
      </section>
    </main>
  );
}
