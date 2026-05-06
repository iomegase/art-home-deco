"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin/home", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-between border-b border-line/40 bg-white px-5 py-4 md:hidden">
        <Link href="/admin/home" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-contain"
          />
          <div>
            <p className="font-serif text-lg font-bold tracking-tight text-foreground">Art Home</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Console</p>
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-line/60 p-2 transition-colors hover:bg-surface"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-72 transform border-r border-line/40 bg-white transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-5 md:p-6">
          <div className="rounded-[2rem] border border-line/50 bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <Link href="/admin/home" className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Art Home Déco Logo"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full border border-line/40 object-contain bg-white"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold leading-none text-foreground">Art Home</span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted">Dashboard</span>
                </div>
              </Link>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1 text-muted md:hidden">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-[1.5rem] bg-foreground px-4 py-4 text-background">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-background/60">Workspace</p>
              <p className="mt-2 font-serif text-2xl leading-none">Editorial & Commerce</p>
              <p className="mt-2 text-sm text-background/70">Pilotage centralise des contenus, ventes et signaux boutique.</p>
            </div>
          </div>

          <div className="mt-8 px-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">Navigation</p>
          </div>

          <nav className="mt-3 flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-terracotta text-white shadow-[0_14px_30px_rgba(189,103,69,0.22)]"
                      : "border border-transparent text-foreground hover:border-line/50 hover:bg-surface/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                        isActive ? "bg-white/16 text-white" : "bg-surface text-foreground"
                      }`}
                    >
                      <item.icon size={18} />
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      isActive ? "bg-white" : "bg-line/80 group-hover:bg-terracotta/60"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-line/40 pt-5">
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl border border-line/50 px-4 py-3 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50">
                  <LogOut size={18} />
                </span>
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
