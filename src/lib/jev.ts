// Minimale client voor Jev (TypeSafe AI). Docs: https://docs.typesafe.ai/api.md
// Jev schrijft geen tekst: het kiest uit opties, geeft een score of een ja/nee-kans.

const ENDPOINT = "https://api.typesafe.ai/v1/systemone";

export type ChoiceQuestion = {
  type: "choice";
  instructions: string;
  criteria: Record<string, string | null>;
};
export type ScoreQuestion = {
  type: "score";
  instructions: string;
  criteria: string[]; // 2–10 oplopende niveaus
};
export type NoulQuestion = { type: "noul"; instructions: string };
export type Question = ChoiceQuestion | ScoreQuestion | NoulQuestion;

export type Answer = {
  type: Question["type"];
  choice?: string;
  score?: number;
  noul?: number;
  probabilities?: Record<string, number>;
  confidence?: number;
};

export type JevResponse<K extends string> = {
  model: string;
  answers: Record<K, Answer>;
};

export const choice = (
  instructions: string,
  criteria: Record<string, string | null>,
): ChoiceQuestion => ({ type: "choice", instructions, criteria });

export const score = (instructions: string, criteria: string[]): ScoreQuestion => ({
  type: "score",
  instructions,
  criteria,
});

export const noul = (instructions: string): NoulQuestion => ({ type: "noul", instructions });

export function jevConfigured() {
  return Boolean(process.env.TYPESAFE_API_KEY);
}

export async function askJev<K extends string>(
  state: unknown,
  questions: Record<K, Question>,
  { retries = 3 }: { retries?: number } = {},
): Promise<JevResponse<K>> {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) throw new Error("TYPESAFE_API_KEY ontbreekt");

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ state, model: "jev-latest", questions }),
    });
    if (res.ok) return res.json();
    // 429 = rate limit, 529 = overbelast: opnieuw proberen met backoff
    if ((res.status === 429 || res.status === 529) && attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      continue;
    }
    throw new Error(`Jev ${res.status}: ${await res.text()}`);
  }
}

/** Zet een score-antwoord (0..niveaus-1) om naar 0..1. */
export function normalizeScore(answer: Answer, levels: number) {
  return Math.max(0, Math.min(1, (answer.score ?? 0) / (levels - 1)));
}
