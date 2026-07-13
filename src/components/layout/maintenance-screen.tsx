import type { LegalSettings } from "@/features/admin-home/types";

export function MaintenanceScreen({ legal }: { legal: LegalSettings }) {
  const email = legal.email && !legal.email.startsWith("[") ? legal.email : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center">
      <meta name="robots" content="noindex" />
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#bd6745]">
        {legal.commercialName}
      </p>
      <h1 className="mt-6 text-[34px] font-semibold leading-tight tracking-[-0.02em] text-[#181713] md:text-[44px]">
        Site en maintenance
      </h1>
      <p className="mt-4 max-w-md text-[15px] text-[#6f6a5d]">
        De retour bientôt.
      </p>
      {email ? (
        <a
          href={`mailto:${email}`}
          className="mt-8 inline-flex items-center rounded-full border border-[#181713] px-5 py-2.5 text-[13px] font-semibold text-[#181713] transition hover:bg-[#181713] hover:text-white"
        >
          Nous contacter
        </a>
      ) : null}
    </main>
  );
}
