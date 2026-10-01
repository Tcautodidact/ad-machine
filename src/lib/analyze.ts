import { askJev, choice, normalizeScore, score } from "./jev";
import { ANGLES, EMOTIONS, FORMATS, HOOK_TYPES, OFFER_TYPES } from "./taxonomy";
import { daysRunning, type Ad, type Analysis } from "./types";

const CREATIVE_LEVELS = [
  "Zwak: generiek, geen duidelijke hook of aanbod",
  "Matig: hook aanwezig maar vlak of onduidelijk",
  "Goed: sterke hook, duidelijk voordeel en CTA",
  "Uitstekend: pakkende hook, scherp pijnpunt, concreet aanbod",
];

/**
 * Concurrenten delen geen resultaten, dus 'winnaar' is een proxy:
 * hoe langer een ad draait en hoe meer varianten, hoe groter de kans dat hij winstgevend is.
 */
export function longevityScore(ad: Pick<Ad, "started_at" | "stopped_at" | "variant_count">) {
  const days = Math.min(daysRunning(ad) / 60, 1);
  const variants = Math.min((ad.variant_count - 1) / 5, 1);
  return 0.7 * days + 0.3 * variants;
}

export function winnerScore(longevity: number, creative: number) {
  return Math.round(100 * (0.65 * longevity + 0.35 * creative));
}

/** Laat Jev één ad taggen en scoren. Alle vragen gaan in één parallelle call. */
export async function analyzeAd(ad: Ad): Promise<Analysis & { model: string }> {
  const state = {
    advertiser: ad.page_name,
    format_hint: ad.media_type,
    primary_text: ad.body,
    headline: ad.title,
    cta: ad.cta,
    transcript: ad.transcript,
  };

  const res = await askJev(state, {
    hook_type: choice("Wat voor hook gebruikt deze ad in de eerste zin/seconden?", HOOK_TYPES),
    angle: choice("Welke verkoop-angle is het belangrijkst in deze ad?", ANGLES),
    format: choice("Welk creatief format heeft deze ad?", FORMATS),
    emotion: choice("Op welke emotie speelt deze ad vooral in?", EMOTIONS),
    offer_type: choice("Welk aanbod of welke vervolgstap biedt de ad?", OFFER_TYPES),
    creative: score("Hoe sterk is deze ad als direct-response advertentie?", CREATIVE_LEVELS),
  });

  const a = res.answers;
  const creative = normalizeScore(a.creative, CREATIVE_LEVELS.length);
  const longevity = longevityScore(ad);

  return {
    hook_type: a.hook_type.choice ?? null,
    angle: a.angle.choice ?? null,
    format: a.format.choice ?? null,
    emotion: a.emotion.choice ?? null,
    offer_type: a.offer_type.choice ?? null,
    creative_score: creative,
    longevity_score: longevity,
    winner_score: winnerScore(longevity, creative),
    confidence: Object.fromEntries(
      Object.entries(a).map(([k, v]) => [k, v.confidence ?? 1]),
    ),
    model: res.model,
  };
}
