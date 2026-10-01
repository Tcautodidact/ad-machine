import { ActionBadge, PageHeader, Tag, euro } from "@/components/ui";
import { getOwnAds, getWorkspace, isDemo } from "@/lib/data";
import { daysRunning } from "@/lib/types";

export default async function MyAdsPage({ searchParams }: PageProps<"/my-ads">) {
  const { ws } = await searchParams;
  const workspace = await getWorkspace(typeof ws === "string" ? ws : undefined);
  if (!workspace) return null;
  const ads = await getOwnAds(workspace.id);
  const demo = isDemo();

  return (
    <>
      <PageHeader
        title="Mijn ads"
        sub="Laatste 7 dagen. Jev adviseert per ad: kill, houden of opschalen. Niks gebeurt zonder jouw goedkeuring."
      />

      <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th className="p-4 font-medium">Ad</th>
              <th className="p-4 text-right font-medium">Spend</th>
              <th className="p-4 text-right font-medium">Conv.</th>
              <th className="p-4 text-right font-medium">CPA</th>
              <th className="p-4 text-right font-medium">CTR</th>
              <th className="p-4 text-right font-medium">ROAS</th>
              <th className="p-4 font-medium">Advies</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ads.map((ad) => {
              const m = ad.metrics;
              const d = ad.decision;
              return (
                <tr key={ad.id} className="align-top">
                  <td className="max-w-sm p-4">
                    <p className="line-clamp-2">{ad.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Tag k={ad.analysis?.hook_type} tone="accent" />
                      <Tag k={ad.analysis?.format} />
                      <span className="font-mono text-[11px] text-muted">{daysRunning(ad)}d live</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono tabular-nums">{euro(m.spend)}</td>
                  <td className="p-4 text-right font-mono tabular-nums">{m.conversions}</td>
                  <td className="p-4 text-right font-mono tabular-nums">{m.conversions ? euro(m.spend / m.conversions) : "—"}</td>
                  <td className="p-4 text-right font-mono tabular-nums">
                    {m.impressions ? `${((100 * m.clicks) / m.impressions).toFixed(1)}%` : "—"}
                  </td>
                  <td className="p-4 text-right font-mono tabular-nums">{m.spend ? `${(m.revenue / m.spend).toFixed(1)}×` : "—"}</td>
                  <td className="p-4">{d && <ActionBadge action={d.action} confidence={d.confidence} />}</td>
                  <td className="p-4">
                    {d && d.action !== "keep" && d.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          disabled={demo}
                          title={demo ? "Niet beschikbaar in demo-modus" : undefined}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
                        >
                          Uitvoeren
                        </button>
                        <button
                          disabled={demo}
                          className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted disabled:opacity-40"
                        >
                          Negeren
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
