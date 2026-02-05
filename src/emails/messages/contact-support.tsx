import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type ContactSupportProps = {
  clientName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  clientId: string;
  messageId: string;
};

const ContactSupport = ({
  clientName,
  email,
  phone,
  subject,
  message,
  clientId,
  messageId,
}: ContactSupportProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="font-sans m-8 text-center">
          <Container>
            <Section>
              <Text>New support message</Text>
            </Section>
            <Section>
              <Text>From: {clientName}</Text>
              <Text>Email: {email}</Text>
              <Text>Phone: {phone}</Text>
              <Text>Client ID: {clientId}</Text>
              <Text>Message ID: {messageId}</Text>
              <Text>Subject: {subject}</Text>
              <Text>{message}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactSupport.PreviewProps = {
  clientName: "Samuel Oghogho",
  email: "sam@example.com",
  phone: "+234 900 000 0000",
  subject: "Appointments",
  message: "I want to reschedule my appointment.",
  clientId: "client_123",
  messageId: "msg_456",
} as ContactSupportProps;

export default ContactSupport;
