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

type AppointmentConfirmationProps = {
  toName: string;
  logoUrl: string;
  slogan: string;
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  appointmentId: string;
};

const AppointmentConfirmation = ({
  toName,
  logoUrl,
  slogan,
  clinic,
  doctor,
  date,
  time,
  appointmentId,
}: AppointmentConfirmationProps) => {
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
              <Text>
                Thanks {toName} for booking an appointment with Datima Specialist Clinics.
                This is a confirmation of your appointment. Check out the full details below:
              </Text>
            </Section>
            <Section>
              <Text>Clinic: {clinic}</Text>
              <Text>Doctor: {doctor}</Text>
              <Text>Appointment date: {date}</Text>
              <Text>Appointment time: {time}</Text>
              <Text>Appointment ID: {appointmentId}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

AppointmentConfirmation.PreviewProps = {
  toName: "Samuel Oghogho",
  logoUrl: "https://datima-specialist-clinics.com/assets/Datima-enhance-logo.png",
  slogan: "Patient-first, evidence-based care",
  clinic: "Datima Main Clinic",
  doctor: "Dr. A. Specialist",
  date: "Mon Jan 01 2026",
  time: "10:30",
  appointmentId: "apt_123456",
} as AppointmentConfirmationProps;

export default AppointmentConfirmation;
