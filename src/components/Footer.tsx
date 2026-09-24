import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { SiteSetting } from "@/types";
import { T } from "@/lib/language-context";

const EXPLORE_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/articles", label: "Blog" },
  { href: "/locations", label: "Find a pharmacy" },
];

const HELP_LINKS = [
  { href: "/prescription-refill", label: "Refill a prescription" },
  { href: "/contact", label: "Contact us" },
  { href: "/faqs", label: "FAQs" },
];

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/medical-disclaimer", label: "Medical Disclaimer" },
];

const SOCIAL_LINKS = (
  settings: Pick<SiteSetting, "facebookUrl" | "instagramUrl" | "linkedinUrl" | "xUrl" | "youtubeUrl">
): { href: string; label: string; Icon: IconType }[] =>
  [
    { href: settings.facebookUrl, label: "Facebook", Icon: FaFacebook },
    { href: settings.instagramUrl, label: "Instagram", Icon: FaInstagram },
    { href: settings.linkedinUrl, label: "LinkedIn", Icon: FaLinkedin },
    { href: settings.xUrl, label: "X", Icon: FaXTwitter },
    { href: settings.youtubeUrl, label: "YouTube", Icon: FaYoutube },
  ].filter((social): social is typeof social & { href: string } => Boolean(social.href));

export function Footer({ settings }: { settings: SiteSetting | null }) {
  const year = new Date().getFullYear();
  const socials = settings ? SOCIAL_LINKS(settings) : [];

  return (
    <footer className="bg-teal-950 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr]">
        <div>
          <span className="font-display text-lg font-medium text-white">
            {settings?.pharmacyName || "Ingata Pharmacy"}
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            <T
              text={
                settings?.heroSubheading ||
                "Prescription refills, medication counseling and everyday care from licensed pharmacists."
              }
            />
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">
            <T text="Explore" />
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  <T text={link.label} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">
            <T text="Get help" />
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  <T text={link.label} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">
            <T text="Legal" />
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  <T text={link.label} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">
            <T text="Contact" />
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {settings?.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-white/50" />
                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-white/50" />
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings?.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {year} {settings?.pharmacyName || "Ingata Pharmacy"}. <T text="All rights reserved." />
          </span>
          <span>
            <T text="Kigali, Rwanda" />
          </span>
        </div>
      </div>
    </footer>
  );
}
