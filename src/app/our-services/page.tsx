import clsx from "clsx";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import type { Metadata } from "next";

import { AppointmentForm } from "@/components/appointment-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StaticPageHero } from "@/components/static-page-hero";
import { serviceLines } from "@/features/services/content";
import { prisma } from "@/lib/prisma";

const badgeStyles = () =>
  clsx(
    "rounded-full px-3 py-1 text-xs font-semibold border border-border/70 bg-[#e5f6fb] text-black"
  );

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Datima Specialist Clinics services across dental, eye care, pediatrics, diagnostics, and specialist consultations with easy appointment scheduling.",
  alternates: {
    canonical: "/our-services",
  },
  openGraph: {
    title: "Our Services",
    description:
      "Explore Datima Specialist Clinics services across dental, eye care, pediatrics, diagnostics, and specialist consultations with easy appointment scheduling.",
    url: "/our-services",
    siteName: "Datima Specialist Clinics",
    images: [
      {
        url: "/assets/services-card.jpg",
        alt: "Datima Specialist Clinics services",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Services",
    description:
      "Explore Datima Specialist Clinics services across dental, eye care, pediatrics, diagnostics, and specialist consultations with easy appointment scheduling.",
    images: ["/assets/services-card.jpg"],
  },
};

export default async function OurServicesPage() {
  const clinics = await prisma.clinic.findMany({
    where: { operatingTimes: { some: {} } },
    select: {
      id: true,
      name: true,
      operatingTimes: {
        select: {
          openDay: true,
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="bg-background">
      <section id="services-hero">
        <StaticPageHero title="Our Services" imagePosition="50% 15%" />
      </section>
      <section id="services-content" className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <section id="services-intro" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Our services</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
            Comprehensive care across diverse medical fields.
          </h2>
          <p className="max-w-3xl text-muted-foreground">
            Datima Specialist Clinics offers a wide range of medical services delivered by experienced and dedicated
            specialists. Our services are provided on specific days and at scheduled times to ensure optimal care and
            specialist availability.
          </p>
          <p className="max-w-3xl text-muted-foreground">
            To help us serve you better and reduce waiting time, we kindly encourage all patients to book an appointment
            in advance to see one of our specialists.
          </p>
        </section>
        <section id="services-grid" className="grid gap-4 md:grid-cols-2">
          {serviceLines.map((service) => (
            <Card key={service.title} className="border border-border/70 bg-white/95 p-6 shadow-sm">
              <div className="after:block after:clear-both after:content-['']">
                <div className="relative float-left mb-4 mr-6 h-32 w-[150px] overflow-hidden rounded-2xl bg-secondary/60">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground dark:text-black">{service.title}</h3>
                  <p className="text-sm text-muted-foreground dark:text-black">{service.description}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <span className={badgeStyles()}>
                  {service.schedule}
                </span>
                <Button asChild className="gap-2 font-bold bg-[#283a6a] text-white hover:bg-[#1f2f59]">
                  <a href={`/our-services?service=${encodeURIComponent(service.title)}#services-booking`}>
                    Book Appointment
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </section>
      </section>
      <section id="services-booking" className="mx-auto w-full max-w-4xl px-6 pb-16">
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
    </main>
  );
}
