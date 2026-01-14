import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StaticPageHero } from "@/components/static-page-hero";

export default function AboutUsPage() {
  return (
    <main className="bg-background">
      <StaticPageHero title="About Us" imagePosition="50% 15%" />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Datima Specialist Clinics</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
            Professional, compassionate care you can trust.
          </h2>
          <p className="text-muted-foreground">
            Datima Specialist Clinics is a patient-centered healthcare facility committed to delivering top-notch medical
            services in a warm, professional, and compassionate environment.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg leading-tight">
                Advanced diagnostics and modern medical equipment.
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Accurate diagnosis and effective treatment plans built around proven medical expertise.
              </p>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg leading-tight">Renowned specialists across diverse fields.</CardTitle>
              <p className="text-sm text-muted-foreground">
                Our multidisciplinary team includes general medicine, cardiology, paediatrics, dental care, eye care, and
                more.
              </p>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg leading-tight">Patient-first, evidence-based care.</CardTitle>
              <p className="text-sm text-muted-foreground">
                We focus on personalized care plans that prioritize comfort, clarity, and long-term wellbeing.
              </p>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg leading-tight">Trusted by families in Lagos.</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compassionate, consistent care delivered by experienced clinicians and support staff.
              </p>
            </CardHeader>
          </Card>
        </div>
      </section>
    </main>
  );
}
