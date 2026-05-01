
import Link from "next/link";

const links = [
  { href: "/boutique", label: "Shop" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="font-serif text-3xl leading-none text-foreground transition-opacity hover:opacity-75"
        >
          Art Home Deco
        </Link>

        <nav aria-label="Navigation principale">
          <ul className="flex items-center gap-4 text-xs font-semibold text-foreground md:gap-7 md:text-sm">
            {links.slice(0, 3).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-terracotta">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/panier" className="transition-colors hover:text-terracotta">
                Cart (0)
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
