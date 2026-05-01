import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand/25 bg-surface/75">
      <Container className="flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Art Home Deco. Tous droits reserves.</p>
        <div className="flex gap-3">
          <Link href="/blog" className="hover:text-brand">
            Inspirations
          </Link>
          <Link href="/contact" className="hover:text-brand">
            Contact
          </Link>
          <Link href="/boutique" className="hover:text-brand">
            Collection
          </Link>
        </div>
      </Container>
    </footer>
  );
}
