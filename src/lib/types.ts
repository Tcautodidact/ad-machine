export type Workspace = {
  id: string;
  name: string;
  slug: string;
  niche: string | null;
  countries: string[];
};

export type Competitor = {
  id: string;
  workspace_id: string;
  name: string;
  meta_page_id: string | null;
  website: string | null;
};

export type Analysis = {
  hook_type: string | null;
  angle: string | null;
  format: string | null;
  emotion: string | null;
  offer_type: string | null;
  creative_score: number | null;
  longevity_score: number | null;
  winner_score: number | null;
  confidence: Record<string, number>;
};

export type Ad = {
  id: string;
  workspace_id: string;
  competitor_id: string | null;
  source: "competitor" | "own";
  platform: "meta" | "google" | "tiktok";
  external_id: string;
  page_name: string | null;
  body: string | null;
  title: string | null;
  link_url: string | null;
  cta: string | null;
  media_type: string | null;
  media_urls: string[];
  snapshot_url: string | null;
  transcript: string | null;
  started_at: string | null;
  stopped_at: string | null;
  is_active: boolean;
  variant_count: number;
  analysis: Analysis | null;
};

export type Metrics = {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

export type Decision = {
  id: string;
  action: "kill" | "keep" | "scale";
  confidence: number;
  status: "pending" | "approved" | "rejected" | "executed";
  created_at: string;
};

export type OwnAd = Ad & { metrics: Metrics; decision: Decision | null };

export const daysRunning = (ad: Pick<Ad, "started_at" | "stopped_at">) => {
  if (!ad.started_at) return 0;
  const end = ad.stopped_at ? new Date(ad.stopped_at) : new Date();
  return Math.max(0, Math.round((end.getTime() - new Date(ad.started_at).getTime()) / 86_400_000));
};
