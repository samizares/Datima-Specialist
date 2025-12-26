import Image from "next/image";
import clsx from "clsx";
import {
  ArrowRight,
  MapPin,
  PhoneCall,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { AppointmentForm } from "@/components/appointment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeGallery } from "@/components/home-gallery";

const serviceLines = [
  {
    title: "General Medical/Dental Clinics",
    description:
      "Routine medical consultations. Diagnosis and treatment of common illnesses. Preventive care and health screenings. Chronic disease management. Comprehensive oral health services, including: General Dentistry. Oral & Maxillofacial Surgery. Restorative Dentistry. Orthodontics. Preventive and cosmetic dental care.",
    schedule: "Mon: 8am - Saturday 9pm",
  },
  {
    title: "Cardiology",
    description: "Hypertension, heart related diseases.",
    schedule: "Wednesday: 12 noon - 5pm",
  },
  {
    title: "ENT (Ear, Nose and Throat)",
    description: "Ear, nose and throat conditions.",
    schedule: "Saturday: 10am - 2pm",
  },
  {
    title: "Obstetrics & Gynaecology",
    description: "Pregnancy, infertility, fibroid, endometriosis, and more.",
    schedule: "Sunday: 10am - 2pm",
  },
  {
    title: "Endocrinology",
    description: "Diabetes, thyroid diseases, and related conditions.",
    schedule: "Sunday: 2pm - 6pm",
  },
  {
    title: "Paediatrics (Children Clinic)",
    description: "Children clinic services.",
    schedule: "Friday: 10am - 2pm",
  },
  {
    title: "Oral and Maxillofacial",
    description: "Oral and maxillofacial care.",
    schedule: "Sunday: 2pm - 6pm",
  },
  {
    title: "Restorative Dental",
    description: "Restorative dental care.",
    schedule: "Tuesday: 2pm - 6pm",
  },
  {
    title: "Orthodontics",
    description: "Orthodontic treatments and alignment care.",
    schedule: "Tuesday: 10am - 2pm",
  },
  {
    title: "Optometry/Eye Tests/Glasses",
    description:
      "Comprehensive eye examinations. Ophthalmology services. Cataract evaluation and surgery. Glaucoma diagnosis and treatment. Vision correction and eye disease management.",
    schedule: "Monday-Saturday: 8am - 5pm",
  },
  {
    title: "Laboratory Services",
    description: "Routine blood and urine tests. Reliable and timely diagnostic testing.",
    schedule: "Monday - Saturday: 8am - 2pm. Sunday: 2pm - 6pm",
  },
];

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Our Services", href: "#services" },
  { label: "Contact Us", href: "#contact" },
  { label: "Book An Appointment", href: "#booking" },
];
const badgeStyles = (label: string) =>
  clsx("rounded-full px-3 py-1 text-xs font-semibold bg-secondary text-foreground", {
    "bg-emerald-100 text-emerald-800": label.toLowerCase().includes("state"),
    "bg-amber-100 text-amber-800": label.toLowerCase().includes("appointment"),
    "bg-sky-100 text-sky-800": label.toLowerCase().includes("specialist"),
  });

