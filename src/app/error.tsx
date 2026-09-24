"use client";

import { T } from "@/lib/language-context";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">
        <T text="Something went wrong" />
      </h1>
      <button onClick={() => reset()} className="rounded border px-4 py-2 text-sm">
        <T text="Try again" />
      </button>
    </main>
  );
}
