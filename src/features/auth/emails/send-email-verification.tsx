import EmailVerification from "@/emails/auth/email-verification";
import { resend } from "@/lib/resend";

export const sendEmailVerification = async (
  username: string,
  email: string,
  verificationCode: string
) => {
  return await resend.emails.send({
    // your own custom domain here
    // or your email that you used to sign up at Resend
    from: "no-reply@care.datimaspecialistclinics.com",
    to: email,
    subject: "Email Verification from Datima Specialist Clinics",
    react: <EmailVerification toName={username} code={verificationCode} />,
  });
};
