"use client";

import { CalendarClock, PhoneCall } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const services = [
  "Cardiology & Vascular",
  "Women’s Health",
  "Imaging & Diagnostics",
  "Endocrinology",
  "Mental Health",
];

export function AppointmentForm() {
  const defaultService = useMemo(() => services[0], []);

  return (
    <form
      className="grid gap-4 rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-primary">Priority access</p>
          <p className="text-sm text-muted-foreground">
            We respond within one business hour for specialist bookings.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarClock className="h-4 w-4" aria-hidden />
          <span>Same-week slots</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" placeholder="Adaeze Okoro" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@clinic.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(+234) 0801 234 5678"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="service">Service line</Label>
          <Select defaultValue={defaultService}>
            <SelectTrigger id="service" aria-label="Service line">
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Clinical context</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Referral notes, symptoms, or preferences."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PhoneCall className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-foreground">Need concierge scheduling?</p>
            <p>Call us and we will coordinate specialists for you.</p>
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Request a visit
        </Button>
      </div>
    </form>
  );
}
