import EmailNewAdmin from "@/emails/admin-notifications/email-new-admin";
//import EmailPasswordReset from "@/emails/admin-notifications/email-new-admin";
import { resend } from "@/lib/resend";

export const sendEmailNewAdmin = async (
  username: string,
  email: string,
  url: string
) => {
  return await resend.emails.send({
    // your own custom domain here
    // or your email that you used to sign up at Resend
    from: "no-reply@care.datimaspecialistclinics.com",
    to: email,
    subject: "A new Admin user has Signed up, Activate Admin Account Now",
    react: <EmailNewAdmin toName={username} url={url} />,
  });
};
