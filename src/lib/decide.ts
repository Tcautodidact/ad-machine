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

  // Rekenwerk in code (TypeSafe-richtlijn): Jev krijgt de verhoudingen kant-en-klaar.
  const k3 = kpis(input.last3d);
  const k7 = kpis(input.last7d);
  const res = await askJev(
    {
      ad: input.name,
      days_live: input.daysLive,
      target_cpa: input.targetCpa,
      last_3_days: k3,
      last_7_days: k7,
      cpa_vs_target_7d: k7.cpa === null ? "geen conversies" : +(k7.cpa / input.targetCpa).toFixed(2),
      cpa_trend_3d_vs_7d: k3.cpa !== null && k7.cpa !== null ? +(k3.cpa / k7.cpa).toFixed(2) : null,
      creative_tags: input.analysis,
    },
    {
      action: choice(
        "Wat moet een performance marketeer met deze advertentie doen? `cpa_vs_target_7d` is CPA gedeeld door doel-CPA (1.0 = precies op doel); `cpa_trend_3d_vs_7d` boven 1 betekent dat de laatste dagen duurder zijn.",
        {
          kill: "Uitzetten: CPA duidelijk boven doel (of geen conversies na flinke spend) en geen verbetering in zicht",
          keep: "Laten lopen: rond het doel, of signalen zijn tegenstrijdig",
          scale: "Budget verhogen: CPA duidelijk onder doel en de trend is stabiel of verbetert",
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
