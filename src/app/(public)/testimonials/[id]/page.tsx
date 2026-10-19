import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Quote } from "lucide-react";
import { apiFetch, resolveUploadUrl } from "@/lib/api";
import type { Testimonial } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/lib/language-context";
import Image from "next/image";

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    return await apiFetch<Testimonial[]>("/api/testimonials", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const testimonials = await getTestimonials();
  const testimonial = testimonials.find((t) => t.id === id);
  if (!testimonial) {
    return {};
  }
  return {
    title: `${testimonial.customerName} | Ingata Pharmacy`,
    description: testimonial.testimonialText,
  };
}

export default async function TestimonialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonials = await getTestimonials();
  const testimonial = testimonials.find((t) => t.id === id);

  if (!testimonial) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Testimonial"
        title={testimonial.customerName}
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <T text="Back to testimonials" />
          </Link>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <blockquote className="mt-6">
              <p className="text-lg leading-relaxed text-slate-700">
                <T text={testimonial.testimonialText} />
              </p>
            </blockquote>

            <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
              {testimonial.photoUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                  <Image
                    src={resolveUploadUrl(testimonial.photoUrl)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-xl font-semibold text-teal-800">
                  {testimonial.customerName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-display text-lg font-semibold text-slate-900">
                  {testimonial.customerName}
                </p>
                {testimonial.customerCategory && (
                  <p className="text-sm text-slate-500">
                    <T text={testimonial.customerCategory} />
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
