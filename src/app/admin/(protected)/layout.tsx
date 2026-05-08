import type { CSSProperties, ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/security/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  const { theme } = await getSiteSettings();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div
      className="flex min-h-screen flex-col md:flex-row bg-white"
      style={
        {
          "--background": theme.background,
          "--foreground": theme.foreground,
          "--surface": theme.surface,
          "--surface-strong": theme.surfaceStrong,
          "--brand": theme.brand,
          "--brand-contrast": theme.brandContrast,
          "--muted": theme.muted,
          "--accent": theme.accent,
          "--terracotta": theme.terracotta,
          "--clay": theme.clay,
          "--line": theme.line,
          "--font-display": theme.fontDisplay,
          "--font-body": theme.fontBody,
          "--font-nav": theme.fontNav,
        } as CSSProperties
      }
    >
      <AdminNav />

      <main className="flex-1 overflow-y-auto bg-white">
        <div className="w-full px-4 py-6 sm:px-6 md:px-8 md:py-10 xl:px-10">
          <header className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Panneau de gestion
            </p>
            <hr className="mt-4 border-line/50" />
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
