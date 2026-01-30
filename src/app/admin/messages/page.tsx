import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { MessagesTable } from "@/features/messages/components/messages-table";
import { getMessages } from "@/features/messages/queries/get-messages";
import { homePath } from "@/paths";
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const [messages, clients] = await Promise.all([
    getMessages(),
    prisma.client.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <MessagesTable
      initialMessages={messages}
      clientOptions={clients}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
