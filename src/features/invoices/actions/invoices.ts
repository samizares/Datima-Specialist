"use server";

import { z } from "zod";
import { Prisma, InvoiceStatus } from "@prisma/client";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";
import { adminInvoicesPath } from "@/paths";
import { revalidatePath } from "next/cache";
import { createInvoicePdf } from "@/features/invoices/service/create-invoice-pdf";
import { storeInvoicePdf } from "@/features/invoices/service/store-invoice-pdf";
import { sendInvoiceEmail } from "@/features/invoices/emails/send-invoice-email";

const ensureAdminAccess = (user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(1, "Quantity is required"),
  unitPrice: z.coerce.number().min(0, "Unit price is required"),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  status: z.nativeEnum(InvoiceStatus),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.string().min(1, "Currency is required"),
  tax: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
});

type InvoiceInput = z.infer<typeof invoiceSchema>;

const toDecimal = (value: number) => new Prisma.Decimal(value.toFixed(2));

export async function createInvoice(input: InvoiceInput): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = invoiceSchema.parse(input);

    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });
    if (!client) {
      return toActionState("ERROR", "Client not found");
    }

    const subtotalValue = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const totalValue = subtotalValue + data.tax - data.discount;

    const pdfBuffer = await createInvoicePdf({
      invoiceNumber: data.invoiceNumber,
      issueDate: new Date(data.issueDate).toDateString(),
      dueDate: new Date(data.dueDate).toDateString(),
      clientName: `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      clientPhone: client.telephone,
      clientAddress: client.address,
      subtotal: `${data.currency} ${subtotalValue.toFixed(2)}`,
      tax: `${data.currency} ${data.tax.toFixed(2)}`,
      discount: `${data.currency} ${data.discount.toFixed(2)}`,
      total: `${data.currency} ${totalValue.toFixed(2)}`,
      notes: data.notes,
      terms: data.terms,
      items: data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: `${data.currency} ${item.unitPrice.toFixed(2)}`,
        amount: `${data.currency} ${(item.quantity * item.unitPrice).toFixed(2)}`,
      })),
    });

    const attachment = await storeInvoicePdf({
      buffer: pdfBuffer,
      fileName: `${data.invoiceNumber}.pdf`,
    });

    const invoice = await prisma.invoice.create({
      data: {
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        currency: data.currency,
        subtotal: toDecimal(subtotalValue),
        tax: toDecimal(data.tax),
        discount: toDecimal(data.discount),
        total: toDecimal(totalValue),
        notes: data.notes,
        terms: data.terms,
        attachmentId: attachment.id,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: toDecimal(item.unitPrice),
            amount: toDecimal(item.quantity * item.unitPrice),
          })),
        },
      },
    });

    revalidatePath(adminInvoicesPath());
    return toActionState("SUCCESS", "Invoice created", undefined, invoice);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateInvoice(
  id: string,
  input: InvoiceInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = invoiceSchema.parse(input);

    const subtotalValue = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const totalValue = subtotalValue + data.tax - data.discount;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        currency: data.currency,
        subtotal: toDecimal(subtotalValue),
        tax: toDecimal(data.tax),
        discount: toDecimal(data.discount),
        total: toDecimal(totalValue),
        notes: data.notes,
        terms: data.terms,
        items: {
          deleteMany: {},
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: toDecimal(item.unitPrice),
            amount: toDecimal(item.quantity * item.unitPrice),
          })),
        },
      },
    });

    revalidatePath(adminInvoicesPath());
    return toActionState("SUCCESS", "Invoice updated", undefined, invoice);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteInvoice(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const invoice = await prisma.invoice.delete({ where: { id } });
    revalidatePath(adminInvoicesPath());
    return toActionState("SUCCESS", "Invoice deleted", undefined, invoice);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function sendInvoice(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, attachment: true },
    });

    if (!invoice || !invoice.attachment || !invoice.client.email) {
      return toActionState("ERROR", "Invoice email data is missing");
    }

    await sendInvoiceEmail({
      toName: `${invoice.client.firstName} ${invoice.client.lastName}`,
      email: invoice.client.email,
      invoiceNumber: invoice.invoiceNumber,
      total: `${invoice.currency} ${invoice.total.toFixed(2)}`,
      dueDate: invoice.dueDate.toDateString(),
      attachmentId: invoice.attachment.id,
      attachmentName: invoice.attachment.name,
    });

    await prisma.invoice.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date() },
    });

    revalidatePath(adminInvoicesPath());
    return toActionState("SUCCESS", "Invoice sent");
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
