import { redirect } from "next/navigation";

export default function AdminDoctorSchedulesRedirect() {
  redirect("/admin/clinic-schedules");
}
