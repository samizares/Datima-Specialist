import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type InvoicePdfItem = {
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
};

type InvoicePdfPayload = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string;
  clientAddress: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  notes?: string | null;
  terms?: string | null;
  items: InvoicePdfItem[];
};

export const createInvoicePdf = async (payload: InvoicePdfPayload) => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, size = 11, boldText = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: boldText ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
  };

  let cursorY = 800;
  drawText("Datima Specialist Clinics", 40, cursorY, 16, true);
  cursorY -= 18;
  drawText("Patient-first, evidence-based care", 40, cursorY, 10);

  cursorY -= 30;
  drawText(`Invoice #: ${payload.invoiceNumber}`, 40, cursorY, 12, true);
  drawText(`Issue date: ${payload.issueDate}`, 320, cursorY, 11);
  cursorY -= 18;
  drawText(`Due date: ${payload.dueDate}`, 320, cursorY, 11);

  cursorY -= 24;
  drawText("Bill To:", 40, cursorY, 11, true);
  cursorY -= 16;
  drawText(payload.clientName, 40, cursorY, 11);
  cursorY -= 14;
  if (payload.clientEmail) {
    drawText(payload.clientEmail, 40, cursorY, 10);
    cursorY -= 14;
  }
  drawText(payload.clientPhone, 40, cursorY, 10);
  cursorY -= 14;
  drawText(payload.clientAddress, 40, cursorY, 10);

  cursorY -= 30;
  drawText("Description", 40, cursorY, 11, true);
  drawText("Qty", 320, cursorY, 11, true);
  drawText("Unit", 380, cursorY, 11, true);
  drawText("Amount", 450, cursorY, 11, true);
  cursorY -= 10;
  page.drawLine({ start: { x: 40, y: cursorY }, end: { x: 550, y: cursorY }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

  cursorY -= 18;
  payload.items.forEach((item) => {
    drawText(item.description, 40, cursorY, 10);
    drawText(String(item.quantity), 320, cursorY, 10);
    drawText(item.unitPrice, 380, cursorY, 10);
    drawText(item.amount, 450, cursorY, 10);
    cursorY -= 16;
  });

  cursorY -= 10;
  page.drawLine({ start: { x: 360, y: cursorY }, end: { x: 550, y: cursorY }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  cursorY -= 18;
  drawText(`Subtotal: ${payload.subtotal}`, 360, cursorY, 10, true);
  cursorY -= 14;
  drawText(`Tax: ${payload.tax}`, 360, cursorY, 10, true);
  cursorY -= 14;
  drawText(`Discount: ${payload.discount}`, 360, cursorY, 10, true);
  cursorY -= 14;
  drawText(`Total: ${payload.total}`, 360, cursorY, 12, true);

  cursorY -= 24;
  if (payload.notes) {
    drawText(`Notes: ${payload.notes}`, 40, cursorY, 10);
    cursorY -= 16;
  }
  if (payload.terms) {
    drawText(`Terms: ${payload.terms}`, 40, cursorY, 10);
  }

  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
};
