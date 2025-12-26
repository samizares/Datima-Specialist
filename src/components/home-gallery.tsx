"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Slide = {
  title: string;
  image: string;
  cta: string;
  position?: string;
};

const slides: Slide[] = [
  {
    title: "Complete Dental Package at Datima Specialist Clinics",
    image: "/assets/dental-xray.png",
    cta: "Book a Dentist Appointment",
    position: "68% 20%",
  },
  {
    title: "Expert Pediatrics Care at Datima Specialist Clinics",
    image: "/assets/paedatrics-care.png",
    cta: "Book Appointment Now",
    position: "65% 18%",
  },
  {
    title: "Experience Clearer Vision at Datima Specilist Clinics",
    image: "/assets/optometry-care.png",
    cta: "Book Appointment Now",
    position: "70% 28%",
  },
  {
    title: "Professional Laboratory Services in our facility",
    image: "/assets/lab-test.png",
    cta: "Book Appointment Now",
    position: "62% 20%",
  },
];

export function HomeGallery() {
  const [active, setActive] = useState(0);
  const total = useMemo(() => slides.length, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 3000);

    return () => window.clearInterval(id);
  }, [total]);

  const goTo = (index: number) => {
    setActive((index + total) % total);
  };

  return (
    <section className="relative mt-[96px] w-full overflow-hidden" aria-label="Datima Specialist Clinics gallery">
      <div className="relative h-[420px] sm:h-[460px] lg:h-[520px]">
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.title}
              className={clsx(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={!isActive}
              role="group"
              style={{
                backgroundImage: `linear-gradient(110deg, rgba(5, 15, 32, 0.88) 0%, rgba(5, 15, 32, 0.68) 45%, rgba(5, 15, 32, 0.38) 68%, rgba(5, 15, 32, 0.18) 100%), url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: slide.position ?? "68% center",
              }}
            >
              <div className="flex h-full items-center px-6 py-8 sm:px-10 lg:px-16">
                <div className="max-w-2xl space-y-6 text-white">
                  <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="text-lg text-blue-100">At Datima, your health and well-being come first.</p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-red-600 text-base font-semibold text-white shadow-lg transition hover:bg-red-700"
                  >
                    <a href="#booking">{slide.cta}</a>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-4 sm:bottom-6">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(active - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-600/80 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={clsx(
                  "h-4 w-4 rounded-full border-2 border-red-600 transition",
                  index === active ? "bg-red-600 shadow-[0_0_0_4px_rgba(220,38,38,0.25)]" : "bg-transparent",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(active + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-600/80 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
          >
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
