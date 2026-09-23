import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { apiFetch } from "@/lib/api";
import type { PharmacyLocation, SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Ingata Pharmacy",
  description: "Get in touch with Ingata Pharmacy — send a message and our team will get back to you.",
};

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const settings = await apiFetch<SiteSetting>("/api/site-settings", { next: { revalidate: 300 } });
    return settings?.id ? settings : null;
  } catch {
    return null;
  }
}

async function getLocations(): Promise<PharmacyLocation[]> {
  try {
    return await apiFetch<PharmacyLocation[]>("/api/locations", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

function socialLinks(
  settings: Pick<SiteSetting, "facebookUrl" | "instagramUrl" | "linkedinUrl" | "xUrl" | "whatsappUrl" | "youtubeUrl">
): { href: string; label: string; Icon: IconType }[] {
  return [
    { href: settings.facebookUrl, label: "Facebook", Icon: FaFacebook },
    { href: settings.instagramUrl, label: "Instagram", Icon: FaInstagram },
    { href: settings.linkedinUrl, label: "LinkedIn", Icon: FaLinkedin },
    { href: settings.whatsappUrl, label: "WhatsApp", Icon: FaWhatsapp },
    { href: settings.xUrl, label: "X", Icon: FaXTwitter },
    { href: settings.youtubeUrl, label: "YouTube", Icon: FaYoutube },
  ].filter((social): social is typeof social & { href: string } => Boolean(social.href));
}

export default async function ContactPage() {
  const [settings, locations] = await Promise.all([getSiteSettings(), getLocations()]);
  const socials = settings ? socialLinks(settings) : [];
  const mappable = locations.find((location) => location.latitude != null && location.longitude != null);

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact"
        description="Questions about a medication, a branch, or anything else — send a message and our team will get back to you."
      />

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-24">
          <ContactForm locations={locations} />

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-7">
              <h2 className="font-display text-lg font-semibold text-slate-900">Reach us directly</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                {settings?.phone && (
                  <p className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={`tel:${settings.phone}`} className="hover:text-slate-900">
                      {settings.phone}
                    </a>
                  </p>
                )}
                {settings?.email && (
                  <p className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={`mailto:${settings.email}`} className="hover:text-slate-900">
                      {settings.email}
                    </a>
                  </p>
                )}
                {settings?.address && (
                  <p className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    {settings.address}
                  </p>
                )}
                {!settings?.phone && !settings?.email && !settings?.address && (
                  <p>Contact details will appear here once they&rsquo;re added.</p>
                )}
              </div>

              {socials.length > 0 && (
                <div className="mt-6 flex gap-3 border-t border-slate-200 pt-6">
                  {socials.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {mappable && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="relative h-48 w-full bg-slate-100">
                  <iframe
                    title={`Map of ${mappable.branchName}`}
                    src={`https://www.google.com/maps?q=${mappable.latitude},${mappable.longitude}&z=15&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}

            {locations.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-7">
                <h2 className="font-display text-lg font-semibold text-slate-900">Visit a branch</h2>
                <ul className="mt-4 divide-y divide-slate-100">
                  {locations.map((location) => (
                    <li key={location.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={1.75} />
                      <div className="min-w-0 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">{location.branchName}</p>
                        <p className="mt-0.5">{location.address}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
