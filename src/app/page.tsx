import clsx from "clsx";
import Image from "next/image";
import { Suspense } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { AppointmentForm } from "@/components/appointment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeGallery } from "@/components/home-gallery";
import { ContactSection } from "@/components/contact-section";
import { aboutHighlights } from "@/features/about/content";
import { serviceLines } from "@/features/services/content";
import { formatDisplayDate, posts as blogPosts } from "@/features/blog/content";
import { prisma } from "@/lib/prisma";

// serviceLines moved to shared content file.

const badgeStyles = () =>
  clsx(
    "rounded-full px-3 py-1 text-xs font-semibold border border-border/70 bg-[#e5f6fb] text-foreground"
  );

export default async function Home() {
  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="bg-background">
      <section id="home-gallery">
        <HomeGallery />
      </section>

      <section id="intro" className="mx-auto w-full max-w-[1425px] px-6 py-12">
        <div className="grid items-stretch gap-20 rounded-[28px] bg-white p-6 text-foreground shadow-xl dark:text-black lg:grid-cols-[1fr_1.1fr] lg:p-10">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl">
            <Image
              src="/assets/ge-healthcare-lady.png"
              alt="Patient smiling at Datima Specialist Clinics"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col justify-center gap-5">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-black leading-tight sm:text-4xl dark:text-black">
              Welcome to Datima Specialist Clinics
            </h2>
            <p className="text-base text-muted-foreground dark:text-black">
              Datima Specialist Clinics is a patient-centered healthcare facility committed to delivering top-notch
              medical services in a warm, professional, and compassionate environment.
            </p>
            <p className="text-lg font-semibold text-foreground dark:text-black">Why Choose Datima?</p>

            <ul className="space-y-3 text-sm text-foreground sm:text-base dark:text-black">
              {[
                "Datima Specialist Clinics is home to renowned specialists in diverse medical fields.",
                "Datima Specilists clinics is equipped with state-of-the-art medical equipment.",
                "We combine advanced technology with proven medical expertise.",
                "Our multidisciplinary team delivers personalized care.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-700" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div>
              <Button asChild className="mt-2 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-400 gap-2">
                <a href="/appointment">
                  Book An Appointment Now
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="home-content" className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80" aria-hidden>
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-10 left-12 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-[1425px] flex-col gap-24 px-6 pb-16 pt-16 lg:pt-20 lg:pb-20">
          <section id="about" className="space-y-6 dark:text-black">
            <div className="flex flex-col gap-2">
              <p className="pl-8 text-center text-base font-semibold uppercase tracking-[0.28em] text-primary dark:text-white">
                About us
              </p>
              <h2 className="pl-8 text-center font-[family-name:var(--font-display)] text-4xl text-foreground sm:text-5xl dark:text-white">
                Professional, compassionate care you can trust.
              </h2>
            </div>
            <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-border/70">
              <div className="grid gap-6 md:grid-cols-2">
                {aboutHighlights.map((highlight) => (
                  <Card key={highlight.title} className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
                    <CardHeader className="space-y-3">
                      <div className="relative h-64 w-full overflow-hidden rounded-xl">
                        <Image
                          src={highlight.image}
                          alt={highlight.alt}
                          fill
                          sizes="(min-width: 768px) 40vw, 90vw"
                          className="object-cover object-top"
                        />
                      </div>
                      <CardTitle className="text-lg leading-tight dark:text-black">
                        {highlight.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground dark:text-black">
                        {highlight.description}
                      </p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Button asChild className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700">
                  <a href="/about-us">Read More</a>
                </Button>
              </div>
            </div>
          </section>

          <section id="services" className="space-y-6 dark:text-black">
            <div className="flex flex-col gap-2">
              <p className="pl-8 text-center text-base font-semibold uppercase tracking-[0.28em] text-primary dark:text-white">
                Our services
              </p>
              <h3 className="pl-8 text-center font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl dark:text-white">
                Comprehensive care across diverse medical fields.
              </h3>
              
            </div>
            <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-border/70">
              <div className="grid gap-6 md:grid-cols-2">
                {serviceLines.slice(0, 4).map((service) => (
                  <Card key={service.title} className="border border-border/70 bg-white/95 p-6 shadow-sm">
                    <div className="flex gap-4">
                      <div className="relative h-32 w-[150px] shrink-0 overflow-hidden rounded-2xl bg-secondary/60">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="85px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-bold dark:text-black">{service.title}</CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-black">{service.description}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <span className={clsx(badgeStyles(), "text-black")}>{service.schedule}</span>
                      <Button asChild className="gap-2 font-bold bg-[#283a6a] text-white hover:bg-[#1f2f59]">
                        <a href={`/our-services?service=${encodeURIComponent(service.title)}#services-booking`}>
                          Book Appointment
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Button asChild className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700">
                  <a href="/our-services">Read More</a>
                </Button>
              </div>
            </div>
          </section>

          <section id="blog" className="space-y-6 dark:text-black">
            <div className="flex flex-col gap-2">
              <p className="pl-8 text-center text-base font-semibold uppercase tracking-[0.28em] text-primary dark:text-white">
                Blog
              </p>
              <h3 className="pl-8 text-center font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl dark:text-white">
                Latest stories from Datima Specialist Clinics.
              </h3>
            </div>
            <div className="grid gap-6 pl-8 md:grid-cols-3">
              {blogPosts.slice(0, 3).map((post, index) => (
                <article key={post.id} className="rounded-2xl border bg-white shadow-sm">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground dark:text-black">
                      {post.tags[0]} • {formatDisplayDate(post.createdAt, post.updatedAt)}
                    </div>
                    <h4 className="text-xl font-bold text-foreground dark:text-black">{post.title}</h4>
                    <a
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary dark:text-black"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <ContactSection />

          <section id="booking" className="grid gap-8 lg:grid-cols-[1fr_0.9fr] dark:text-black">
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-white/70 shadow-lg">
              <Image
                src="/assets/slit-lamp-biomicroscope.png"
                alt="Slit lamp biomicroscope at Datima Specialist Clinics"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>

            <Suspense
              fallback={
                <div className="rounded-2xl border bg-card/80 p-6 text-sm text-muted-foreground shadow-sm">
                  Loading booking form…
                </div>
              }
            >
              <AppointmentForm clinics={clinics} />
            </Suspense>
          </section>
        </div>
      </section>
    </main>
  );
}
