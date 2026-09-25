import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { resolveUploadUrl } from "@/lib/api";
import { initials } from "@/lib/text";
import { T } from "@/lib/language-context";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-teal-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="text-center">
          <span className="text-sm font-medium text-teal-600">
            <T text="What customers say" />
          </span>
          <h2 className="mx-auto mt-2 max-w-lg font-display text-3xl font-medium text-slate-900 sm:text-4xl">
            <T text="Trusted by the communities we serve" />
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Quote className="h-5 w-5 shrink-0 fill-teal-100 text-teal-100" strokeWidth={0} aria-hidden />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                <T text={testimonial.testimonialText} />
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                {testimonial.photoUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    <Image
                      src={resolveUploadUrl(testimonial.photoUrl)}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-800">
                    {initials(testimonial.customerName)}
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{testimonial.customerName}</p>
                  {testimonial.customerCategory && (
                    <p className="text-xs text-slate-500">
                      <T text={testimonial.customerCategory} />
                    </p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
