import ContactSupport from "@/emails/messages/contact-support";
import { resend } from "@/lib/resend";

type ContactSupportInput = {
  clientName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  clientId: string;
  messageId: string;
};

export const sendContactSupport = async ({
  clientName,
  email,
  phone,
  subject,
  message,
  clientId,
  messageId,
}: ContactSupportInput) => {
  return resend.emails.send({
    from: "no-reply@care.datimaspecialistclinics.com",
    to: "samizares@hotmail.com",
    subject: `New support message: ${subject}`,
    react: (
      <ContactSupport
        clientName={clientName}
        email={email}
        phone={phone}
        subject={subject}
        message={message}
        clientId={clientId}
        messageId={messageId}
      />
    ),
  });
};
