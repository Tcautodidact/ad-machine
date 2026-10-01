import "server-only";
import { DEMO_WORKSPACES, demoCompetitorAds, demoOwnAds } from "./demo";
import { db, supabaseConfigured } from "./supabase";
import type { Ad, Metrics, OwnAd, Workspace } from "./types";

export const isDemo = () => !supabaseConfigured();

export async function getWorkspaces(): Promise<Workspace[]> {
  if (isDemo()) return DEMO_WORKSPACES;
  const { data, error } = await db().from("workspaces").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getWorkspace(slug?: string): Promise<Workspace | null> {
  const all = await getWorkspaces();
  return all.find((w) => w.slug === slug) ?? all[0] ?? null;
}

type AdRow = Omit<Ad, "analysis"> & { ad_analysis: Ad["analysis"] | Ad["analysis"][] };
const withAnalysis = (r: AdRow): Ad => {
  const { ad_analysis, ...ad } = r;
  return { ...ad, analysis: Array.isArray(ad_analysis) ? (ad_analysis[0] ?? null) : ad_analysis };
};

export async function getCompetitorAds(workspaceId: string): Promise<Ad[]> {
  const ads = isDemo()
    ? demoCompetitorAds(workspaceId)
    : await db()
        .from("ads")
        .select("*, ad_analysis(*)")
        .eq("workspace_id", workspaceId)
        .eq("source", "competitor")
        .then(({ data, error }) => {
          if (error) throw error;
          return (data as AdRow[]).map(withAnalysis);
        });
  return ads.sort((a, b) => (b.analysis?.winner_score ?? -1) - (a.analysis?.winner_score ?? -1));
}

export async function getOwnAds(workspaceId: string): Promise<OwnAd[]> {
  if (isDemo()) return demoOwnAds(workspaceId);

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await db()
    .from("ads")
    .select("*, ad_analysis(*), ad_metrics_daily(*), decisions(*)")
    .eq("workspace_id", workspaceId)
    .eq("source", "own")
    .gte("ad_metrics_daily.date", since)
    .order("created_at", { referencedTable: "decisions", ascending: false })
    .limit(1, { referencedTable: "decisions" });
  if (error) throw error;

  return data.map((r) => {
    const { ad_metrics_daily, decisions, ...rest } = r;
    const metrics = (ad_metrics_daily as Metrics[]).reduce<Metrics>(
      (s, m) => ({
        spend: s.spend + Number(m.spend),
        impressions: s.impressions + m.impressions,
        clicks: s.clicks + m.clicks,
        conversions: s.conversions + m.conversions,
        revenue: s.revenue + Number(m.revenue),
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    );
    return { ...withAnalysis(rest as AdRow), metrics, decision: decisions?.[0] ?? null };
  });
}
