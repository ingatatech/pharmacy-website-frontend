import { T } from "@/lib/language-context";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">
        <T text="Page not found" />
      </h1>
      <p className="text-sm text-gray-500">
        <T text="The page you're looking for doesn't exist." />
      </p>
    </main>
  );
}
