import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { LegalToc } from "@/components/legal/LegalToc";

export const metadata: Metadata = {
  title: "Medical Disclaimer | Ingata Pharmacy",
  description: "Important information about how to use the health and product content on this website.",
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

const SECTIONS = [
  { id: "general-educational-purpose", label: "General educational purpose" },
  { id: "product-information", label: "Product information" },
  { id: "prescription-and-refill-requests", label: "Prescription & refill requests" },
  { id: "vaccination-and-screening", label: "Vaccination & screening services" },
  { id: "in-an-emergency", label: "In an emergency" },
  { id: "questions", label: "Questions about your medicine" },
];

export default async function MedicalDisclaimerPage() {
  const settings = await getSiteSettings();
  const pharmacyName = settings?.pharmacyName || "Ingata Pharmacy";
  const phone = settings?.phone;

  return (
    <>
      <PageHeader eyebrow="Legal" title="Medical Disclaimer" description={`Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`} />

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
            <LegalToc sections={SECTIONS} />

            <div>
              <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={1.75} />
                <p className="text-sm leading-relaxed text-amber-900 sm:text-base">
                  The information provided on this website is intended for general educational and
                  informational purposes and does not replace professional medical or pharmaceutical advice,
                  diagnosis or treatment. Product information is provided for general reference and may not
                  apply to every individual. Customers should consult a qualified healthcare professional or
                  pharmacist regarding their specific health needs, medicines and treatment decisions.
                </p>
              </div>

              <div className="mt-10 space-y-10">
                <div id="general-educational-purpose" className="scroll-mt-28">
                  <h2 className={h2}>General educational purpose</h2>
                  <p className={p}>
                    Service descriptions, health articles, FAQs and similar content on this website are written
                    to help you understand what {pharmacyName} offers and to support general health awareness.
                    They are not a diagnosis, a treatment plan, or a recommendation for your specific situation.
                  </p>
                </div>

                <div id="product-information" className="scroll-mt-28">
                  <h2 className={h2}>Product information</h2>
                  <p className={p}>
                    Product information is provided for general informational purposes. Product availability,
                    packaging, formulations, indications, precautions and other details may change. Please
                    consult a pharmacist or qualified healthcare professional for advice appropriate to your
                    individual circumstances before starting, stopping or changing any medication.
                  </p>
                </div>

                <div id="prescription-and-refill-requests" className="scroll-mt-28">
                  <h2 className={h2}>Prescription and refill requests</h2>
                  <p className={p}>
                    Submitting a prescription or refill request through this website does not constitute
                    prescription approval, renewal, dispensing or confirmation of product availability. All
                    requests are subject to verification and review by authorized pharmacy personnel and
                    applicable regulatory requirements.
                  </p>
                </div>

                <div id="vaccination-and-screening" className="scroll-mt-28">
                  <h2 className={h2}>Vaccination and screening services</h2>
                  <p className={p}>
                    Where mentioned, vaccination and health-screening services are subject to eligibility,
                    professional assessment and availability at the relevant branch. Website content about these
                    services does not replace an in-person professional assessment.
                  </p>
                </div>

                <div id="in-an-emergency" className="scroll-mt-28">
                  <h2 className={h2}>In an emergency</h2>
                  <p className={p}>
                    If you are experiencing a medical emergency, do not rely on this website. Contact your local
                    emergency services immediately
                    {phone && (
                      <>
                        , or call us directly at{" "}
                        <a href={`tel:${phone}`} className="font-medium text-teal-700 hover:text-teal-800">
                          {phone}
                        </a>{" "}
                        for urgent pharmacy questions
                      </>
                    )}
                    .
                  </p>
                </div>

                <div id="questions" className="scroll-mt-28">
                  <h2 className={h2}>Questions about your medicine</h2>
                  <p className={p}>
                    If you have questions about a medicine you have been prescribed or are considering, speak
                    with one of our licensed pharmacists directly, either in person, by phone, or through our{" "}
                    <Link href="/contact" className="font-medium text-teal-700 hover:text-teal-800">
                      Contact page
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
