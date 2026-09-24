import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { LegalToc } from "@/components/legal/LegalToc";
import { T } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Privacy Policy | Ingata Pharmacy",
  description: "How Ingata Pharmacy collects, uses and protects the information you share with us.",
};

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const settings = await apiFetch<SiteSetting>("/api/site-settings", { next: { revalidate: 300 } });
    return settings?.id ? settings : null;
  } catch {
    return null;
  }
}

const h2 = "font-display text-xl font-semibold text-slate-900 sm:text-2xl";
const p = "mt-3 text-sm leading-relaxed text-slate-600 sm:text-base";
const ul = "mt-3 space-y-2 text-sm leading-relaxed text-slate-600 sm:text-base";

const SECTIONS = [
  { id: "information-we-collect", label: "1. Information we collect" },
  { id: "how-we-use-it", label: "2. How we use your information" },
  { id: "sensitive-health-information", label: "3. Sensitive health information" },
  { id: "how-we-protect-it", label: "4. How we protect your information" },
  { id: "data-retention", label: "5. Data retention" },
  { id: "third-party-services", label: "6. Third-party services" },
  { id: "cookies", label: "7. Cookies" },
  { id: "your-rights", label: "8. Your rights" },
  { id: "changes", label: "9. Changes to this policy" },
  { id: "contact-us", label: "10. Contact us" },
];

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const pharmacyName = settings?.pharmacyName || "Ingata Pharmacy";
  const email = settings?.email || "info@ingatapharmacy.rw";
  const phone = settings?.phone;
  const address = settings?.address || "Kigali, Rwanda";

  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" description={`Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`} />

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
            <LegalToc sections={SECTIONS} />

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                <Lock className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className={`${p} mt-5 max-w-2xl`}>
                <T
                  text={`${pharmacyName} ("we", "our" or "us") respects your privacy and is committed to protecting the personal information you share with us through this website. This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and the choices available to you.`}
                />
              </p>

              <div className="mt-10 space-y-10">
                <div id="information-we-collect" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="1. Information we collect" />
                  </h2>
                  <p className={p}>
                    <T text="We collect information you provide directly to us, including when you:" />
                  </p>
                  <ul className={`${ul} list-disc pl-5`}>
                    <li>
                      <T text="Submit a contact or general inquiry form." />
                    </li>
                    <li>
                      <T text="Submit a prescription refill request." />
                    </li>
                    <li>
                      <T text="Create an account to track your requests." />
                    </li>
                    <li>
                      <T text="Communicate with us by phone, email or WhatsApp." />
                    </li>
                  </ul>
                  <p className={p}>
                    <T text="This may include your full name, phone number, email address, preferred pharmacy branch, and — where you choose to provide it — medication names or prescription reference numbers needed to process your request. We also automatically collect limited technical information (such as browser type and pages visited) to help us keep the website secure and working correctly." />
                  </p>
                </div>

                <div id="how-we-use-it" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="2. How we use your information" />
                  </h2>
                  <p className={p}>
                    <T text="We use the information we collect to:" />
                  </p>
                  <ul className={`${ul} list-disc pl-5`}>
                    <li>
                      <T text="Respond to your inquiries and prescription refill requests." />
                    </li>
                    <li>
                      <T text="Verify and process requests with our licensed pharmacy staff." />
                    </li>
                    <li>
                      <T text="Contact you about the status of a request." />
                    </li>
                    <li>
                      <T text="Maintain the security and proper functioning of the website." />
                    </li>
                    <li>
                      <T text="Improve our services and the content we publish." />
                    </li>
                  </ul>
                  <p className={p}>
                    <T text="We do not sell your personal information to third parties." />
                  </p>
                </div>

                <div id="sensitive-health-information" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="3. Sensitive health information" />
                  </h2>
                  <p className={p}>
                    <T text="Where a prescription refill request includes medication names or prescription references, we treat this as sensitive information. Access is restricted to authorized pharmacy personnel, and we collect only what is reasonably necessary to process your request. Please avoid sharing more detailed medical information than requested through website forms — if a request requires supporting documents, our team will direct you to an appropriate secure channel." />
                  </p>
                </div>

                <div id="how-we-protect-it" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="4. How we protect your information" />
                  </h2>
                  <p className={p}>
                    <T text="We apply reasonable technical and organizational safeguards to protect the information you share with us, including secure transmission (HTTPS), access controls limiting who can view submitted requests, and restricted administrative access to our systems." />
                  </p>
                </div>

                <div id="data-retention" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="5. Data retention" />
                  </h2>
                  <p className={p}>
                    <T text="We retain personal information only for as long as necessary to fulfil the purpose it was collected for, respond to any follow-up questions, and meet our recordkeeping obligations as a pharmacy." />
                  </p>
                </div>

                <div id="third-party-services" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="6. Third-party services" />
                  </h2>
                  <p className={p}>
                    <T text="We may use trusted third-party services to operate this website, such as hosting providers and mapping services for locating our branches. These providers only receive the information necessary to perform their function and are not authorized to use it for any other purpose." />
                  </p>
                </div>

                <div id="cookies" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="7. Cookies" />
                  </h2>
                  <p className={p}>
                    <T text="This website currently does not use analytics or advertising cookies. If that changes, we will update this policy and, where required, request your consent before any non-essential cookies are set." />
                  </p>
                </div>

                <div id="your-rights" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="8. Your rights" />
                  </h2>
                  <p className={p}>
                    <T text="You may ask us what information we hold about you, request that it be corrected, or request that it be deleted where we are not required to keep it for legal or operational reasons. Contact us using the details below to make a request." />
                  </p>
                </div>

                <div id="changes" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="9. Changes to this policy" />
                  </h2>
                  <p className={p}>
                    <T text={'We may update this Privacy Policy from time to time. The "last updated" date at the top of this page reflects the most recent revision.'} />
                  </p>
                </div>

                <div id="contact-us" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="10. Contact us" />
                  </h2>
                  <p className={p}>
                    <T text="If you have questions about this Privacy Policy or how we handle your information, contact us at" />{" "}
                    <a href={`mailto:${email}`} className="font-medium text-teal-700 hover:text-teal-800">
                      {email}
                    </a>
                    {phone && (
                      <>
                        {" "}
                        <T text="or" />{" "}
                        <a href={`tel:${phone}`} className="font-medium text-teal-700 hover:text-teal-800">
                          {phone}
                        </a>
                      </>
                    )}
                    . <T text="Our address is" /> {address}. <T text="You can also reach us through our" />{" "}
                    <Link href="/contact" className="font-medium text-teal-700 hover:text-teal-800">
                      <T text="Contact page" />
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
