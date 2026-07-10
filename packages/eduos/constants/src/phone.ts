/** Detect if input looks like an Indian mobile number */
export function isPhoneNumber(input: string): boolean {
  const cleaned = input.replace(/\s|-/g, "");
  return /^(\+91|0)?[6-9]\d{9}$/.test(cleaned);
}

/** Normalize to E.164 (+91...) */
export function normalizeToE164(input: string): string {
  const cleaned = input.replace(/\s|-/g, "");
  if (cleaned.startsWith("+91")) return cleaned;
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+91${cleaned.slice(1)}`;
  }
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  return cleaned;
}
