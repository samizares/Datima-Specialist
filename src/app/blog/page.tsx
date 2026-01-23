import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDisplayDate, formatSummary, posts } from "@/features/blog/content";

export default function BlogPage() {
  return (
    <>
      {posts.map((post, index) => (
        <article key={post.id} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="relative h-64 w-full overflow-hidden rounded-xl">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {post.tags.join(" • ")} • {formatDisplayDate(post.createdAt, post.updatedAt)}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="text-muted-foreground">{formatSummary(post.content)}</p>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href={`/blog/${post.id}`}>Read more</Link>
          </Button>
        </article>
      ))}
    </>
  );
}
