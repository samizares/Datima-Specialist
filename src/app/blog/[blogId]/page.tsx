import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { formatDisplayDate, formatSummary, posts } from "@/features/blog/content";

type BlogPostPageProps = {
  params: Promise<{ blogId: string }>;
};

const trimToLength = (value: string, max: number) => {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, Math.max(0, max - 3)).trimEnd()}...`;
};

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const { blogId } = await params;
  const post = posts.find((item) => item.id === blogId);

  if (!post) {
    notFound();
  }

  const description = trimToLength(formatSummary(post.content, 40), 200);
  const title = trimToLength(post.title, 70);

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/blog/${post.id}`,
      siteName: "Datima Specialist Clinics",
      images: [
        {
          url: post.image,
          alt: post.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.image],
    },
  };
}

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
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-foreground text-black sm:text-4xl">
        {post.title}
      </h1>
      <p className="text-muted-foreground text-black">{post.content}</p>
    </article>
  );
}