export default function Home() {
  return (
    <main className="bg-background">
      <header className="fixed left-0 right-0 top-0 z-50 w-full bg-white/80 px-6 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 py-4 lg:py-5">
          <a href="#home" className="flex items-center gap-0 sm:gap-0.5">
            <div className="relative h-10 w-28 sm:w-32">
              <Image
                src="/assets/Datima-enhance-logo.png"
                alt="Datima Specialist Clinics logo"
                fill
                sizes="144px"
                className="object-contain"
                priority
              />
            </div>
            <span className="whitespace-nowrap font-[family-name:var(--font-display)] text-xl font-black leading-none tracking-tight text-foreground sm:text-2xl">
              Datima Specialist Clinics
            </span>
          </a>
          <nav className="flex flex-1 items-center justify-end gap-4 text-sm font-semibold text-foreground">
            {navItems.map((item) => {
              const isCTA = item.label === "Book An Appointment";
              if (isCTA) {
                return (
                  <Button key={item.label} asChild size="sm" className="gap-2">
                    <a href={item.href}>
                      {item.label}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full px-3 py-2 transition hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <HomeGallery />

      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80" aria-hidden>
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-10 left-12 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-12 pt-12 lg:pt-16 lg:pb-16">
          <section id="home" className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Datima Specialist Clinics</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Patient-centered care in Lagos
                </Badge>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Compassionate, professional, and trusted
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Your health and well-being come first.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Datima Specialist Clinics is a patient-centered healthcare facility committed to delivering top-notch medical services in a warm, professional, and compassionate environment.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="gap-2">
                  <a href="#booking">
                    Book an appointment
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
                <Button variant="outline" asChild className="gap-2 border-primary/30 text-primary">
                  <a href="#services">View our services</a>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "State-of-the-art equipment",
                  "Renowned specialists",
                  "Personalized, evidence-based care",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-3 text-sm shadow-sm backdrop-blur"
                  >
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                    <span className="font-semibold text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-primary/20 bg-white/80 shadow-lg backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">Clinic promise</CardTitle>
                  <p className="text-sm text-muted-foreground">Professional, trusted, and compassionate care</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800" variant="secondary">
                  Patient-centered
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border bg-secondary/50 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <Stethoscope className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">
                        We combine advanced technology with proven medical expertise.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        From routine consultations to specialized care, we focus on accurate diagnosis, effective treatment, and excellent clinical outcomes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border bg-secondary/50 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">
                        Our multidisciplinary team delivers personalized care.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Specialists across general medicine, cardiology, paediatrics, obstetrics and gynaecology, dental care, eye care, radiology, and laboratory services work together for each patient.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="about" className="space-y-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About us</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
                Professional, compassionate care you can trust.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg leading-tight">
                    Datima Specialist Clinics is a patient-centered healthcare facility.
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    We are committed to delivering top-notch medical services in a warm, professional, and compassionate environment.
                  </p>
                </CardHeader>
              </Card>
              <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg leading-tight">
                    Your health and well-being come first.
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    We are driven by professionalism, integrity, and a commitment to excellence — because you deserve care you can trust.
                  </p>
                </CardHeader>
              </Card>
              <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg leading-tight">State-of-the-art medical equipment.</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Accurate diagnosis, effective treatment, and excellent clinical outcomes across all our services.
                  </p>
                </CardHeader>
              </Card>
              <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg leading-tight">Renowned specialists across diverse fields.</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    General medicine, cardiology, paediatrics, obstetrics and gynaecology, dental care, eye care, radiology, laboratory services, and more.
                  </p>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section id="services" className="space-y-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Our services</p>
              <h3 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
                Comprehensive care across diverse medical fields.
              </h3>
              <p className="max-w-3xl text-muted-foreground">
                Datima Specialist Clinics offers a wide range of medical services delivered by experienced and dedicated specialists. Our services are provided on specific days and at scheduled times to ensure optimal care and specialist availability.
              </p>
              <p className="max-w-3xl text-muted-foreground">
                To help us serve you better and reduce waiting time, we kindly encourage all patients to book an appointment in advance to see one of our specialists.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {serviceLines.map((service) => (
                <Card key={service.title} className="border-0 bg-white/90 shadow-md ring-1 ring-border/60">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <span className={badgeStyles(service.schedule)}>{service.schedule}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="contact" className="space-y-6 rounded-2xl border bg-white/85 p-6 shadow-lg ring-1 ring-border/70">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
              <h3 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
                Contact Datima Specialist Clinics.
              </h3>
              <p className="max-w-3xl text-muted-foreground">
                If you have any questions, any feedback or you just want to contact us, please visit us at the address below:
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-0 bg-secondary/50 shadow-sm ring-1 ring-border/70">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">Call</CardTitle>
                  </div>
                  <p className="text-sm text-foreground">+234 9157360689</p>
                  <p className="text-sm text-foreground">+234 9093933524</p>
                </CardHeader>
              </Card>
              <Card className="border-0 bg-secondary/50 shadow-sm ring-1 ring-border/70">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base">Email</CardTitle>
                  <p className="text-sm text-foreground">care@datimaspecialistclinics.com</p>
                  <p className="text-sm text-foreground">admin@datimaspecialistclinics.com</p>
                </CardHeader>
              </Card>
              <Card className="border-0 bg-secondary/50 shadow-sm ring-1 ring-border/70">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">Visit</CardTitle>
                  </div>
                  <p className="text-sm text-foreground">1, Fola Agoro Street</p>
                  <p className="text-sm text-foreground">Off Bajulaye Road, Somulu, Lagos.</p>
                </CardHeader>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this address, phone numbers and email address for all fliers, info and bronchures of Datima Specialist Clinics.
            </p>
          </section>

          <section id="booking" className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Book a visit</p>
              <h3 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
                Book an appointment in advance.
              </h3>
              <p className="max-w-2xl text-muted-foreground">
                To help us serve you better and reduce waiting time, we kindly encourage all patients to book an appointment in advance to see one of our specialists.
              </p>
            </div>

            <AppointmentForm />
          </section>
        </div>
      </div>
    </main>
  );
}
