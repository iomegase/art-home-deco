import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  const styles =
    variant === "primary"
      ? "bg-brand text-brand-contrast hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(31,47,71,0.28)]"
      : "border border-line bg-surface text-foreground hover:bg-accent/30";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 ${styles}`}
    >
      {children}
    </Link>
  );
}
