import DoctorShiftScheduled from "@/emails/clinics/doctor-shift-scheduled";
import { resend } from "@/lib/resend";

const PUBLIC_BASE_URL = "https://datimaspecialistclinics.com";

type DoctorShiftScheduledInput = {
  doctorName: string;
  email: string;
  clinic: string;
  date: string;
  startShift: string;
  endShift: string;
};

export const sendDoctorShiftScheduled = async ({
  doctorName,
  email,
  clinic,
  date,
  startShift,
  endShift,
}: DoctorShiftScheduledInput) => {
  return resend.emails.send({
    from: "no-reply@care.datimaspecialistclinics.com",
    to: email,
    subject: "You have been scheduled for a clinic shift",
    react: (
      <DoctorShiftScheduled
        doctorName={doctorName}
        logoUrl={`${PUBLIC_BASE_URL}/assets/Datima-enhance-logo.png`}
        slogan="Patient-first, evidence-based care"
        clinic={clinic}
        date={date}
        startShift={startShift}
        endShift={endShift}
      />
    ),
  });
};
