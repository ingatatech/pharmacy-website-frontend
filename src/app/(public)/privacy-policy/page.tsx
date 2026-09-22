import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";

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
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
          <p className={p}>
            {pharmacyName} ("we", "our" or "us") respects your privacy and is committed to protecting the
            personal information you share with us through this website. This Privacy Policy explains what
            information we collect, why we collect it, how we use and protect it, and the choices available
            to you.
          </p>

          <div className="mt-10 space-y-10">
            <div>
              <h2 className={h2}>1. Information we collect</h2>
              <p className={p}>We collect information you provide directly to us, including when you:</p>
              <ul className={`${ul} list-disc pl-5`}>
                <li>Submit a contact or general inquiry form.</li>
                <li>Submit a prescription refill request.</li>
                <li>Create an account to track your requests.</li>
                <li>Communicate with us by phone, email or WhatsApp.</li>
              </ul>
              <p className={p}>
                This may include your full name, phone number, email address, preferred pharmacy branch,
                and — where you choose to provide it — medication names or prescription reference numbers
                needed to process your request. We also automatically collect limited technical information
                (such as browser type and pages visited) to help us keep the website secure and working
                correctly.
              </p>
            </div>

            <div>
              <h2 className={h2}>2. How we use your information</h2>
              <p className={p}>We use the information we collect to:</p>
              <ul className={`${ul} list-disc pl-5`}>
                <li>Respond to your inquiries and prescription refill requests.</li>
                <li>Verify and process requests with our licensed pharmacy staff.</li>
                <li>Contact you about the status of a request.</li>
                <li>Maintain the security and proper functioning of the website.</li>
                <li>Improve our services and the content we publish.</li>
              </ul>
              <p className={p}>We do not sell your personal information to third parties.</p>
            </div>

            <div>
              <h2 className={h2}>3. Sensitive health information</h2>
              <p className={p}>
                Where a prescription refill request includes medication names or prescription references,
                we treat this as sensitive information. Access is restricted to authorized pharmacy
                personnel, and we collect only what is reasonably necessary to process your request. Please
                avoid sharing more detailed medical information than requested through website forms — if a
                request requires supporting documents, our team will direct you to an appropriate secure
                channel.
              </p>
            </div>

            <div>
              <h2 className={h2}>4. How we protect your information</h2>
              <p className={p}>
                We apply reasonable technical and organizational safeguards to protect the information you
                share with us, including secure transmission (HTTPS), access controls limiting who can view
                submitted requests, and restricted administrative access to our systems.
              </p>
            </div>

            <div>
              <h2 className={h2}>5. Data retention</h2>
              <p className={p}>
                We retain personal information only for as long as necessary to fulfil the purpose it was
                collected for, respond to any follow-up questions, and meet our recordkeeping obligations as
                a pharmacy.
              </p>
            </div>

            <div>
              <h2 className={h2}>6. Third-party services</h2>
              <p className={p}>
                We may use trusted third-party services to operate this website, such as hosting providers
                and mapping services for locating our branches. These providers only receive the information
                necessary to perform their function and are not authorized to use it for any other purpose.
              </p>
            </div>

            <div>
              <h2 className={h2}>7. Cookies</h2>
              <p className={p}>
                This website currently does not use analytics or advertising cookies. If that changes, we
                will update this policy and, where required, request your consent before any non-essential
                cookies are set.
              </p>
            </div>

            <div>
              <h2 className={h2}>8. Your rights</h2>
              <p className={p}>
                You may ask us what information we hold about you, request that it be corrected, or request
                that it be deleted where we are not required to keep it for legal or operational reasons.
                Contact us using the details below to make a request.
              </p>
            </div>

            <div>
              <h2 className={h2}>9. Changes to this policy</h2>
              <p className={p}>
                We may update this Privacy Policy from time to time. The "last updated" date at the top of
                this page reflects the most recent revision.
              </p>
            </div>

            <div>
              <h2 className={h2}>10. Contact us</h2>
              <p className={p}>
                If you have questions about this Privacy Policy or how we handle your information, contact
                us at{" "}
                <a href={`mailto:${email}`} className="font-medium text-teal-700 hover:text-teal-800">
                  {email}
                </a>
                {phone && (
                  <>
                    {" "}
                    or{" "}
                    <a href={`tel:${phone}`} className="font-medium text-teal-700 hover:text-teal-800">
                      {phone}
                    </a>
                  </>
                )}
                . Our address is {address}. You can also reach us through our{" "}
                <Link href="/contact" className="font-medium text-teal-700 hover:text-teal-800">
                  Contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
