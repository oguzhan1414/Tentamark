export interface BrandGuardianIssue {
  type: "forbidden_word" | "competitor" | "default_guardrail";
  word: string;
  matchedText: string;
}

export interface BrandDnaGuardianData {
  forbidden_words: string[];
  competitors: string[];
  tone_of_voice: string | null;
}

export interface BrandSafetyFixResult {
  fixedCaption: string;
  changesSummary: string;
}

export const DEFAULT_MARKETING_GUARDRAILS: string[] = [
  "en ucuz",
  "garanti",
  "%100 garanti",
  "kesin çözüm",
  "mucize çözüm",
  "bedava",
  "cheapest",
  "100% guarantee",
];

export function normalizeWordList(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .flatMap((item) => (typeof item === "string" ? item.split(",") : []))
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
  }
  return [];
}

/**
 * Scans caption text for forbidden words, competitors, and marketing guardrails.
 * Case-insensitive with Turkish locale awareness.
 */
export function scanCaptionForBrandIssues(
  caption: string,
  forbiddenWords: string[],
  competitors: string[]
): BrandGuardianIssue[] {
  if (!caption || !caption.trim()) return [];

  const issues: BrandGuardianIssue[] = [];
  const lowerCaption = caption.toLocaleLowerCase("tr-TR");

  // 1. Check custom forbidden words from brand_dna
  for (const raw of forbiddenWords) {
    const word = raw.trim();
    if (!word || word.length < 2) continue;
    const lowerWord = word.toLocaleLowerCase("tr-TR");
    if (lowerCaption.includes(lowerWord)) {
      issues.push({
        type: "forbidden_word",
        word,
        matchedText: word,
      });
    }
  }

  // 2. Check competitor names
  for (const raw of competitors) {
    const word = raw.trim();
    if (!word || word.length < 2) continue;
    const lowerWord = word.toLocaleLowerCase("tr-TR");
    if (lowerCaption.includes(lowerWord)) {
      if (!issues.some((iss) => iss.word.toLocaleLowerCase("tr-TR") === lowerWord)) {
        issues.push({
          type: "competitor",
          word,
          matchedText: word,
        });
      }
    }
  }

  // 3. Always check default marketing guardrails (en ucuz, garanti, bedava, cheapest, etc.)
  for (const raw of DEFAULT_MARKETING_GUARDRAILS) {
    const word = raw.trim();
    const lowerWord = word.toLocaleLowerCase("tr-TR");
    if (lowerCaption.includes(lowerWord)) {
      if (!issues.some((iss) => iss.word.toLocaleLowerCase("tr-TR") === lowerWord)) {
        issues.push({
          type: "default_guardrail",
          word,
          matchedText: word,
        });
      }
    }
  }

  return issues;
}
