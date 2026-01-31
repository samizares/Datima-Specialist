"use server";

import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

const appointmentSchema = z
  .object({
    fullName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().min(1, "Email is required").email("Email is invalid"),
    address: z.string().optional(),
    telephone: z.string().min(1, "Telephone is required"),
    clinicId: z.string().optional(),
    clinicName: z.string().optional(),
    doctorId: z.string().optional(),
    setDay: z.string().min(1, "Appointment date is required"),
    setTime: z.string().min(1, "Appointment time is required"),
  })
  .superRefine((data, ctx) => {
    if (!data.fullName && (!data.firstName || !data.lastName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required",
        path: ["fullName"],
      });
    }

    if (!data.clinicId && !data.clinicName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Clinic is required",
        path: ["clinicId"],
      });
    }
  });

const SUPPORT_EMAIL = "samizares@hotmail.com";

export const bookAppointment = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const data = appointmentSchema.parse({
      fullName: formData.get("fullName") || undefined,
      firstName: formData.get("firstName") || undefined,
      lastName: formData.get("lastName") || undefined,
      email: formData.get("email"),
      address: formData.get("address") || undefined,
      telephone: formData.get("telephone"),
      clinicId: formData.get("clinicId") || undefined,
      clinicName: formData.get("clinicName") || undefined,
      doctorId: formData.get("doctorId") || undefined,
      setDay: formData.get("setDay"),
      setTime: formData.get("setTime"),
    });

    const appointmentDay = new Date(data.setDay);
    if (Number.isNaN(appointmentDay.getTime())) {
      return toActionState("ERROR", "Appointment date is invalid", formData);
    }

    const fullName = data.fullName?.trim();
    const nameParts = fullName ? fullName.split(/\s+/) : [];
    const firstName =
      data.firstName?.trim() || nameParts[0] || "New";
    const lastName =
      data.lastName?.trim() || nameParts.slice(1).join(" ") || "Patient";
    const address = data.address?.trim() || "Not provided";

    const clinic = data.clinicId
      ? await prisma.clinic.findUnique({
          where: { id: data.clinicId },
          select: { id: true },
        })
      : await prisma.clinic.findUnique({
          where: { name: data.clinicName ?? "" },
          select: { id: true },
        });

    if (!clinic) {
      return toActionState("ERROR", "Clinic is invalid", formData);
    }

    const client = await prisma.client.upsert({
      where: {
        telephone: data.telephone,
      },
      update: {
        firstName,
        lastName,
        email: data.email,
        address,
        status: "PATIENT",
      },
      create: {
        firstName,
        lastName,
        email: data.email,
        address,
        telephone: data.telephone,
        status: "PATIENT",
        attachmentId: "",
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        setDay: appointmentDay,
        setTime: data.setTime,
        clientId: client.id,
        clinicId: clinic.id,
        ...(data.doctorId ? { doctorId: data.doctorId } : {}),
      },
      include: {
        clinic: { select: { name: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });

    const doctorName = appointment.doctor
      ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
      : "No preference";

    await resend.emails.send({
      from: "no-reply@app.road-to-next-app.com",
      to: SUPPORT_EMAIL,
      subject: "New appointment booked",
      text: [
        `Client: ${client.firstName} ${client.lastName}`,
        `Email: ${data.email}`,
        `Telephone: ${client.telephone}`,
        `Address: ${client.address}`,
        `Clinic: ${appointment.clinic.name}`,
        `Doctor: ${doctorName}`,
        `Appointment date: ${appointment.setDay.toDateString()}`,
        `Appointment time: ${appointment.setTime}`,
        `Appointment ID: ${appointment.id}`,
      ].join("\n"),
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  return toActionState("SUCCESS", "Appointment booked successfully");
};
