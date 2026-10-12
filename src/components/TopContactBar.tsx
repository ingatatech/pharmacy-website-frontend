import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { SiteSetting } from "@/types";

type Settings = Pick<
  SiteSetting,
  "phone" | "email" | "facebookUrl" | "instagramUrl" | "linkedinUrl" | "xUrl" | "youtubeUrl" | "whatsappUrl"
> | null;

export function TopContactBar({ settings }: { settings: Settings }) {
  if (!settings) return null;

  const socials = [
    { href: settings.facebookUrl, label: "Facebook", Icon: FaFacebook },
    { href: settings.instagramUrl, label: "Instagram", Icon: FaInstagram },
    { href: settings.linkedinUrl, label: "LinkedIn", Icon: FaLinkedin },
    { href: settings.xUrl, label: "X", Icon: FaXTwitter },
    { href: settings.youtubeUrl, label: "YouTube", Icon: FaYoutube },
    { href: settings.whatsappUrl, label: "WhatsApp", Icon: FaWhatsapp },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  const hasContact = Boolean(settings.phone || settings.email);

  if (!hasContact && socials.length === 0) return null;

  return (
    <div className="hidden bg-teal-900 text-white sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs sm:px-6">
        <div className="flex items-center gap-4">
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-emerald-300">
              <Phone className="h-3.5 w-3.5" />
              <span>{settings.phone}</span>
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-emerald-300">
              <Mail className="h-3.5 w-3.5" />
              <span>{settings.email}</span>
            </a>
          )}
        </div>
        {socials.length > 0 && (
          <div className="flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="hover:text-emerald-300"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
