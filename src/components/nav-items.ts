// nav-items.ts

import {
  homePath,
  AboutUs,
  OurServices,
  Blog,
  ContactUs,
} from "@/paths";

/**
 * Navigation item shape
 */
export type NavItem = {
  label: string;
  href: string;
  isCTA?: boolean;
};

/**
 * Main navigation items
 */
export const navItems: NavItem[] = [
  { label: "Home", href: homePath() },
  { label: "About Us", href: AboutUs() },
  { label: "Our Services", href: OurServices() },
  { label: "Blog", href: Blog() },
  { label: "Contact Us", href: ContactUs() },
  {
    label: "Book An Appointment",
    href: `${homePath()}#booking`,
    isCTA: true,
  },
];