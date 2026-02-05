import ContactConfirmation from "@/emails/messages/contact-confirmation";
import { resend } from "@/lib/resend";
const PUBLIC_BASE_URL = "https://datimaspecialistclinics.com";

type ContactConfirmationInput = {
  toName: string;
  email: string;
  subject: string;
  message: string;
};

export const sendContactConfirmation = async ({
  toName,
  email,
  subject,
  message,
}: ContactConfirmationInput) => {
  return resend.emails.send({
    from: "no-reply@care.datimaspecialistclinics.com",
    to: email,
    subject: "We received your message",
    react: (
      <ContactConfirmation
        toName={toName}
        logoUrl={`${PUBLIC_BASE_URL}/assets/Datima-enhance-logo.png`}
        slogan="Patient-first, evidence-based care"
        subject={subject}
        message={message}
      />
    ),
  });
};
