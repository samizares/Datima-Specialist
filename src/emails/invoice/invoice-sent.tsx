import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type InvoiceSentProps = {
  toName: string;
  logoUrl: string;
  slogan: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
};

const InvoiceSent = ({
  toName,
  logoUrl,
  slogan,
  invoiceNumber,
  total,
  dueDate,
  address,
  contactEmail,
  contactPhone,
}: InvoiceSentProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="font-sans m-8 text-center">
          <Container>
            <Section>
              <Img
                src={logoUrl}
                alt="Datima Specialist Clinics"
                className="mx-auto h-10 w-auto"
              />
              <Text className="mt-2 text-sm text-slate-600">{slogan}</Text>
            </Section>
            <Section>
              <Text>Hi {toName},</Text>
              <Text>
                Your invoice is ready. Total amount due is {total}. Please see the attached PDF for the full details.
              </Text>
            </Section>
            <Section>
              <Text>Invoice Number: {invoiceNumber}</Text>
              <Text>Due Date: {dueDate}</Text>
            </Section>
            <Section>
              <Text>{address}</Text>
              <Text>{contactEmail}</Text>
              <Text>{contactPhone}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

InvoiceSent.PreviewProps = {
  toName: "Samuel Oghogho",
  logoUrl: "https://datimaspecialistclinics.com/assets/Datima-enhance-logo.png",
  slogan: "Patient-first, evidence-based care",
  invoiceNumber: "INV-2026-001",
  total: "₦ 250,000.00",
  dueDate: "Feb 20, 2026",
  address: "1, Fola Agoro Street Off Bajulaye Road, Somulu, Lagos",
  contactEmail: "care@datimaspecialistclinics.com",
  contactPhone: "+234 9157360689, +234 9093933524",
} as InvoiceSentProps;

export default InvoiceSent;
