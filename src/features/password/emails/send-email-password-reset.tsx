import EmailPasswordReset from "@/emails/password/email-password-reset";
import { resend } from "@/lib/resend";

export const sendEmailPasswordReset = async (
  username: string,
  email: string,
  passwordResetLink: string
) => {
  return await resend.emails.send({
    // your own custom domain here
    // or your email that you used to sign up at Resend
    from: "no-reply@care.datimaspecialistclinics.com",
    to: email,
    subject: "Password Reset from Datima Specialist Clinics",
    react: <EmailPasswordReset toName={username} url={passwordResetLink} />,
  });
};
