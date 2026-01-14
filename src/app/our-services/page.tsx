import clsx from "clsx";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaticPageHero } from "@/components/static-page-hero";

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

const badgeStyles = (label: string) =>
  clsx("rounded-full px-3 py-1 text-xs font-semibold bg-secondary text-foreground", {
    "bg-emerald-100 text-emerald-800": label.toLowerCase().includes("state"),
    "bg-amber-100 text-amber-800": label.toLowerCase().includes("appointment"),
    "bg-sky-100 text-sky-800": label.toLowerCase().includes("specialist"),
  });

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
    </main>
  );
}
