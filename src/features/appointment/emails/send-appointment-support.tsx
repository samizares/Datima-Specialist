import AppointmentSupport from "@/emails/appointments/appointment-support";
import { resend } from "@/lib/resend";

type AppointmentSupportInput = {
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

export const sendAppointmentSupport = async ({
  clientName,
  email,
  telephone,
  address,
  clinic,
  doctor,
  date,
  time,
  appointmentId,
}: AppointmentSupportInput) => {
  return resend.emails.send({
    from: "no-reply@care.datimaspecialistclinics.com",
    to: "samizares@hotmail.com",
    subject: "New appointment booked",
    react: (
      <AppointmentSupport
        clientName={clientName}
        email={email}
        telephone={telephone}
        address={address}
        clinic={clinic}
        doctor={doctor}
        date={date}
        time={time}
        appointmentId={appointmentId}
      />
    ),
  });
};
