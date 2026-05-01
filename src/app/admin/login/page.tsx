import { redirect } from "next/navigation";
import { createAdminSession, getAdminSession } from "@/server/security/auth";

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const success = await createAdminSession({ email, password });

  if (!success) {
    redirect("/admin/login?error=invalid_credentials");
  }

  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const hasError = params.error === "invalid_credentials";

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-6">
      <section className="w-full rounded-3xl border border-line bg-white p-8">
        <h1 className="font-serif text-4xl">Connexion admin</h1>
        <p className="mt-2 text-sm text-muted">Espace sécurisé.</p>
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block text-sm">
            Email
            <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Mot de passe
            <input name="password" type="password" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
          {hasError ? <p className="text-sm text-red-700">Identifiants invalides.</p> : null}
          <button type="submit" className="w-full rounded-xl bg-brand px-4 py-2 text-brand-contrast">Se connecter</button>
        </form>
      </section>
    </main>
  );
}
