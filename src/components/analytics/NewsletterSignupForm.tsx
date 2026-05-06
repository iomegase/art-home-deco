"use client";

import { trackNewsletterSignup } from "@/lib/analytics/events";

export function NewsletterSignupForm({
  placeholder,
  buttonLabel,
}: {
  placeholder: string;
  buttonLabel: string;
}) {
  return (
    <form
      className="mt-10 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        trackNewsletterSignup();
      }}
    >
      <input
        type="email"
        placeholder={placeholder}
        className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm placeholder:text-white/60 focus:bg-white focus:text-black focus:outline-none transition-all"
      />
      <button type="submit" className="w-full rounded-full bg-white py-4 text-sm font-bold text-terracotta transition-transform hover:scale-[1.02] active:scale-95">
        {buttonLabel}
      </button>
    </form>
  );
}
