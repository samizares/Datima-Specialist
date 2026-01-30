"use server";

import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

const appointmentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  address: z.string().min(1, "Address is required"),
  telephone: z.string().min(1, "Telephone is required"),
  clinicId: z.string().min(1, "Clinic is required"),
  doctorId: z.string().optional(),
  setDay: z.string().min(1, "Appointment date is required"),
  setTime: z.string().min(1, "Appointment time is required"),
});

const SUPPORT_EMAIL = "samizares@hotmail.com";

export const bookAppointment = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const data = appointmentSchema.parse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      address: formData.get("address"),
      telephone: formData.get("telephone"),
      clinicId: formData.get("clinicId"),
      doctorId: formData.get("doctorId") || undefined,
      setDay: formData.get("setDay"),
      setTime: formData.get("setTime"),
    });

    const appointmentDay = new Date(data.setDay);
    if (Number.isNaN(appointmentDay.getTime())) {
      return toActionState("ERROR", "Appointment date is invalid", formData);
    }

    const client = await prisma.client.upsert({
      where: {
        telephone: data.telephone,
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        status: "PATIENT",
      },
      create: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
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
        clinicId: data.clinicId,
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
