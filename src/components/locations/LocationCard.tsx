import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { PharmacyLocation } from "@/types";
import { resolveUploadUrl } from "@/lib/api";
import { groupOpeningHours } from "@/lib/opening-hours";
import { T } from "@/lib/language-context";

// Shared between the homepage teaser and the full /locations directory.
// The live embedded Google Map lives only on the branch's own page
// (/locations/[slug]) — cards here just link through, with a static photo
// (or a branded gradient fallback) instead of a per-card map iframe.
//
// The photo is the background of the header band only, behind the branch name.
// Everything below it — address, phone, hours, services, links — stays on the
// white card body, so the image never fights with the small body text for
// contrast. Most branches have no photo uploaded yet, so the teal gradient
// doubles as the fallback.
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
  const hasPhoto = Boolean(location.photoUrl);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
      <div className="relative isolate">
        {/*
          Background layer, held behind the content with -z-10 so the branch name
          stays selectable and clickable.
        */}
        <div aria-hidden className="absolute inset-0 -z-10">
          {hasPhoto ? (
            <>
              <Image
                src={resolveUploadUrl(location.photoUrl as string)}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* Two stops: diagonal to darken the photo, teal to tie it to the brand. */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-teal-950/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900 to-teal-700" />
          )}
        </div>

        <Link
          href={branchHref}
          className="flex min-h-28 items-end p-6 text-white no-underline sm:min-h-32"
        >
          <h3 className="font-display text-xl font-semibold leading-snug transition-colors duration-200 group-hover:text-gold">
            {location.branchName}
          </h3>
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-3 text-sm text-slate-600">
          <p className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {location.address}
          </p>
          {location.telephone && (
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <a
                href={`tel:${location.telephone}`}
                className="transition-colors duration-200 hover:text-slate-900"
              >
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