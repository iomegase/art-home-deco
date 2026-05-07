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
      <div className="flex items-center justify-between border-b border-line bg-background px-5 py-4 md:hidden">
        <Link href="/admin/home" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div>
            <p className="font-serif text-lg font-bold tracking-tight text-foreground">Art Home</p>
            <p className="text-[10px] uppercase tracking-widest text-muted">Dashboard</p>
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="border border-line p-2 transition-colors hover:bg-surface"
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
        className={`fixed inset-y-0 left-0 z-[70] w-72 transform border-r border-line bg-background transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-5 md:p-6">
          <div className="flex items-center justify-between border-b border-line pb-6">
            <Link href="/admin/home" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Art Home Déco Logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold leading-none text-foreground">Art Home</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-muted">Dashboard</span>
              </div>
            </Link>
            <button onClick={() => setIsOpen(false)} className="p-1 text-muted md:hidden">
              <X size={20} />
            </button>
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Navigation</p>
          </div>

          <nav className="mt-3 flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand text-brand-contrast"
                      : "text-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center ${
                      isActive ? "text-brand-contrast" : "text-foreground"
                    }`}
                  >
                    <item.icon size={18} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-line pt-5">
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
              >
                <span className="flex h-8 w-8 items-center justify-center">
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
