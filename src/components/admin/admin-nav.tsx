"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FileText,
  Store,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";

type AdminNavProps = {
  productCount: number;
  blogCount: number;
  userName: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  color: string;
  bg: string;
  count?: number;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function SidebarContent({
  pathname,
  onClose,
  navItems,
  userName,
}: {
  pathname: string;
  onClose?: () => void;
  navItems: NavItem[];
  userName: string;
}) {
  const initials = getInitials(userName);

  return (
    <div className="flex h-full flex-col bg-[#f7f7f8]">
      <div className="border-b border-[#ececef] px-5 py-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/home" onClick={onClose} className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#e8eaef] bg-[#f3f4f6] shadow-[0_1px_2px_rgba(15,17,21,0.06)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Art Home" className="h-8 w-8 object-contain" />
            </span>
            <span>
              <span className="block text-[14px] font-semibold tracking-[-0.02em] text-[#111]">Art Home</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Admin</span>
            </span>
          </Link>

          {onClose ? (
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#e6e8ee] text-slate-500 hover:bg-white md:hidden"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-b border-[#ececef] px-4 py-5">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-[#ececef] bg-white px-4 py-3 text-left shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        >
          <Search size={22} className="text-slate-500" />
          <span className="text-[12px] text-slate-500">Recherche</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-xl border border-[#e6e8ee] px-3 py-1.5 text-[12px] text-slate-400">
            ⌘ <span className="text-[12px]">K</span>
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-4 rounded-3xl px-3 py-3 transition"
                style={active ? { backgroundColor: "#f6ecdf" } : undefined}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
                  style={{ backgroundColor: active ? item.color : item.bg, color: active ? "#fff" : item.color }}
                >
                  <item.icon size={24} strokeWidth={2} />
                </span>
                <span className="text-[12px] font-semibold text-[#111]">{item.label}</span>
                {typeof item.count === "number" ? (
                  <span
                    className="ml-auto rounded-2xl px-3 py-1 text-[12px] leading-none"
                    style={active ? { color: item.color, backgroundColor: "#fff" } : { color: "#7f8ea8", backgroundColor: "#f1f3f6" }}
                  >
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#ececef] px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl bg-[#fcfcfd]">
          <div className="relative">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#111827] text-[20px] font-semibold text-white">{initials}</div>
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#fcfcfd] bg-[#10b981]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-[#171923]">{userName}</p>
            <p className="text-[12px] text-slate-500">Connectée</p>
          </div>
          <form action="/admin/logout" method="post">
            <button type="submit" className="grid h-12 w-12 place-items-center rounded-2xl border border-[#ececef] bg-white text-[#ef4444] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-[#fff5f5]" aria-label="Se déconnecter">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminNav({ productCount, blogCount, userName }: AdminNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/admin/home", label: "Dashboard", icon: LayoutDashboard, color: "#6366f1", bg: "#eef2ff" },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, color: "#8b5cf6", bg: "#f3efff" },
    { href: "/admin/products", label: "Produits", icon: Package, color: "#f97316", bg: "#fff1e6", count: productCount },
    { href: "/admin/shopcaisse", label: "Shopcaisse", icon: Store, color: "#7c3aed", bg: "#f3efff" },
    { href: "/admin/blog", label: "Blog", icon: FileText, color: "#ec4899", bg: "#fdecf4", count: blogCount },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingCart, color: "#10b981", bg: "#e9faf2" },
    { href: "/admin/clients", label: "Clients", icon: Users, color: "#ef4444", bg: "#fdecec" },
    { href: "/admin/settings", label: "Paramètres", icon: Settings, color: "#64748b", bg: "#f1f3f6" },
  ];

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#ececef] bg-[#fcfcfd] px-4 py-3 md:hidden">
        <Link href="/admin/home" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e6e8ee] bg-[#f3f4f6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Art Home" className="h-6 w-6 object-contain" />
          </span>
          <span>
            <span className="block text-[12px] font-semibold leading-none text-[#171923]">Art Home</span>
            <span className="block text-[12px] uppercase tracking-[0.08em] text-[#6366f1]">Admin</span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-[#e6e8ee] text-slate-600"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[292px] border-r border-[#ececef] bg-[#fcfcfd] transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent pathname={pathname} navItems={navItems} userName={userName} onClose={() => setIsOpen(false)} />
      </aside>
    </>
  );
}
