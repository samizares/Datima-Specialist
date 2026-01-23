import clsx from "clsx";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

import { AppointmentForm } from "@/components/appointment-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StaticPageHero } from "@/components/static-page-hero";

const serviceLines = [
  {
    title: "General Medical/Dental Clinics",
    description:
      "Routine medical consultations. Diagnosis and treatment of common illnesses. Preventive care and health screenings. Chronic disease management. Comprehensive oral health services, including: General Dentistry. Oral & Maxillofacial Surgery. Restorative Dentistry. Orthodontics. Preventive and cosmetic dental care.",
    schedule: "Mon: 8am - Saturday 9pm",
    image: "/assets/intro.jpg",
  },
  {
    title: "Cardiology",
    description: "Hypertension, heart related diseases.",
    schedule: "Wednesday: 12 noon - 5pm",
    image: "/assets/hero-fuse.png",
  },
  {
    title: "ENT (Ear, Nose and Throat)",
    description: "Ear, nose and throat conditions.",
    schedule: "Saturday: 10am - 2pm",
    image: "/assets/hero-fuse2.png",
  },
  {
    title: "Obstetrics & Gynaecology",
    description: "Pregnancy, infertility, fibroid, endometriosis, and more.",
    schedule: "Sunday: 10am - 2pm",
    image: "/assets/intro-2.jpg",
  },
  {
    title: "Endocrinology",
    description: "Diabetes, thyroid diseases, and related conditions.",
    schedule: "Sunday: 2pm - 6pm",
    image: "/assets/lab-test.png",
  },
  {
    title: "Paediatrics (Children Clinic)",
    description: "Children clinic services.",
    schedule: "Friday: 10am - 2pm",
    image: "/assets/paedatrics-care.png",
  },
  {
    title: "Oral and Maxillofacial",
    description: "Oral and maxillofacial care.",
    schedule: "Sunday: 2pm - 6pm",
    image: "/assets/dental-xray.png",
  },
  {
    title: "Restorative Dental",
    description: "Restorative dental care.",
    schedule: "Tuesday: 2pm - 6pm",
    image: "/assets/dental-xray-2.png",
  },
  {
    title: "Orthodontics",
    description: "Orthodontic treatments and alignment care.",
    schedule: "Tuesday: 10am - 2pm",
    image: "/assets/dental-xray.png",
  },
  {
    title: "Optometry/Eye Tests/Glasses",
    description:
      "Comprehensive eye examinations. Ophthalmology services. Cataract evaluation and surgery. Glaucoma diagnosis and treatment. Vision correction and eye disease management.",
    schedule: "Monday-Saturday: 8am - 5pm",
    image: "/assets/optometry-care.png",
  },
  {
    title: "Laboratory Services",
    description: "Routine blood and urine tests. Reliable and timely diagnostic testing.",
    schedule: "Monday - Saturday: 8am - 2pm. Sunday: 2pm - 6pm",
    image: "/assets/lab-test.png",
  },
];

const badgeStyles = () =>
  clsx(
    "rounded-full px-3 py-1 text-xs font-semibold border border-border/70 bg-white text-foreground"
  );

export default function OurServicesPage() {
  return (
    <main className="bg-background">
      <StaticPageHero title="Our Services" imagePosition="50% 15%" />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="space-y-3">
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
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {serviceLines.map((service) => (
            <Card key={service.title} className="border border-border/70 bg-white/95 p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="relative h-20 w-[85px] shrink-0 overflow-hidden rounded-2xl bg-secondary/60">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="85px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <span className={badgeStyles()}>
                  {service.schedule}
                </span>
                <Button asChild className="gap-2 font-bold">
                  <a href={`/our-services?service=${encodeURIComponent(service.title)}#booking`}>
                    Book Appointment
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <section id="booking" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border bg-white p-8 shadow-xl">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Book an appointment</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
              Reserve your visit with our specialists.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Share your details and preferred service so we can prepare for your visit.
            </p>
          </div>
          <div className="mt-8">
            <Suspense
              fallback={
                <div className="rounded-2xl border bg-card/80 p-6 text-sm text-muted-foreground shadow-sm">
                  Loading booking form…
                </div>
              }
            >
              <AppointmentForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
