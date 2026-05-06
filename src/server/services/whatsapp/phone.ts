export function normalizeWhatsAppPhone(input: string): string {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : `+${digits}`;
}

