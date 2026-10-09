import Image from "next/image";
import { Quote, Star } from "lucide-react";
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

        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-2">
          {testimonials.slice(0, 6).map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex w-[17rem] shrink-0 snap-start flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-80"
            >
              <div className="flex items-center justify-between">
                <Quote className="h-5 w-5 shrink-0 fill-teal-100 text-teal-100" strokeWidth={0} aria-hidden />
                <div
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label={`${testimonial.starRating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < testimonial.starRating ? "fill-gold text-gold" : "fill-slate-200 text-slate-200"
                      }`}
                      strokeWidth={0}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                <T text={testimonial.testimonialText} />
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                {testimonial.photoUrl ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    <Image
                      src={resolveUploadUrl(testimonial.photoUrl)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-800">
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
