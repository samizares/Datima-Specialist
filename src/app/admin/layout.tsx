import { AdminShell } from "./_components/admin-shell";
import { AdminToaster } from "./_components/admin-toaster";
import { AdminThemeProvider } from "./_components/admin-theme-provider";
import { getAuth } from "@/features/auth/queries/get-auth";
import { redirect } from "next/navigation";
import { signInPath } from "@/paths";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { user } = await getAuth();

  // if (!user) {
  //   redirect(signInPath());
  // }
  return (
    <AdminThemeProvider>
      <AdminShell>{children}</AdminShell>
      <AdminToaster />
    </AdminThemeProvider>
  );
}
