import { GetObjectCommand } from "@aws-sdk/client-s3";
import { AttachmentType } from "@prisma/client";
import InvoiceSent from "@/emails/invoice/invoice-sent";
import { s3 } from "@/lib/aws";
import { resend } from "@/lib/resend";
import { generateS3Key } from "@/features/attachment/utils/generate-s3-key";

const PUBLIC_BASE_URL = "https://datimaspecialistclinics.com";

const streamToBuffer = async (stream: ReadableStream | NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as any) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

type SendInvoiceEmailInput = {
  toName: string;
  email: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  attachmentId: string;
  attachmentName: string;
};

export const sendInvoiceEmail = async ({
  toName,
  email,
  invoiceNumber,
  total,
  dueDate,
  attachmentId,
  attachmentName,
}: SendInvoiceEmailInput) => {
  const key = generateS3Key({
    attachmentType: AttachmentType.INVOICE,
    fileName: attachmentName,
    attachmentId,
  });

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })
  );

  const body = response.Body;
  if (!body) {
    throw new Error("Invoice PDF not found.");
  }

  const buffer = await streamToBuffer(body as any);

  return resend.emails.send({
    from: "no-reply@care.datimaspecialistclinics.com",
    to: email,
    subject: `Invoice ${invoiceNumber} from Datima Specialist Clinics`,
    react: (
      <InvoiceSent
        toName={toName}
        logoUrl={`${PUBLIC_BASE_URL}/assets/Datima-enhance-logo.png`}
        slogan="Patient-first, evidence-based care"
        invoiceNumber={invoiceNumber}
        total={total}
        dueDate={dueDate}
        address="1, Fola Agoro Street Off Bajulaye Road, Somulu, Lagos"
        contactEmail="care@datimaspecialistclinics.com"
        contactPhone="+234 9157360689, +234 9093933524"
      />
    ),
    attachments: [
      {
        filename: attachmentName,
        content: buffer.toString("base64"),
      },
    ],
  });
};
