// Voorbeelddata (fictieve merken) zodat het dashboard werkt zonder Supabase.
import { longevityScore, winnerScore } from "./analyze";
import type { Ad, OwnAd, Workspace } from "./types";

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const DEMO_WORKSPACES: Workspace[] = [
  { id: "ws1", name: "PlanFlow", slug: "planflow", niche: "Planningssoftware voor installateurs", countries: ["NL", "BE"] },
  { id: "ws2", name: "InvoiceBot", slug: "invoicebot", niche: "Facturatie voor zzp'ers", countries: ["NL"] },
];

type Seed = [
  page: string,
  body: string,
  title: string,
  media: string,
  started: number,
  stopped: number | null,
  variants: number,
  tags: [hook: string, angle: string, format: string, emotion: string, offer: string],
  creative: number,
];

const COMPETITOR_SEEDS: Seed[] = [
  ["Roostr", "Nog steeds je planning in Excel? 🤯 Zo verlies je elke week 6 uur aan puzzelen.", "Plan je hele team in 5 minuten", "video", 94, null, 7, ["problem", "save_time", "ugc", "frustration", "free_trial"], 0.9],
  ["Roostr", "\"Sinds Roostr bellen klanten niet meer waar de monteur blijft.\" – Installatiebedrijf De Vries", "4.8★ uit 1.200 reviews", "video", 61, null, 4, ["social_proof", "status", "talking_head", "trust", "demo_call"], 0.8],
  ["Werkbonnen.nl", "Wat als je monteurs hun werkbon in 30 seconden afronden?", "Probeer 14 dagen gratis", "video", 48, null, 5, ["question", "save_time", "screen_recording", "curiosity", "free_trial"], 0.75],
  ["Werkbonnen.nl", "Installateurs: stop met papieren werkbonnen.", "Digitaal = sneller factureren", "image", 33, null, 2, ["callout", "make_money", "static_image", "frustration", "free_trial"], 0.55],
  ["FieldPro", "We vergeleken 5 planningstools. Dit is de winnaar 👇", "Bekijk de vergelijking", "carousel", 27, null, 3, ["curiosity", "comparison", "carousel", "curiosity", "lead_magnet"], 0.7],
  ["FieldPro", "50% korting op je eerste 3 maanden — alleen deze maand.", "Claim je korting", "image", 12, 2, 1, ["offer", "save_money", "static_image", "fomo", "discount"], 0.4],
  ["Roostr", "Van chaos op de whiteboard naar overzicht op je telefoon.", "Zie het verschil", "video", 39, null, 3, ["before_after", "simplicity", "motion_graphics", "hope", "free_trial"], 0.72],
  ["Werkbonnen.nl", "Ik was 15 jaar loodgieter. Toen bouwde ik de app die ik zelf nodig had.", "Ons verhaal", "video", 71, null, 6, ["story", "authority", "talking_head", "trust", "demo_call"], 0.85],
  ["FieldPro", "POV: het is maandagochtend en je planning klopt gewoon 😌", "Rustige maandagen", "video", 18, null, 2, ["curiosity", "simplicity", "meme", "humor", "free_trial"], 0.6],
  ["Roostr", "Zo ziet een volle week eruit in Roostr (schermopname)", "Live demo", "video", 8, null, 1, ["demo", "simplicity", "screen_recording", "curiosity", "demo_call"], 0.5],
];

function toAd(s: Seed, i: number, wsId: string, source: "competitor" | "own"): Ad {
  const [page, body, title, media, started, stopped, variants, tags, creative] = s;
  const base = {
    started_at: daysAgo(started),
    stopped_at: stopped === null ? null : daysAgo(stopped),
    variant_count: variants,
  };
  const longevity = longevityScore(base);
  return {
    id: `${source}-${wsId}-${i}`,
    workspace_id: wsId,
    competitor_id: null,
    source,
    platform: "meta",
    external_id: `${1000 + i}`,
    page_name: page,
    body,
    title,
    link_url: null,
    cta: null,
    media_type: media,
    media_urls: [],
    snapshot_url: null,
    transcript: null,
    is_active: stopped === null,
    ...base,
    analysis: {
      hook_type: tags[0],
      angle: tags[1],
      format: tags[2],
      emotion: tags[3],
      offer_type: tags[4],
      creative_score: creative,
      longevity_score: longevity,
      winner_score: winnerScore(longevity, creative),
      confidence: {},
    },
  };
}

export const demoCompetitorAds = (wsId: string) =>
  COMPETITOR_SEEDS.map((s, i) => toAd(s, i, wsId, "competitor"));

const OWN: [Seed, spend: number, conv: number, impr: number, clicks: number, action: "kill" | "keep" | "scale", conf: number][] = [
  [["PlanFlow", "Je monteurs staan stil omdat de planning niet klopt? Dat kost je €400 per dag.", "Gratis proberen", "video", 9, null, 1, ["problem", "make_money", "ugc", "frustration", "free_trial"], 0.85], 412, 19, 41000, 980, "scale", 0.91],
  [["PlanFlow", "Wat als je hele week in 5 minuten gepland is?", "Start gratis", "video", 12, null, 1, ["question", "save_time", "screen_recording", "curiosity", "free_trial"], 0.7], 380, 11, 39000, 610, "keep", 0.67],
  [["PlanFlow", "PlanFlow: de slimme planningstool voor installateurs.", "Meer info", "image", 14, null, 1, ["callout", "simplicity", "static_image", "trust", "free_trial"], 0.35], 295, 2, 52000, 240, "kill", 0.94],
  [["PlanFlow", "\"Eindelijk overzicht.\" – Mark, eigenaar Klimaattechniek Oost", "Lees zijn verhaal", "video", 5, null, 1, ["social_proof", "status", "talking_head", "trust", "demo_call"], 0.75], 120, 4, 11000, 260, "keep", 1],
];

export const demoOwnAds = (wsId: string): OwnAd[] =>
  OWN.map(([seed, spend, conversions, impressions, clicks, action, confidence], i) => ({
    ...toAd(seed, i, wsId, "own"),
    metrics: { spend, conversions, impressions, clicks, revenue: conversions * 79 },
    decision: { id: `d${i}`, action, confidence, status: "pending", created_at: daysAgo(0) },
  }));
