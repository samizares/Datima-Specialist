import { CardCompact } from "@/components/card-compact";
import { PasswordForgotForm } from "@/features/password/components/password-forgot-form";

const PasswordForgotPage = () => {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-6 pb-28 pt-24">
      <CardCompact
        title="Forgot Password"
        description="Enter your email address to reset your password."
        className="w-full max-w-[420px] animate-fade-from-top"
        content={<PasswordForgotForm />}
      />
    </div>
  );
};

export default PasswordForgotPage;
