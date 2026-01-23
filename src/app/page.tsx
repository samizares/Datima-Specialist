import clsx from "clsx";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
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
import { formatDisplayDate, posts as blogPosts } from "@/features/blog/content";

const serviceLines = [
  {
    title: "General Medical/Dental Clinics",
    description:
      "Our General and Dental clinic is focused on diagnosis and treatment of common illness, oral health, including the teeth, gums, and jaw. We treats conditions such as tooth decay, gum disease (gingivitis and periodontitis), tooth infections, oral pain, misaligned teeth, impacted wisdom teeth, oral lesions, jaw disorders, and cosmetic dental concerns.",
    schedule: "Mon: 8am - Saturday 9pm",
    image: "/assets/dental.png",
  },
  {
    title: "Cardiology",
    description: "Our Cardiology clinic diagnose, treat, and prevent diseases of the cardiovascular system. We manage conditions such as coronary artery disease, heart attacks, heart failure, arrhythmias (irregular heartbeats), hypertension (high blood pressure), congenital and valvular heart disease. We also address risk factors like high cholesterol, diabetes, obesity, and other heart disease.",
    schedule: "Wednesday: 12 noon - 5pm",
    image: "/assets/cardiology.png",
  },
  {
    title: "ENT (Ear, Nose and Throat)",
    description: "Our ENT clinic treats conditions affecting hearing, balance, breathing, speech, and swallowing. We treat common illnesses like ear infections, hearing loss, sinusitis, allergies, tonsillitis,  and throat or laryngeal disorders.",
    schedule: "Saturday: 10am - 2pm",
    image: "/assets/ENT.png",
  },
  {
    title: "Obstetrics & Gynaecology",
    description: "Our OB-GYN clinic is focused on women’s reproductive health, pregnancy, and childbirth. We treats conditions such as menstrual disorders, infertility, pregnancy complications, fibroids, ovarian cysts, endometriosis, pelvic infections, menopause-related issues, and many others.",
    schedule: "Sunday: 10am - 2pm",
    image: "/assets/ob-gyn.png",
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

export default function Home() {
  return (
    <main className="bg-background">
      <HomeGallery />

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid items-stretch gap-20 rounded-[28px] bg-white p-6 text-foreground shadow-xl lg:grid-cols-[1fr_1.1fr] lg:p-10">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl">
            <Image
              src="/assets/test-smiling.png"
              alt="Patient smiling at Datima Specialist Clinics"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col justify-center gap-5">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-black leading-tight sm:text-4xl">
              Welcome to Datima Specialist Clinics
            </h2>
            <p className="text-base text-muted-foreground">
              Datima Specialist Clinics is a patient-centered healthcare facility committed to delivering top-notch
              medical services in a warm, professional, and compassionate environment.
            </p>
            <p className="text-lg font-semibold text-foreground">Why Choose Datima?</p>

            <ul className="space-y-3 text-sm text-foreground sm:text-base">
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

      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80" aria-hidden>
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-10 left-12 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-12 pt-12 lg:pt-16 lg:pb-16">
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
              
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {serviceLines.slice(0, 4).map((service) => (
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
                      <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <span className={badgeStyles()}>{service.schedule}</span>
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
            <p className="pt-2">
              <Button asChild className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700">
                <a href="/our-services">MORE SERVICES</a>
              </Button>
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Blog</p>
              <h3 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
                Latest stories from Datima Specialist Clinics.
              </h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
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
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {post.tags[0]} • {formatDisplayDate(post.createdAt, post.updatedAt)}
                    </div>
                    <h4 className="text-xl font-bold text-foreground">{post.title}</h4>
                    <a
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </article>
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
