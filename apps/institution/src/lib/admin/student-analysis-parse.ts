const ROLL_KEYWORDS =
  /(?:roll\s*(?:no\.?|number|#)?|admission\s*(?:no\.?|number|#)?|student\s*(?:id|no\.?|number|#)?)\s*[:\-]?\s*([A-Za-z0-9][\w-]*)/i;

const QUOTED_ID = /["']([A-Za-z0-9][\w-]*)["']/;

const COMMON_ID = /\b(STU-[A-Z0-9-]+|ADM-[A-Z0-9-]+)\b/i;

const PERFORMANCE_INTENT =
  /\b(performance|analysis|analyse|analyze|report|marks?|attendance|progress|how\s+is|status|doing|summary|overview)\b/i;

export function isPerformanceQuery(message: string): boolean {
  return PERFORMANCE_INTENT.test(message.trim());
}

export function extractRollNumber(message: string): string | null {
  const text = message.trim();
  if (!text) return null;

  const keywordMatch = text.match(ROLL_KEYWORDS);
  if (keywordMatch?.[1]) return keywordMatch[1].toUpperCase();

  const quotedMatch = text.match(QUOTED_ID);
  if (quotedMatch?.[1]) return quotedMatch[1].toUpperCase();

  const commonMatch = text.match(COMMON_ID);
  if (commonMatch?.[1]) return commonMatch[1].toUpperCase();

  const tokens = text.split(/\s+/);
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    const token = tokens[i]!.replace(/[.,!?]+$/, "");
    if (/^[A-Za-z0-9][\w-]{2,}$/.test(token) && !PERFORMANCE_INTENT.test(token)) {
      return token.toUpperCase();
    }
  }

  return null;
}
