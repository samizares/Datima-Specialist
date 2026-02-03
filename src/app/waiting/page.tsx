import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { StaticPageHero } from "@/components/static-page-hero";

export default function WaitingPage() {
  return (
    <main className="bg-background">
      <section id="waiting-hero">
        <StaticPageHero title="Waiting" imagePosition="50% 15%" />
      </section>
      <section id="waiting-content" className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-12">
        <Card className="w-full max-w-2xl border-0 bg-white/90 shadow-lg ring-1 ring-border/70">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="relative h-56 w-full overflow-hidden rounded-2xl">
              <Image
                src="/assets/test-smiling.png"
                alt="Welcome to Datima Specialist Clinics"
                fill
                sizes="(min-width: 768px) 560px, 100vw"
                className="object-cover object-top"
                priority
              />
            </div>
            <p className="text-lg text-muted-foreground dark:text-black">
              Thanks for verifying your email but you still need Admin access which will be granted very soon. You will be notified to sign in again. Thanks for your patience!!!
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
