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

type DoctorShiftScheduledProps = {
  doctorName: string;
  logoUrl: string;
  clinic: string;
  date: string;
  startShift: string;
  endShift: string;
  slogan: string;
};

const DoctorShiftScheduled = ({
  doctorName,
  logoUrl,
  clinic,
  date,
  startShift,
  endShift,
  slogan,
}: DoctorShiftScheduledProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="m-8 text-center font-sans">
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
              <Text>Hello {doctorName},</Text>
              <Text>
                You have been scheduled for a clinic shift. Review the details below:
              </Text>
            </Section>
            <Section>
              <Text>Clinic: {clinic}</Text>
              <Text>Date: {date}</Text>
              <Text>
                Shift: {startShift} - {endShift}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

DoctorShiftScheduled.PreviewProps = {
  doctorName: "Dr. Jane Doe",
  logoUrl: "https://datimaspecialistclinics.com/assets/Datima-enhance-logo.png",
  clinic: "Datima Main Clinic",
  date: "Mon Jan 01 2026",
  startShift: "09:00",
  endShift: "13:00",
  slogan: "Patient-first, evidence-based care",
} as DoctorShiftScheduledProps;

export default DoctorShiftScheduled;
