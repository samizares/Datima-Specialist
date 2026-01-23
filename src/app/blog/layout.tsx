import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

import { StaticPageHero } from "@/components/static-page-hero";
import {
  categories,
  formatDisplayDate,
  popularTags,
  posts,
} from "@/features/blog/content";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-background">
      <StaticPageHero title="Blog" imagePosition="50% 15%" />
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">{children}</div>

        <aside className="space-y-8">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Search</h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="search..."
                className="h-11 w-full rounded-md border border-input bg-background px-10 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Categories:</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {categories.map((category) => (
                <div key={category.label} className="flex items-center justify-between">
                  <span>{category.label}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Recent Posts</h2>
            <div className="mt-4 space-y-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="flex items-center gap-3">
                  <div className="relative h-14 w-16 overflow-hidden rounded-md">
                    <Image src={post.image} alt={post.title} fill sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDisplayDate(post.createdAt, post.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Popular Tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
