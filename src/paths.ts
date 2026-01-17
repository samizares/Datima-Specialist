export const homePath = () => "/";
export const AboutUs = () => "/about-us";
export const OurServices = () => "/our-services";
export const ContactUs = () => "/contact-us";
export const Blog = () => "/blog";

export const pricingPath = () => "/pricing";

export const signUpPath = () => "/sign-up";
export const signInPath = () => "/sign-in";

export const passwordForgotPath = () => "/password-forgot";
export const passwordResetPath = () => "/password-reset";

export const emailVerificationPath = () => "/email-verification";

export const attachmentDownloadPath = (attachmentId: string) =>
  `/api/aws/s3/attachments/${attachmentId}`;
