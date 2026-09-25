import type { Metadata } from "next";
import Link from "next/link";
import { Pill } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { LegalToc } from "@/components/legal/LegalToc";
import { T } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Pharmacy Terms | Ingata Pharmacy",
  description: "The professional and operational terms that apply specifically to our pharmacy services.",
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
  { id: "who-these-terms-cover", label: "1. Who these terms cover" },
  { id: "professional-verification", label: "2. Professional verification" },
  { id: "prescription-validity", label: "3. Prescription validity" },
  { id: "substitution-and-availability", label: "4. Substitution & availability" },
  { id: "pickup-and-delivery", label: "5. Pickup & delivery" },
  { id: "refusal-of-service", label: "6. Refusal of service" },
  { id: "counselling-and-advice", label: "7. Counselling & advice" },
  { id: "record-keeping", label: "8. Record keeping" },
  { id: "relationship-to-other-terms", label: "9. Relationship to other terms" },
];

export default async function PharmacyTermsPage() {
  const settings = await getSiteSettings();
  const pharmacyName = settings?.pharmacyName || "Ingata Pharmacy";
  const phone = settings?.phone;

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Pharmacy Terms"
        description={`Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
            <LegalToc sections={SECTIONS} />

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                <Pill className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className={`${p} mt-5 max-w-2xl`}>
                <T
                  text={`These Pharmacy Terms sit alongside our general Terms & Conditions and cover the professional and operational rules specific to how ${pharmacyName} provides pharmacy services — prescription handling, dispensing and in-branch service, in particular. Where anything here conflicts with the general Terms & Conditions, these Pharmacy Terms apply for pharmacy-specific matters.`}
                />
              </p>

              <div className="mt-10 space-y-10">
                <div id="who-these-terms-cover" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="1. Who these terms cover" />
                  </h2>
                  <p className={p}>
                    <T text="These terms apply to anyone requesting a prescription, refill, or other pharmacy service from us, whether in person, by phone, or through this website. They do not apply to general browsing of website content, which is covered by our general Terms & Conditions." />
                  </p>
                </div>

                <div id="professional-verification" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="2. Professional verification" />
                  </h2>
                  <p className={p}>
                    <T text="Every prescription and refill request is reviewed by a licensed pharmacist before it is dispensed, regardless of how it was submitted. A pharmacist may contact you, your prescriber, or decline to dispense if a request cannot be verified, appears incomplete, or raises a safety concern." />
                  </p>
                </div>

                <div id="prescription-validity" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="3. Prescription validity" />
                  </h2>
                  <p className={p}>
                    <T text="Prescriptions are dispensed in line with their stated validity period and any refill limits set by the prescriber or required by regulation. An expired or exhausted prescription cannot be refilled without a new or renewed prescription from a qualified prescriber." />
                  </p>
                </div>

                <div id="substitution-and-availability" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="4. Substitution and availability" />
                  </h2>
                  <p className={p}>
                    <T text="Where a prescribed medicine is temporarily unavailable, a pharmacist may discuss a suitable, permitted alternative with you before substituting anything. We do not guarantee that any specific product will be in stock at any branch at any given time." />
                  </p>
                </div>

                <div id="pickup-and-delivery" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="5. Pickup and delivery" />
                  </h2>
                  <p className={p}>
                    <T text="Where delivery is offered, it is subject to the delivery area, fees and timing communicated to you at the time of your request. You are responsible for providing accurate contact and address details and for confirming receipt of any medication delivered on your behalf." />
                  </p>
                </div>

                <div id="refusal-of-service" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="6. Refusal of service" />
                  </h2>
                  <p className={p}>
                    <T text="Our pharmacists retain professional discretion to decline to dispense or provide a service where doing so is not in the customer's best interest, is not permitted by applicable regulation, or where a request cannot be adequately verified." />
                  </p>
                </div>

                <div id="counselling-and-advice" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="7. Counselling and advice" />
                  </h2>
                  <p className={p}>
                    <T text="Medication counselling provided by our pharmacists relates to the medicines we dispense to you and is not a substitute for a full clinical consultation. For diagnosis or treatment decisions, please see a qualified healthcare provider." />
                  </p>
                </div>

                <div id="record-keeping" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="8. Record keeping" />
                  </h2>
                  <p className={p}>
                    <T text="We keep records of prescriptions and refill requests we process, as required by pharmacy regulation and good dispensing practice. See our" />{" "}
                    <Link href="/privacy-policy" className="font-medium text-teal-700 hover:text-teal-800">
                      <T text="Privacy Policy" />
                    </Link>{" "}
                    <T text="for how this information is handled." />
                  </p>
                </div>

                <div id="relationship-to-other-terms" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="9. Relationship to other terms" />
                  </h2>
                  <p className={p}>
                    <T text="These Pharmacy Terms should be read together with our" />{" "}
                    <Link href="/terms-and-conditions" className="font-medium text-teal-700 hover:text-teal-800">
                      <T text="Terms & Conditions" />
                    </Link>{" "}
                    <T text="and" />{" "}
                    <Link href="/medical-disclaimer" className="font-medium text-teal-700 hover:text-teal-800">
                      <T text="Medical Disclaimer" />
                    </Link>
                    .{" "}
                    {phone && (
                      <>
                        <T text="Questions about any pharmacy service can be directed to our team at" />{" "}
                        <a href={`tel:${phone}`} className="font-medium text-teal-700 hover:text-teal-800">
                          {phone}
                        </a>
                        .
                      </>
                    )}
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
