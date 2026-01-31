import { StaticPageHero } from "@/components/static-page-hero";
import { ContactSection } from "@/components/contact-section";

export default function ContactUsPage() {
  return (
    <main className="bg-background">
      <section id="contact-hero">
        <StaticPageHero title="Contact Us" imagePosition="50% 15%" />
      </section>
      <ContactSection />
    </main>
  );
}
