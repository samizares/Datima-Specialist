import { StaticPageHero } from "@/components/static-page-hero";
import { ContactSection } from "@/components/contact-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Datima Specialist Clinics",
  description:
    "Get in touch with Datima Specialist Clinics to schedule appointments, ask questions, or find clinic hours and locations.",
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: "Contact Datima Specialist Clinics",
    description:
      "Get in touch with Datima Specialist Clinics to schedule appointments, ask questions, or find clinic hours and locations.",
    url: "/contact-us",
    siteName: "Datima Specialist Clinics",
    images: [
      {
        url: "/assets/large-contact.png",
        alt: "Contact Datima Specialist Clinics",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Datima Specialist Clinics",
    description:
      "Get in touch with Datima Specialist Clinics to schedule appointments, ask questions, or find clinic hours and locations.",
    images: ["/assets/large-contact.png"],
  },
};

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
