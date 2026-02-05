import AppointmentConfirmation from "@/emails/appointments/appointment-confirmation";
import { resend } from "@/lib/resend";
const PUBLIC_BASE_URL = "https://datimaspecialistclinics.com";

type AppointmentConfirmationInput = {
  toName: string;
  email: string;
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  appointmentId: string;
};

export const sendAppointmentConfirmation = async ({
  toName,
  email,
  clinic,
  doctor,
  date,
  time,
  appointmentId,
}: AppointmentConfirmationInput) => {
  return resend.emails.send({
    from: "no-reply@care.datimaspecialistclinics.com",
    to: email,
    subject: "Your Datima appointment confirmation",
    react: (
      <AppointmentConfirmation
        toName={toName}
        logoUrl={`${PUBLIC_BASE_URL}/assets/Datima-enhance-logo.png`}
        slogan="Patient-first, evidence-based care"
        clinic={clinic}
        doctor={doctor}
        date={date}
        time={time}
        appointmentId={appointmentId}
      />
    ),
  });
};
