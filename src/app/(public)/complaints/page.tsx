import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { LegalToc } from "@/components/legal/LegalToc";
import { T } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Complaints & Customer Care | Ingata Pharmacy",
  description: "How to raise a concern or complaint with Ingata Pharmacy, and what to expect once you do.",
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
  { id: "what-you-can-raise", label: "1. What you can raise with us" },
  { id: "how-to-reach-us", label: "2. How to reach us" },
  { id: "what-happens-next", label: "3. What happens next" },
  { id: "if-youre-not-satisfied", label: "4. If you're not satisfied" },
  { id: "urgent-safety-concerns", label: "5. Urgent safety concerns" },
];

export default async function ComplaintsPage() {
  const settings = await getSiteSettings();
  const pharmacyName = settings?.pharmacyName || "Ingata Pharmacy";
  const phone = settings?.phone;
  const email = settings?.email;

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Complaints & Customer Care"
        description={`Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
            <LegalToc sections={SECTIONS} />

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className={`${p} mt-5 max-w-2xl`}>
                <T
                  text={`We want to know if something didn't go the way it should have — whether it's about a service, a product, how you were treated at a branch, or anything else related to ${pharmacyName}. Raising a concern helps us fix it, and it doesn't affect the service you'll receive from us going forward.`}
                />
              </p>

              <div className="mt-10 space-y-10">
                <div id="what-you-can-raise" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="1. What you can raise with us" />
                  </h2>
                  <p className={p}>
                    <T text="This includes concerns about a prescription or refill request, a product you received, wait times or service at a branch, billing, staff conduct, or anything else connected to your experience with us." />
                  </p>
                </div>

                <div id="how-to-reach-us" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="2. How to reach us" />
                  </h2>
                  <p className={p}>
                    <T text="The fastest way to reach us is through our" />{" "}
                    <Link href="/contact" className="font-medium text-teal-700 hover:text-teal-800">
                      <T text="Contact page" />
                    </Link>
                    .{" "}
                    {phone && (
                      <>
                        <T text="You can also call us at" />{" "}
                        <a href={`tel:${phone}`} className="font-medium text-teal-700 hover:text-teal-800">
                          {phone}
                        </a>
                        {email ? ", " : ". "}
                      </>
                    )}
                    {email && (
                      <>
                        <T text="or email" />{" "}
                        <a href={`mailto:${email}`} className="font-medium text-teal-700 hover:text-teal-800">
                          {email}
                        </a>
                        .{" "}
                      </>
                    )}
                    <T text="You're also welcome to speak with a branch manager directly, in person." />
                  </p>
                </div>

                <div id="what-happens-next" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="3. What happens next" />
                  </h2>
                  <p className={p}>
                    <T text="We aim to acknowledge every complaint promptly and look into it properly rather than rush a response. Depending on what you've raised, this may involve a pharmacist reviewing what happened, speaking with the branch involved, or following up with you for more detail. We'll let you know the outcome using the contact details you provide." />
                  </p>
                </div>

                <div id="if-youre-not-satisfied" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="4. If you're not satisfied with our response" />
                  </h2>
                  <p className={p}>
                    <T
                      text={`If you feel your complaint hasn't been resolved properly, you can ask for it to be reviewed by pharmacy management. Where a concern relates to professional pharmacy practice and can't be resolved between us, you also have the right to raise it with the relevant pharmacy regulatory authority in Rwanda.`}
                    />
                  </p>
                </div>

                <div id="urgent-safety-concerns" className="scroll-mt-28">
                  <h2 className={h2}>
                    <T text="5. Urgent safety concerns" />
                  </h2>
                  <p className={p}>
                    <T text="If you believe you've experienced an adverse reaction to a medicine, or have an urgent safety concern, do not wait for a written response — contact your nearest branch directly or seek medical attention immediately. See our" />{" "}
                    <Link href="/medical-disclaimer" className="font-medium text-teal-700 hover:text-teal-800">
                      <T text="Medical Disclaimer" />
                    </Link>{" "}
                    <T text="for what to do in an emergency." />
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
