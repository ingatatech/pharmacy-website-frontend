import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { Testimonial } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/lib/language-context";
import { Quote } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Testimonials | Ingata Pharmacy",
  description: "What our customers say about their experience with Ingata Pharmacy.",
};

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    return await apiFetch<Testimonial[]>("/api/testimonials", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title="What our customers say"
        description="Real experiences from people who trust Ingata Pharmacy with their health."
        variant="image"
      />

      <section className="bg-sage">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          {testimonials.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="rounded-2xl border border-slate-200 bg-white p-8"
                >
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    <T text={testimonial.testimonialText} />
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    {testimonial.photoUrl ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                        <Image
                          src={testimonial.photoUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-800">
                        {testimonial.customerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{testimonial.customerName}</p>
                      {testimonial.customerCategory && (
                        <p className="text-sm text-slate-500">
                          <T text={testimonial.customerCategory} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl text-center">
              <Quote className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-4 font-display text-2xl font-medium text-slate-900">
                <T text="Testimonials coming soon" />
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                <T text="Customer stories will be shared here. Check back soon to hear from our community." />
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
