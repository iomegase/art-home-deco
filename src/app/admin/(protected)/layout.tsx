import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/security/auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <h1 className="font-serif text-3xl">Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/products">Produits</Link>
          <Link href="/admin/blog">Blog</Link>
          <Link href="/admin/orders">Commandes</Link>
          <Link href="/admin/clients">Clients</Link>
          <Link href="/admin/settings">Paramètres</Link>
          <form action="/admin/logout" method="post">
            <button type="submit" className="underline">Déconnexion</button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
