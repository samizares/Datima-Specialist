"use server";

import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { sendAppointmentConfirmation } from "@/features/appointment/emails/send-appointment-confirmation";
import { sendAppointmentSupport } from "@/features/appointment/emails/send-appointment-support";

const appointmentSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
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
    if (!data.clinicId && !data.clinicName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Clinic is required",
        path: ["clinicId"],
      });
    }
  });

export const bookAppointment = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const data = appointmentSchema.parse({
      firstName: formData.get("firstName") ?? "",
      lastName: formData.get("lastName") ?? "",
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

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
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

    const appointmentDate = appointment.setDay.toDateString();

    await sendAppointmentSupport({
      clientName: `${client.firstName} ${client.lastName}`,
      email: data.email,
      telephone: client.telephone,
      address: client.address,
      clinic: appointment.clinic.name,
      doctor: doctorName,
      date: appointmentDate,
      time: appointment.setTime,
      appointmentId: appointment.id,
    });

    await sendAppointmentConfirmation({
      toName: `${firstName} ${lastName}`,
      email: data.email,
      clinic: appointment.clinic.name,
      doctor: doctorName,
      date: appointmentDate,
      time: appointment.setTime,
      appointmentId: appointment.id,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  return toActionState("SUCCESS", "Appointment booked successfully");
};
