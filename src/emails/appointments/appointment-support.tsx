import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type AppointmentSupportProps = {
  clientName: string;
  email: string;
  telephone: string;
  address: string;
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  appointmentId: string;
};

const AppointmentSupport = ({
  clientName,
  email,
  telephone,
  address,
  clinic,
  doctor,
  date,
  time,
  appointmentId,
}: AppointmentSupportProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="font-sans m-8 text-center">
          <Container>
            <Section>
              <Text>New appointment booked</Text>
            </Section>
            <Section>
              <Text>Client: {clientName}</Text>
              <Text>Email: {email}</Text>
              <Text>Telephone: {telephone}</Text>
              <Text>Address: {address}</Text>
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

AppointmentSupport.PreviewProps = {
  clientName: "Samuel Oghogho",
  email: "sam@example.com",
  telephone: "+234 900 000 0000",
  address: "Not provided",
  clinic: "Datima Main Clinic",
  doctor: "Dr. A. Specialist",
  date: "Mon Jan 01 2026",
  time: "10:30",
  appointmentId: "apt_123456",
} as AppointmentSupportProps;

export default AppointmentSupport;
