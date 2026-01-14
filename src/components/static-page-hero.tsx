import Image from "next/image";
import Link from "next/link";

import { homePath } from "@/paths";

type StaticPageHeroProps = {
  title: string;
  imagePosition?: string;
};

export function StaticPageHero({ title, imagePosition = "50% 20%" }: StaticPageHeroProps) {
  return (
    <section className="relative mt-[86px] h-[280px] w-full overflow-hidden sm:h-[340px] lg:h-[320px]">
      <Image
        src="/assets/hero-fuse2.png"
        alt={`${title} hero`}
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: imagePosition }}
        priority
      />
      <div className="absolute inset-0 bg-slate-650/55" aria-hidden />
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center text-white">
        <div className="space-y-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="text-sm font-medium text-white/90 sm:text-base">
            <Link href={homePath()} className="font-semibold text-white hover:underline">
              Home
            </Link>{" "}
            &gt; {title}
          </p>
        </div>
      </div>
    </section>
  );
}
