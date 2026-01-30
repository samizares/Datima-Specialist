export const homePath = () => "/";
export const adminHomePath = () => "/admin";
export const adminUsersPath = () => "/admin/users";
export const adminUserDetailPath = (userId: string) =>
  `/admin/users/${userId}`;
export const adminAttachmentsPath = () => "/admin/attachments";
export const adminAttachmentDetailPath = (attachmentId: string) =>
  `/admin/attachments/${attachmentId}`; 
export const adminClientsPath = () => "/admin/clients";
export const adminClinicsPath = () => "/admin/clinics";
export const adminSettingsPath = () => "/admin/settings";
export const adminDoctorsPath = () => "/admin/doctors";
export const adminMessagesPath = () => "/admin/messages";
export const adminCampaignsPath = () => "/admin/campaigns";
export const adminAppointmentsPath = () => "/admin/appointments";
export const adminDoctorSchedulesPath = () => "/admin/doctor-schedules";
export const adminTestimonialsPath = () => "/admin/testimonials";
export const adminBlogAllPath = () => "/admin/blog/all";
export const adminBlogCreatePath = () => "/admin/blog/create";
export const AboutUs = () => "/about-us";
export const OurServices = () => "/our-services";
export const ContactUs = () => "/contact-us"
export const Blog = () => "/blog";

export const pricingPath = () => "/pricing";

export const signUpPath = () => "/sign-up";
export const signInPath = () => "/sign-in";

export const passwordForgotPath = () => "/password-forgot";
export const passwordResetPath = () => "/password-reset";
export const emailVerificationPath = () => "/email-verification";

export const attachmentDownloadPath = (attachmentId: string) =>
  `/api/aws/s3/attachments/${attachmentId}`;
