import { analyzeAd } from "@/lib/analyze";
import { jobAuthorized, unauthorized } from "@/lib/auth-job";
import { db } from "@/lib/supabase";
import type { Ad } from "@/lib/types";

export const maxDuration = 300;

/** Laat Jev alle nog niet geanalyseerde ads taggen en scoren. */
export async function POST(req: Request) {
  if (!jobAuthorized(req)) return unauthorized();

  const { data, error } = await db()
    .from("ads")
    .select("*, ad_analysis(ad_id)")
    .is("ad_analysis", null)
    .limit(200);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let analyzed = 0;
  const failed: string[] = [];
  // Kleine batches parallel: Jev is snel, maar we blijven onder de rate limit.
  for (let i = 0; i < data.length; i += 10) {
    await Promise.all(
      (data.slice(i, i + 10) as Ad[]).map(async (ad) => {
        try {
          const { model, ...analysis } = await analyzeAd(ad);
          const { error: e } = await db()
            .from("ad_analysis")
            .upsert({ ad_id: ad.id, ...analysis, model, analyzed_at: new Date().toISOString() });
          if (e) throw e;
          analyzed++;
        } catch {
          failed.push(ad.id);
        }
      }),
    );
  }
  return Response.json({ analyzed, failed });
}
