// Haalt ads van een concurrent op via de officiële Meta Ad Library API.
// Vereist een access token van een geverifieerd Meta-account (zie README).
// Let op: de API geeft geen directe video/afbeelding-URL's, alleen een snapshot-link.
// Media downloaden + transcriberen is een volgende stap.

const VERSION = process.env.META_GRAPH_VERSION ?? "v24.0";

const FIELDS = [
  "id",
  "page_id",
  "page_name",
  "ad_creative_bodies",
  "ad_creative_link_titles",
  "ad_creative_link_captions",
  "ad_creative_link_descriptions",
  "ad_delivery_start_time",
  "ad_delivery_stop_time",
  "ad_snapshot_url",
  "publisher_platforms",
  "languages",
  "eu_total_reach",
].join(",");

type RawAd = {
  id: string;
  page_id: string;
  page_name?: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_captions?: string[];
  ad_delivery_start_time?: string;
  ad_delivery_stop_time?: string;
  ad_snapshot_url?: string;
  [k: string]: unknown;
};

export type ScrapedAd = {
  external_id: string;
  page_name: string | null;
  body: string | null;
  title: string | null;
  link_url: string | null;
  snapshot_url: string | null;
  started_at: string | null;
  stopped_at: string | null;
  is_active: boolean;
  variant_count: number;
  raw: RawAd;
};

export async function fetchPageAds(opts: {
  pageId: string;
  countries: string[];
  maxAds?: number;
}): Promise<ScrapedAd[]> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN ontbreekt");

  const params = new URLSearchParams({
    access_token: token,
    search_page_ids: JSON.stringify([opts.pageId]),
    ad_reached_countries: JSON.stringify(opts.countries),
    ad_active_status: "ALL",
    ad_type: "ALL", // werkt voor EU-landen; buiten de EU alleen politieke ads
    fields: FIELDS,
    limit: "100",
  });

  const max = opts.maxAds ?? 500;
  const raw: RawAd[] = [];
  let url: string | null = `https://graph.facebook.com/${VERSION}/ads_archive?${params}`;

  while (url && raw.length < max) {
    const res: Response = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(`Meta Ad Library: ${json?.error?.message ?? res.status}`);
    raw.push(...(json.data ?? []));
    url = json.paging?.next ?? null;
  }

  // Varianten: ads met dezelfde tekst tellen we als één concept dat vaker getest wordt.
  const variants = new Map<string, number>();
  for (const ad of raw) {
    const k = (ad.ad_creative_bodies?.[0] ?? ad.id).trim().toLowerCase();
    variants.set(k, (variants.get(k) ?? 0) + 1);
  }

  return raw.slice(0, max).map((ad) => {
    const body = ad.ad_creative_bodies?.[0] ?? null;
    return {
      external_id: ad.id,
      page_name: ad.page_name ?? null,
      body,
      title: ad.ad_creative_link_titles?.[0] ?? null,
      link_url: ad.ad_creative_link_captions?.[0] ?? null,
      snapshot_url: ad.ad_snapshot_url ?? null,
      started_at: ad.ad_delivery_start_time ?? null,
      stopped_at: ad.ad_delivery_stop_time ?? null,
      is_active: !ad.ad_delivery_stop_time,
      variant_count: variants.get((body ?? ad.id).trim().toLowerCase()) ?? 1,
      raw: ad,
    };
  });
}
