import { daysRunning, type Ad } from "@/lib/types";
import { ScoreRing, Tag } from "./ui";

const MEDIA_ICON: Record<string, string> = { video: "▶ Video", image: "▣ Afbeelding", carousel: "▤ Carrousel" };

export function AdCard({ ad }: { ad: Ad }) {
  const a = ad.analysis;
  const days = daysRunning(ad);
  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-panel transition hover:border-accent/40">
      <div className="flex items-start justify-between gap-3 border-b border-line p-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{ad.page_name}</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <span>{MEDIA_ICON[ad.media_type ?? ""] ?? "—"}</span>
            <span>·</span>
            <span className={ad.is_active ? "text-scale" : ""}>{ad.is_active ? "● Actief" : "Gestopt"}</span>
          </div>
        </div>
        {a?.winner_score != null && <ScoreRing value={a.winner_score} />}
      </div>

      <div className="flex-1 p-4">
        <p className="text-sm leading-relaxed text-text/90">{ad.body}</p>
        {ad.title && <p className="mt-3 text-xs font-medium text-muted">↳ {ad.title}</p>}
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        <Tag k={a?.hook_type} tone="accent" />
        <Tag k={a?.angle} />
        <Tag k={a?.format} />
        <Tag k={a?.emotion} />
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[11px] text-muted">
        <span>{days} dagen live</span>
        <span>{ad.variant_count}× variant</span>
        {ad.snapshot_url ? (
          <a href={ad.snapshot_url} target="_blank" className="hover:text-accent">
            bekijk ↗
          </a>
        ) : (
          <span className="opacity-40">bekijk ↗</span>
        )}
      </div>
    </article>
  );
}
