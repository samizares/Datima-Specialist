import Image from "next/image";
import { notFound } from "next/navigation";

import { formatDisplayDate, posts } from "@/features/blog/content";

type BlogPostPageProps = {
  params: Promise<{ blogId: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { blogId } = await params;
  const post = posts.find((item) => item.id === blogId);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="relative h-64 w-full overflow-hidden rounded-xl sm:h-80">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {post.tags.join(" • ")} • {formatDisplayDate(post.createdAt, post.updatedAt)}
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-foreground sm:text-4xl">
        {post.title}
      </h1>
      <p className="text-muted-foreground">{post.content}</p>
    </article>
  );
}
