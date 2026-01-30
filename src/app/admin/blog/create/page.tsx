import { redirect } from "next/navigation";

import { BlogComposeForm } from "@/features/blog/components/blog-compose-form";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { homePath } from "@/paths";

export default async function AdminBlogCreatePage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  return (
    <BlogComposeForm
      author={{
        id: user.id,
        username: user.username,
        email: user.email,
      }}
    />
  );
}
