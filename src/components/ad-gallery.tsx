"use client";

import { useMemo, useState } from "react";
import { label } from "@/lib/taxonomy";
import type { Ad } from "@/lib/types";
import { AdCard } from "./ad-card";

type Dim = "hook_type" | "angle" | "format";
const DIMS: { key: Dim; title: string }[] = [
  { key: "hook_type", title: "Hook" },
  { key: "angle", title: "Angle" },
  { key: "format", title: "Format" },
];

export function AdGallery({ ads }: { ads: Ad[] }) {
  const [filters, setFilters] = useState<Partial<Record<Dim, string>>>({});
  const [onlyActive, setOnlyActive] = useState(false);

  const options = useMemo(() => {
    const o = {} as Record<Dim, string[]>;
    for (const d of DIMS) {
      o[d.key] = [...new Set(ads.map((a) => a.analysis?.[d.key]).filter(Boolean) as string[])];
    }
    return o;
  }, [ads]);

  const shown = ads.filter(
    (ad) =>
      (!onlyActive || ad.is_active) &&
      DIMS.every((d) => !filters[d.key] || ad.analysis?.[d.key] === filters[d.key]),
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3">
        {DIMS.map((d) => (
          <div key={d.key} className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 text-xs uppercase tracking-wider text-muted">{d.title}</span>
            {options[d.key].map((v) => {
              const on = filters[d.key] === v;
              return (
                <button
                  key={v}
                  onClick={() => setFilters((f) => ({ ...f, [d.key]: on ? undefined : v }))}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    on
                      ? "border-accent bg-accent text-black"
                      : "border-line bg-panel text-muted hover:border-accent/50 hover:text-text"
                  }`}
                >
                  {label(v)}
                </button>
              );
            })}
          </div>
        ))}
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} className="accent-[var(--accent)]" />
          Alleen actieve ads
        </label>
      </div>

      <div className="mb-3 text-xs text-muted">
        {shown.length} van {ads.length} ads · gesorteerd op winnaar-score
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </>
  );
}
