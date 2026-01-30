import {
  ArrowUpRight,
  CalendarClock,
  Mail,
  MessageSquare,
  Stethoscope,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { cn } from "@/lib/utils";
import { homePath } from "@/paths";

const highlightCards = [
  {
    title: "Appointments today",
    value: "12",
    meta: "3 pending confirmations",
    icon: CalendarClock,
  },
  {
    title: "New client registrations",
    value: "24",
    meta: "Last 7 days",
    icon: Users,
  },
  {
    title: "Unread messages",
    value: "7",
    meta: "Needs response",
    icon: MessageSquare,
  },
  {
    title: "On-call specialists",
    value: "5",
    meta: "Available today",
    icon: Stethoscope,
  },
];

const activityFeed = [
  {
    title: "New appointment booked",
    detail: "Adaeze Okoro · Cardiology · 10:30 AM",
  },
  {
    title: "Message received",
    detail: "Client asked about pediatric schedule.",
  },
  {
    title: "Clinic schedule updated",
    detail: "ENT clinic now open on Saturdays.",
  },
  {
    title: "New campaign drafted",
    detail: "Heart health awareness for July.",
  },
];

const upcomingAppointments = [
  {
    name: "Olumide Ajayi",
    clinic: "General Clinic",
    time: "9:00 AM",
    status: "Confirmed",
  },
  {
    name: "Chidinma Okocha",
    clinic: "Optometry",
    time: "11:00 AM",
    status: "Pending",
  },
  {
    name: "Kingsley Nnaji",
    clinic: "Cardiology",
    time: "1:30 PM",
    status: "Confirmed",
  },
];

const statusPillStyles = (status: string) =>
  cn(
    "rounded-full px-3 py-1 text-xs font-semibold",
    status === "Confirmed"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
      : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
  );

export default async function AdminDashboardPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, Admin.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Here is a quick snapshot of clinic activity, appointments, and
            patient engagement for Datima Specialist Clinics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700">
            Book appointment
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Export summary
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-600/10 p-2 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                  +6%
                </span>
              </div>
              <div className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {card.title}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {card.meta}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Upcoming appointments
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Next visits scheduled for today.
              </p>
            </div>
            <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700">
              View schedule
            </Button>
          </div>
          <div className="mt-6 grid gap-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {appointment.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {appointment.clinic}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {appointment.time}
                </div>
                <span className={statusPillStyles(appointment.status)}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Clinic inbox
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest communication from clients.
            </p>
            <div className="mt-5 grid gap-4 text-sm">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <Mail className="mt-0.5 h-4 w-4 text-blue-600" aria-hidden />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Appointment reschedule request
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    "Can I shift my appointment to Friday afternoon?"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <Mail className="mt-0.5 h-4 w-4 text-blue-600" aria-hidden />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    New patient inquiry
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    "What are the available ENT clinic slots?"
                  </p>
                </div>
              </div>
            </div>
            <Button className="mt-5 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700">
              Go to inbox
            </Button>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Activity feed
              </h2>
              <ArrowUpRight className="h-4 w-4 text-slate-400" aria-hidden />
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              {activityFeed.map((activity) => (
                <div
                  key={activity.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activity.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
