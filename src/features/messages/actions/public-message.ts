"use server";

import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  phone: z.string().min(1, "Phone is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export const submitPublicMessage = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const data = messageSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "New";
    const lastName = nameParts.slice(1).join(" ") || "Contact";

    const client = await prisma.client.upsert({
      where: {
        telephone: data.phone,
      },
      update: {
        firstName,
        lastName,
        email: data.email,
        status: "PROSPECT",
      },
      create: {
        firstName,
        lastName,
        email: data.email,
        address: "Not provided",
        telephone: data.phone,
        status: "PROSPECT",
        attachmentId: "",
      },
    });

    await prisma.message.create({
      data: {
        clientId: client.id,
        content: [`Subject: ${data.subject}`, data.message].join("\n"),
      },
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  return toActionState("SUCCESS", "Message sent successfully");
};
