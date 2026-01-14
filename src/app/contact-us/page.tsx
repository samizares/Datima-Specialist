import { MapPin, PhoneCall } from "lucide-react";

import { StaticPageHero } from "@/components/static-page-hero";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactUsPage() {
  return (
    <main className="bg-background">
      <StaticPageHero title="Contact Us" imagePosition="50% 15%" />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
            Contact Datima Specialist Clinics.
          </h2>
          <p className="max-w-3xl text-muted-foreground">
            If you have any questions, any feedback or you just want to contact us, please reach out using the details
            below or visit the clinic.
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
          Use this address, phone numbers and email address for all fliers, info and brochures of Datima Specialist
          Clinics.
        </p>
      </section>
    </main>
  );
}
