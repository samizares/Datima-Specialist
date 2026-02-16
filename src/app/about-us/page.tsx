import Image from "next/image";
import type { Metadata } from "next";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StaticPageHero } from "@/components/static-page-hero";
import { aboutHighlights } from "@/features/about/content";

export const metadata: Metadata = {
  title: "About Datima Specialist Clinics",
  description:
    "Meet Datima Specialist Clinics and the team delivering compassionate, patient-centered care with modern diagnostics and coordinated specialists.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "About Datima Specialist Clinics",
    description:
      "Meet Datima Specialist Clinics and the team delivering compassionate, patient-centered care with modern diagnostics and coordinated specialists.",
    url: "/about-us",
    siteName: "Datima Specialist Clinics",
    images: [
      {
        url: "/assets/intro.jpg",
        alt: "Datima Specialist Clinics care team",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Datima Specialist Clinics",
    description:
      "Meet Datima Specialist Clinics and the team delivering compassionate, patient-centered care with modern diagnostics and coordinated specialists.",
    images: ["/assets/intro.jpg"],
  },
};

export default function AboutUsPage() {
  return (
    <main className="bg-background">
      <section id="about-hero">
        <StaticPageHero title="About Us" imagePosition="50% 15%" />
      </section>
      <section id="about-content" className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <section id="about-intro" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary dark:text-white">Datima Specialist Clinics</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl dark:text-white">
            Professional, compassionate care you can trust.
          </h2>
          <p className="text-muted-foreground dark:text-white">
            Datima Specialist Clinics is a patient-centered healthcare facility committed to delivering top-notch medical
            services in a warm, professional, and compassionate environment.
          </p>
        </section>
        <section id="about-details" className="space-y-6">
          {aboutHighlights.map((highlight) => (
            <Card key={highlight.title} className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
              <CardHeader className="p-6">
                <div className="flex flex-col gap-8 md:flex-row md:items-center">
                  <div className="relative h-56 w-full overflow-hidden rounded-2xl md:h-56 md:w-[320px] md:shrink-0">
                    <Image
                      src={highlight.image}
                      alt={highlight.alt}
                      fill
                      sizes="(min-width: 768px) 320px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3 md:pr-6">
                    <CardTitle className="text-xl leading-tight dark:text-black">{highlight.title}</CardTitle>
                    <p className="text-sm text-muted-foreground dark:text-black">{highlight.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>
      </section>
    </main>
  );
}
