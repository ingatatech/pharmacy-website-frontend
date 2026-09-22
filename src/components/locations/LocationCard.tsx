import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { PharmacyLocation } from "@/types";
import { groupOpeningHours } from "@/lib/opening-hours";

// Shared between the homepage teaser and the full /locations directory.
export function LocationCard({
  location,
  serviceNames = [],
}: {
  location: PharmacyLocation;
  serviceNames?: string[];
}) {
  const hourLines = location.openingHours ? groupOpeningHours(location.openingHours) : [];
  const hasCoordinates = location.latitude != null && location.longitude != null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
      {/* Accent bar grows in from the left on hover — the same "panel
          sweeps in" mechanic as qtglobal.rw's cards, scaled down to fit a
          text-dense info card instead of darkening the whole thing. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-teal-600 transition-transform duration-300 ease-out group-hover:scale-x-100"
      />

      <h3 className="font-display text-xl font-semibold text-slate-900 transition-colors duration-200 group-hover:text-teal-700">
        {location.branchName}
      </h3>

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
                <p key={line}>{line}</p>
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
              {name}
            </span>
          ))}
        </div>
      )}

      {hasCoordinates && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
        >
          <Navigation className="h-3.5 w-3.5" />
          Get directions
        </a>
      )}
    </div>
  );
}
