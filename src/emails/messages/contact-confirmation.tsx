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

type ContactConfirmationProps = {
  toName: string;
  logoUrl: string;
  slogan: string;
  subject: string;
  message: string;
};

const ContactConfirmation = ({
  toName,
  logoUrl,
  slogan,
  subject,
  message,
}: ContactConfirmationProps) => {
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
              <Text className="mt-2 text-sm text-slate-600">
                {slogan}
              </Text>
            </Section>
            <Section>
              <Text>Hi {toName},</Text>
              <Text>
                Thanks for contacting Datima Specialist Clinics. This is a confirmation
                that we received your message.
              </Text>
            </Section>
            <Section>
              <Text>Subject: {subject}</Text>
              <Text>{message}</Text>
            </Section>
            <Section>
              <Text>We will get back to you shortly.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactConfirmation.PreviewProps = {
  toName: "Samuel Oghogho",
  logoUrl: "https://datima-specialist-clinics.com/assets/Datima-enhance-logo.png",
  slogan: "Patient-first, evidence-based care",
  subject: "General enquiry",
  message: "Hello, I would like to know more about your services.",
} as ContactConfirmationProps;

export default ContactConfirmation;
