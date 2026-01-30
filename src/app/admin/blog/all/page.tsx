import { redirect } from "next/navigation";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { BlogPostsTable } from "@/features/blog/components/blog-posts-table";
import { getBlogPosts } from "@/features/blog/queries/get-blog-posts";
import { homePath } from "@/paths";

export default async function AdminBlogAllPage() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    redirect(homePath());
  }

  const posts = await getBlogPosts();

  return (
    <BlogPostsTable
      initialPosts={posts}
      canEdit={isAdmin(user) || isSuperAdmin(user)}
      canDelete={isSuperAdmin(user)}
    />
  );
}
