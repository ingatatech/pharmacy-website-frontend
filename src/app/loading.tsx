import { T } from "@/lib/language-context";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-sm text-gray-500">
        <T text="Loading…" />
      </p>
    </main>
  );
}
