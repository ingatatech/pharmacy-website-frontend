import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Glasses, HeartPulse, Leaf, Pill, SoapDispenserDroplet } from "lucide-react";
import type { Category, Product } from "@/types";
import { T } from "@/lib/language-context";

/**
 * Teaser for the product range, linking into /products?category=…
 *
 * Built around categories rather than individual products, because that is what
 * the data supports today: most products have no image, so a product-photo grid
 * would render as a row of identical grey placeholders. A category tile is
 * honest about that and still gives a route into the catalog.
 *
 * Tiles are driven by the *category* list, not by the products, so a range that
 * has been set up but not stocked yet still gets a tile. Otherwise adding a
 * category in the admin and waiting to fill it would silently drop it off the
 * homepage, and the grid would be a different size every time stock changed.
 *
 * A tile is an <article>, not a link, and the click target is a stretched link
 * inside it. That is deliberate: when a cart arrives, an "Add to cart" button
 * can sit inside the tile as a sibling. Nesting a button inside an anchor is
 * invalid HTML and makes the button's own clicks unreliable.
 */

// Two products per tile. Enough to suggest a range without turning the tile into
// a miniature catalog.
const EXAMPLES_PER_TILE = 2;

// Four fills the 2x2 grid the layout is drawn around. Capping here rather than
// in the grid class means a fifth category simply isn't shown, and the section
// stays 2x2 however large the catalog grows.
const MAX_TILES = 4;

// Keyed on the category slug so the icon is stable even if the name is edited.
// Anything unmatched falls back to the default rather than rendering nothing.
const ICONS: Record<string, typeof Pill> = {
  "pain-relief": Pill,
  "personal-care": SoapDispenserDroplet,
  "vitamins-supplements": Leaf,
  "eye-glasses": Glasses,
};

function categoryIcon(slug: string, className: string) {
  const Icon = ICONS[slug] ?? HeartPulse;
  return <Icon className={className} strokeWidth={1.75} />;
}

type Range = {
  id: string;
  name: string;
  slug: string;
  count: number;
  examples: Product[];
  // Position of this range's most recent product in the newest-first product
  // list, or -1 for a range with nothing stocked yet. Used only for ordering.
  latestRank: number;
};

function buildRanges(categories: Category[], products: Product[]): Range[] {
  // Index products by category in one pass, recording how recently each
  // category was stocked.
  const byCategory = new Map<
    string,
    { count: number; examples: Product[]; latestRank: number }
  >();

  products.forEach((product, index) => {
    const categoryId = product.category?.id;
    if (!categoryId) return;

    const entry = byCategory.get(categoryId) ?? {
      count: 0,
      examples: [],
      latestRank: index,
    };

    entry.count += 1;
    if (entry.examples.length < EXAMPLES_PER_TILE) {
      entry.examples.push(product);
    }
    byCategory.set(categoryId, entry);
  });

  const ranges = categories.map((category) => {
    const entry = byCategory.get(category.id);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: entry?.count ?? 0,
      examples: entry?.examples ?? [],
      latestRank: entry?.latestRank ?? -1,
    };
  });

  // Stocked ranges first, most recently stocked at the top, so a range that has
  // just been added to the catalog surfaces on its own. Empty ranges sink to the
  // bottom of the grid instead of pushing real tiles out of view.
  return ranges
    .sort((a, b) => b.latestRank - a.latestRank)
    .slice(0, MAX_TILES);
}

export function ProductsSection({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const ranges = buildRanges(categories, products);

  if (ranges.length === 0) {
    return null;
  }

  return (
    // Same background as the Find Us section, with the border the other
    // same-background sections use so the two don't merge into one block.
    <section className="relative overflow-hidden border-t border-teal-100 bg-sage">
      {/* The photo fills the whole section rather than sitting behind each tile:
          four copies of one image across a 2x2 grid reads as a rendering fault,
          and repeating it costs four DOM subtrees to show the same pixels.

          The scrim is what makes this treatment work. The source is a 3000x4000
          portrait at a mid-tone mean luminance, so the slate-900 heading and the
          sage-600 labels have no contrast on it unaided. At /50 the darkest
          regions still lift to roughly 8:1 against slate-900 while the image
          stays perceptible as a wash — heavier settings erase it. */}
      <Image
        src="/productsection-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-white/50" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-teal-600">
              <T text="Shop our range" />
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              <T text="Our product categories" />
            </h2>
          </div>
          <Link
            href="/products"
            className="rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <T text="View all products" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* Tiles are translucent so the section photo reads continuously
              through them and the gutters rather than stopping dead at every
              card edge. The blur keeps the labels off whatever sits behind
              them, and the composited result is still opaque enough for the
              white-on-teal hover to cover cleanly. */}
          {ranges.map((range) => (
            <article
              key={range.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/75 backdrop-blur-sm p-7 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-teal-800 hover:shadow-lg"
            >
              {/* Same mechanic as the service cards — a panel growing behind
                  the content rather than a plain colour swap — rotated to
                  rise from the bottom edge upward. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-0 bg-teal-800 transition-[height] duration-300 ease-out group-hover:h-full"
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-ink transition-colors duration-300 group-hover:bg-white">
                  {categoryIcon(range.slug, "h-7 w-7")}
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-white">
                  <T text={range.name} />
                </h3>
                <p className="mt-1 text-sm text-slate-500 transition-colors duration-300 group-hover:text-white/75">
                  {range.count} {range.count === 1 ? "product" : "products"}
                </p>

                {range.examples.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-600 transition-colors duration-300 group-hover:text-white/85">
                    {range.examples.map((product) => (
                      <li key={product.id} className="truncate">
                        <T text={product.name} />
                      </li>
                    ))}
                  </ul>
                )}

                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-300 group-hover:text-white">
                  <T text="View range" />
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>

              {/* Stretched over the whole tile, so the visible "View range" text
                  and any future button can both sit above it. */}
              <Link
                href={`/products?category=${range.slug}`}
                aria-label={`View all ${range.name} products`}
                className="absolute inset-0 z-20 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
