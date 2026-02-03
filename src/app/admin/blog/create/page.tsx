import { redirect } from "next/navigation";

import { BlogComposeForm } from "@/features/blog/components/blog-compose-form";
import { getBlogPostById } from "@/features/blog/queries/get-blog-post";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { homePath } from "@/paths";

export default async function AdminBlogCreatePage({
  searchParams,
}: {
  searchParams?: Promise<{ postId?: string }>;
}) {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const postId = resolvedSearchParams?.postId;
  const initialPost = postId ? await getBlogPostById(postId) : null;

  return (
    <BlogComposeForm
      author={{
        id: user.id,
        username: user.username,
        email: user.email,
      }}
      initialPost={initialPost}
    />
  );
}
