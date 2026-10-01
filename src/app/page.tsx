import Link from "next/link";
import { ActionBadge, Card, PageHeader, Stat, Tag, euro } from "@/components/ui";
import { getCompetitorAds, getOwnAds, getWorkspace } from "@/lib/data";
import { label } from "@/lib/taxonomy";

export default async function Overview({ searchParams }: PageProps<"/">) {
  const { ws } = await searchParams;
  const workspace = await getWorkspace(typeof ws === "string" ? ws : undefined);
  if (!workspace) return <PageHeader title="Nog geen workspace" sub="Maak een workspace aan in Supabase." />;

  const [competitorAds, ownAds] = await Promise.all([
    getCompetitorAds(workspace.id),
    getOwnAds(workspace.id),
  ]);

  // Welke hooks winnen bij concurrenten (gem. winnaar-score) vs. bij jou (CPA)?
  const hooks = new Map<string, { n: number; score: number; spend: number; conv: number }>();
  for (const ad of competitorAds) {
    const h = ad.analysis?.hook_type;
    if (!h) continue;
    const e = hooks.get(h) ?? { n: 0, score: 0, spend: 0, conv: 0 };
    e.n++;
    e.score += ad.analysis?.winner_score ?? 0;
    hooks.set(h, e);
  }
  for (const ad of ownAds) {
    const h = ad.analysis?.hook_type;
    if (!h) continue;
    const e = hooks.get(h) ?? { n: 0, score: 0, spend: 0, conv: 0 };
    e.spend += ad.metrics.spend;
    e.conv += ad.metrics.conversions;
    hooks.set(h, e);
  }
  const hookRows = [...hooks.entries()]
    .map(([k, v]) => ({ k, n: v.n, avg: v.n ? Math.round(v.score / v.n) : 0, cpa: v.conv ? v.spend / v.conv : null }))
    .sort((a, b) => b.avg - a.avg);

  const winners = competitorAds.filter((a) => (a.analysis?.winner_score ?? 0) >= 70);
  const actions = ownAds.filter((a) => a.decision && a.decision.action !== "keep" && a.decision.status === "pending");
  const spend = ownAds.reduce((s, a) => s + a.metrics.spend, 0);
  const conv = ownAds.reduce((s, a) => s + a.metrics.conversions, 0);
  const q = `?ws=${workspace.slug}`;

  return (
    <>
      <PageHeader title={workspace.name} sub={workspace.niche ?? undefined} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Concurrent-ads" value={competitorAds.length} hint={`${competitorAds.filter((a) => a.is_active).length} actief`} />
        <Stat label="Winnaars" value={winners.length} hint="winnaar-score ≥ 70" />
        <Stat label="Spend 7d" value={euro(spend)} hint={`${conv} conversies`} />
        <Stat label="CPA 7d" value={conv ? euro(spend / conv) : "—"} hint={`${actions.length} acties wachten`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="mb-1 font-medium">Hooks die winnen</h2>
          <p className="mb-5 text-xs text-muted">Concurrenten (gem. winnaar-score) naast jouw eigen resultaat (CPA)</p>
          <div className="flex flex-col gap-3">
            {hookRows.map((r) => (
              <div key={r.k} className="grid grid-cols-[110px_1fr_70px] items-center gap-3 text-sm">
                <span className="truncate">{label(r.k)}</span>
                <div className="h-2 overflow-hidden rounded-full bg-panel-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${r.avg}%`, opacity: r.n ? 1 : 0 }} />
                </div>
                <span className="text-right font-mono text-xs text-muted">
                  {r.cpa !== null ? <span className="text-text">{euro(r.cpa)}</span> : r.n ? `${r.avg}` : "—"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Actie nodig</h2>
            <Link href={`/my-ads${q}`} className="text-xs text-muted hover:text-accent">alles →</Link>
          </div>
          {actions.length === 0 && <p className="text-sm text-muted">Niks te doen. Alles loopt.</p>}
          <div className="flex flex-col gap-3">
            {actions.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-panel-2 p-3">
                <p className="line-clamp-2 text-sm">{a.body}</p>
                <ActionBadge action={a.decision!.action} confidence={a.decision!.confidence} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Top concurrent-ads</h2>
          <Link href={`/competitors${q}`} className="text-xs text-muted hover:text-accent">gallery →</Link>
        </div>
        <div className="divide-y divide-line">
          {competitorAds.slice(0, 4).map((ad) => (
            <div key={ad.id} className="flex items-center gap-4 py-3">
              <span className="w-10 font-mono text-lg font-semibold text-accent">{ad.analysis?.winner_score}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{ad.body}</p>
                <p className="text-xs text-muted">{ad.page_name}</p>
              </div>
              <div className="hidden gap-1.5 sm:flex">
                <Tag k={ad.analysis?.hook_type} tone="accent" />
                <Tag k={ad.analysis?.angle} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
