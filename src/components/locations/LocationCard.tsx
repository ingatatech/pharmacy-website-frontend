import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { PharmacyLocation } from "@/types";
import { resolveUploadUrl } from "@/lib/api";
import { groupOpeningHours } from "@/lib/opening-hours";
import { T } from "@/lib/language-context";

// Shared between the homepage teaser and the full /locations directory.
// The live embedded Google Map now lives only on the branch's own page
// (/locations/[slug]) — cards here just link through, with a static photo
// (or an accent-bar fallback) instead of a per-card map iframe.
export function LocationCard({
  location,
  serviceNames = [],
}: {
  location: PharmacyLocation;
  serviceNames?: string[];
}) {
  const hourLines = location.openingHours ? groupOpeningHours(location.openingHours) : [];
  const hasCoordinates = location.latitude != null && location.longitude != null;
  const branchHref = `/locations/${location.slug}`;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
      <Link href={branchHref} className="block">
        {location.photoUrl ? (
          <div className="relative h-36 w-full overflow-hidden bg-slate-100">
            <Image
              src={resolveUploadUrl(location.photoUrl)}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        ) : (
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-teal-600 transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
        )}
      </Link>

      <div className="p-7">
        <Link
          href={branchHref}
          className="relative inline-block text-slate-900 no-underline after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-gold after:transition-all after:content-[''] hover:after:w-full"
        >
          <h3 className="font-display text-xl font-semibold transition-colors duration-200 group-hover:text-teal-700">
            {location.branchName}
          </h3>
        </Link>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {location.address}
          </p>
          {location.telephone && (
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <a href={`tel:${location.telephone}`} className="hover:text-slate-900">
                {location.telephone}
              </a>
            </p>
          )}
          {hourLines.length > 0 && (
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div className="space-y-0.5">
                {hourLines.map((line) => (
                  <p key={line}>
                    <T text={line} />
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {serviceNames.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {serviceNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                <T text={name} />
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {hasCoordinates && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
            >
              <Navigation className="h-3.5 w-3.5" />
              <T text="Get directions" />
            </a>
          )}
          <Link
            href={branchHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900"
          >
            <T text="View branch" />
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
