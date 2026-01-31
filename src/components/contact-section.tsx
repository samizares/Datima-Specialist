"use client";

import { useActionState } from "react";
import { ChevronDown, Mail, MapPin } from "lucide-react";
import { Form } from "@/components/form/form";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicMessage } from "@/features/messages/actions/public-message";

const subjectOptions = [
  "General enquiry",
  "Appointments",
  "Billing",
  "Feedback",
  "Other",
];

const ContactSection = () => {
  const [actionState, action] = useActionState(
    submitPublicMessage,
    EMPTY_ACTION_STATE
  );

  return (
    <section id="contact" className="mx-auto w-full max-w-[1320px] px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary dark:text-white">
              Contact us
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl dark:text-white">
              Let us know how we can serve you better
            </h2>
            <p className="max-w-2xl text-muted-foreground dark:text-white">
              Use the form here to contact us if you want to make any enquiries about our services.
            </p>
          </div>

          <div className="grid gap-6 border-t border-border/70 pt-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-foreground dark:text-white">Address</p>
              </div>
              <p className="text-sm text-muted-foreground dark:text-white">
                1, Fola Agoro Street Off Bajulaye Road, Somulu, Lagos
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-foreground dark:text-white">Contact</p>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground dark:text-white">
                <p>care@datimaspecialistclinics.com</p>
                <p>+234 9157360689</p>
                <p>+234 9093933524</p>
              </div>
            </div>
          </div>
        </div>

        <Form
          className="rounded-3xl border border-border/70 bg-white p-6 shadow-xl sm:p-8"
          action={action}
          actionState={actionState}
        >
          <div className="space-y-3 text-center">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground sm:text-3xl dark:text-black">
              How Can We help?
            </h3>
            <p className="text-sm text-muted-foreground sm:text-base dark:text-black">
              Please feel welcome to contact our friendly reception staff with any general or medical enquiry. Our doctors will receive or return calls.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Input
              name="name"
              placeholder="Name"
              required
              className="h-14 rounded-2xl border-0 bg-[#e5f6fb] px-4 text-base shadow-none placeholder:text-slate-500 focus-visible:ring-0"
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="h-14 rounded-2xl border-0 bg-[#e5f6fb] px-4 text-base shadow-none placeholder:text-slate-500 focus-visible:ring-0"
            />
            <div className="relative">
              <select
                name="subject"
                className="h-14 w-full appearance-none rounded-2xl border-0 bg-[#e5f6fb] px-4 pr-10 text-base text-slate-600 shadow-none focus:outline-none"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Subject
                </option>
                {subjectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            <Input
              name="phone"
              type="tel"
              placeholder="Phone"
              required
              className="h-14 rounded-2xl border-0 bg-[#e5f6fb] px-4 text-base shadow-none placeholder:text-slate-500 focus-visible:ring-0"
            />
            <Textarea
              name="message"
              placeholder="Message"
              rows={5}
              required
              className="min-h-[160px] rounded-2xl border-0 bg-[#e5f6fb] px-4 py-3 text-base shadow-none placeholder:text-slate-500 focus-visible:ring-0 sm:col-span-2"
            />
          </div>

          <button
            type="submit"
            className="mt-6 h-12 w-full rounded-2xl bg-[#283a6a] text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-[#1f2f59]"
          >
            Submit Request
          </button>
        </Form>
      </div>
    </section>
  );
};

export { ContactSection };
