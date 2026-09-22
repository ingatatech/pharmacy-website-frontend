import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Terms & Conditions | Ingata Pharmacy",
  description: "The terms and conditions governing your use of the Ingata Pharmacy website.",
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

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const pharmacyName = settings?.pharmacyName || "Ingata Pharmacy";
  const email = settings?.email || "info@ingatapharmacy.rw";

  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" description={`Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`} />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
          <p className={p}>
            These Terms & Conditions govern your use of the {pharmacyName} website. By accessing or using
            this website, you agree to these terms. If you do not agree, please do not use the website.
          </p>

          <div className="mt-10 space-y-10">
            <div>
              <h2 className={h2}>1. Use of this website</h2>
              <p className={p}>
                This website is provided to help you learn about {pharmacyName}, our services and our
                approved product range, find our branches, and communicate with our team. You agree to use
                the website only for lawful purposes and not to submit false, misleading or fraudulent
                information through any form on this site.
              </p>
            </div>

            <div>
              <h2 className={h2}>2. Not a substitute for professional advice</h2>
              <p className={p}>
                Content on this website — including service descriptions, product information and health
                articles — is provided for general informational purposes only and does not constitute
                medical or pharmaceutical advice. See our{" "}
                <Link href="/medical-disclaimer" className="font-medium text-teal-700 hover:text-teal-800">
                  Medical Disclaimer
                </Link>{" "}
                for details.
              </p>
            </div>

            <div>
              <h2 className={h2}>3. Prescription and refill requests</h2>
              <p className={p}>
                Submitting a prescription refill or medication-related request through this website does not
                constitute approval, renewal, dispensing or confirmation of availability. Every request is
                subject to verification and review by authorized, licensed pharmacy personnel before it is
                fulfilled.
              </p>
            </div>

            <div>
              <h2 className={h2}>4. Product information</h2>
              <p className={p}>
                Product details shown on this website (such as descriptions, active ingredients, dosage
                information and availability) are provided for general reference. Packaging, formulations,
                pricing and availability may change without notice and may vary by branch. Please confirm
                current details with a pharmacist before making a decision based on this website.
              </p>
            </div>

            <div>
              <h2 className={h2}>5. Accounts</h2>
              <p className={p}>
                If you create an account to track your requests, you are responsible for keeping your login
                details confidential and for all activity under your account. Contact us immediately if you
                believe your account has been used without your permission.
              </p>
            </div>

            <div>
              <h2 className={h2}>6. Intellectual property</h2>
              <p className={p}>
                The text, images, logo and design of this website belong to {pharmacyName} or its licensors
                and may not be copied, reproduced or used commercially without our prior written permission.
              </p>
            </div>

            <div>
              <h2 className={h2}>7. Third-party links</h2>
              <p className={p}>
                This website may link to third-party services, such as maps or social media platforms. We
                are not responsible for the content, accuracy or practices of any third-party site.
              </p>
            </div>

            <div>
              <h2 className={h2}>8. Limitation of liability</h2>
              <p className={p}>
                To the fullest extent permitted by law, {pharmacyName} is not liable for any loss or damage
                arising from your use of this website, reliance on its content, or delays in responding to a
                submitted request. Nothing in these terms excludes liability that cannot be excluded under
                applicable law.
              </p>
            </div>

            <div>
              <h2 className={h2}>9. Changes to these terms</h2>
              <p className={p}>
                We may update these Terms & Conditions from time to time. Continued use of the website after
                changes are published means you accept the updated terms.
              </p>
            </div>

            <div>
              <h2 className={h2}>10. Governing law</h2>
              <p className={p}>These terms are governed by the laws of the Republic of Rwanda.</p>
            </div>

            <div>
              <h2 className={h2}>11. Contact us</h2>
              <p className={p}>
                Questions about these terms can be sent to{" "}
                <a href={`mailto:${email}`} className="font-medium text-teal-700 hover:text-teal-800">
                  {email}
                </a>{" "}
                or through our{" "}
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
