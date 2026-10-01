// De categorieën waarmee Jev elke ad tagt. Jev kiest altijd één van deze keys,
// dus wat hier staat bepaalt de filters in het dashboard. Uitbreiden mag gewoon.

export const HOOK_TYPES = {
  question: "Opent met een vraag aan de kijker",
  bold_claim: "Opent met een gedurfde of schokkende claim",
  problem: "Opent met een herkenbaar probleem of pijnpunt",
  social_proof: "Opent met reviews, cijfers of bekende klanten",
  before_after: "Toont een voor/na of transformatie",
  curiosity: "Wekt nieuwsgierigheid zonder alles te verklappen",
  demo: "Laat direct het product in actie zien",
  story: "Begint als persoonlijk verhaal",
  offer: "Opent direct met aanbieding of korting",
  callout: "Spreekt een specifieke doelgroep direct aan",
} as const;

export const ANGLES = {
  save_time: "Tijd besparen / gemak",
  save_money: "Geld besparen / prijs",
  make_money: "Meer omzet of verdienen",
  fear: "Angst om iets te missen of fout te doen",
  status: "Status, imago, professionaliteit",
  simplicity: "Eenvoud: geen gedoe, geen kennis nodig",
  comparison: "Beter dan het alternatief of de concurrent",
  authority: "Expertise of autoriteit",
} as const;

export const FORMATS = {
  ugc: "UGC: iemand praat/filmt zelf, telefoonstijl",
  talking_head: "Talking head / founder in beeld",
  screen_recording: "Schermopname of product-demo",
  motion_graphics: "Animatie / motion graphics",
  static_image: "Statische afbeelding",
  carousel: "Carrousel met meerdere kaarten",
  meme: "Meme of trending format",
} as const;

export const EMOTIONS = {
  frustration: "Frustratie",
  hope: "Hoop / ambitie",
  curiosity: "Nieuwsgierigheid",
  fomo: "FOMO / urgentie",
  trust: "Vertrouwen / geruststelling",
  humor: "Humor",
} as const;

export const OFFER_TYPES = {
  free_trial: "Gratis proberen",
  demo_call: "Demo of gesprek inplannen",
  discount: "Korting / deal",
  lead_magnet: "Gratis download of tool",
  direct_purchase: "Direct kopen / abonneren",
  none: "Geen duidelijk aanbod",
} as const;

export type HookType = keyof typeof HOOK_TYPES;
export type Angle = keyof typeof ANGLES;
export type Format = keyof typeof FORMATS;
export type Emotion = keyof typeof EMOTIONS;
export type OfferType = keyof typeof OFFER_TYPES;

export const LABELS: Record<string, string> = {
  question: "Vraag",
  bold_claim: "Gedurfde claim",
  problem: "Probleem",
  social_proof: "Social proof",
  before_after: "Voor/na",
  curiosity: "Nieuwsgierigheid",
  demo: "Demo",
  story: "Verhaal",
  offer: "Aanbod",
  callout: "Callout",
  save_time: "Tijd besparen",
  save_money: "Geld besparen",
  make_money: "Meer verdienen",
  fear: "Angst",
  status: "Status",
  simplicity: "Eenvoud",
  comparison: "Vergelijking",
  authority: "Autoriteit",
  ugc: "UGC",
  talking_head: "Talking head",
  screen_recording: "Schermopname",
  motion_graphics: "Motion",
  static_image: "Afbeelding",
  carousel: "Carrousel",
  meme: "Meme",
  frustration: "Frustratie",
  hope: "Hoop",
  fomo: "FOMO",
  trust: "Vertrouwen",
  humor: "Humor",
  free_trial: "Gratis trial",
  demo_call: "Demo-call",
  discount: "Korting",
  lead_magnet: "Lead magnet",
  direct_purchase: "Direct kopen",
  none: "Geen",
};

export const label = (key: string | null | undefined) =>
  key ? (LABELS[key] ?? key) : "—";
