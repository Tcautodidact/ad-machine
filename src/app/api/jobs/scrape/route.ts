import { jobAuthorized, unauthorized } from "@/lib/auth-job";
import { fetchPageAds } from "@/lib/platforms/meta-ad-library";
import { db } from "@/lib/supabase";

export const maxDuration = 300;

/** Scrapet alle concurrenten (met Meta page-id) van alle workspaces. */
export async function POST(req: Request) {
  if (!jobAuthorized(req)) return unauthorized();

  const { data: competitors, error } = await db()
    .from("competitors")
    .select("id, name, meta_page_id, workspace_id, workspaces(countries)")
    .not("meta_page_id", "is", null);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const c of competitors) {
    try {
      const ws = c.workspaces as unknown as { countries: string[] } | null;
      const ads = await fetchPageAds({ pageId: c.meta_page_id!, countries: ws?.countries ?? ["NL"] });
      const now = new Date().toISOString();
      const { error: upsertError } = await db()
        .from("ads")
        .upsert(
          ads.map((a) => ({
            ...a,
            workspace_id: c.workspace_id,
            competitor_id: c.id,
            source: "competitor",
            platform: "meta",
            last_seen_at: now,
          })),
          { onConflict: "workspace_id,platform,external_id" },
        );
      if (upsertError) throw upsertError;
      results.push({ competitor: c.name, ads: ads.length });
    } catch (e) {
      results.push({ competitor: c.name, error: (e as Error).message });
    }
  }
  return Response.json({ results });
}
