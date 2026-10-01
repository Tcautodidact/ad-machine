import { askJev, choice } from "./jev";
import type { Analysis, Metrics } from "./types";

export type DecisionInput = {
  name: string;
  daysLive: number;
  targetCpa: number; // wat een klant/lead maximaal mag kosten
  last3d: Metrics;
  last7d: Metrics;
  analysis: Analysis | null;
};

export type DecisionResult = {
  action: "kill" | "keep" | "scale";
  confidence: number;
  probabilities: Record<string, number>;
  reason: "not_enough_data" | "jev";
};

const kpis = (m: Metrics) => ({
  spend: m.spend,
  conversions: m.conversions,
  cpa: m.conversions ? +(m.spend / m.conversions).toFixed(2) : null,
  ctr_pct: m.impressions ? +((100 * m.clicks) / m.impressions).toFixed(2) : null,
  roas: m.spend ? +(m.revenue / m.spend).toFixed(2) : null,
});

/**
 * Advies per eigen ad. Harde regel eerst: zonder genoeg spend geen oordeel
 * (anders kill je ads die nog moeten leren). Daarna beslist Jev.
 */
export async function decideAd(input: DecisionInput): Promise<DecisionResult> {
  if (input.last7d.spend < input.targetCpa * 2) {
    return { action: "keep", confidence: 1, probabilities: {}, reason: "not_enough_data" };
  }

  const res = await askJev(
    {
      ad: input.name,
      days_live: input.daysLive,
      target_cpa: input.targetCpa,
      last_3_days: kpis(input.last3d),
      last_7_days: kpis(input.last7d),
      creative_tags: input.analysis,
    },
    {
      action: choice(
        "Je bent een performance marketeer. Wat moet er met deze advertentie gebeuren, gegeven de doel-CPA?",
        {
          kill: "Uitzetten: CPA duidelijk boven doel of trend verslechtert sterk",
          keep: "Laten lopen: rond het doel of nog niet genoeg signaal",
          scale: "Budget verhogen: CPA duidelijk onder doel en stabiel of verbeterend",
        },
      ),
    },
  );

  const a = res.answers.action;
  return {
    action: (a.choice ?? "keep") as DecisionResult["action"],
    confidence: a.confidence ?? 0,
    probabilities: a.probabilities ?? {},
    reason: "jev",
  };
}
