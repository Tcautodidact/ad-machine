"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Workspace } from "@/lib/types";

const NAV = [
  { href: "/", label: "Overzicht", icon: "◎" },
  { href: "/competitors", label: "Concurrenten", icon: "◈" },
  { href: "/my-ads", label: "Mijn ads", icon: "▲" },
  { href: "/chat", label: "AI-chat", icon: "✦" },
];

export function Sidebar({ workspaces, demo }: { workspaces: Workspace[]; demo: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const ws = params.get("ws") ?? workspaces[0]?.slug ?? "";

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
    <header className="sticky top-0 z-10 flex items-center gap-4 overflow-x-auto border-b border-line bg-panel/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="grid size-7 shrink-0 place-items-center rounded-md bg-accent text-sm font-black text-black">A</div>
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={`${n.href}?ws=${ws}`}
          className={`shrink-0 text-sm ${isActive(n.href) ? "text-accent" : "text-muted"}`}
        >
          {n.label}
        </Link>
      ))}
    </header>
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-panel/60 p-4 backdrop-blur md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="grid size-7 place-items-center rounded-md bg-accent text-sm font-black text-black">A</div>
        <span className="font-semibold tracking-tight">Ad Machine</span>
      </div>

      <label className="mb-1 px-2 text-[11px] uppercase tracking-wider text-muted">Workspace</label>
      <select
        value={ws}
        onChange={(e) => router.push(`${pathname}?ws=${e.target.value}`)}
        className="mb-6 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {workspaces.map((w) => (
          <option key={w.id} value={w.slug}>
            {w.name}
          </option>
        ))}
      </select>

      <nav className="flex flex-col gap-1">
        {NAV.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={`${n.href}?ws=${ws}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-panel-2 text-text" : "text-muted hover:bg-panel-2/60 hover:text-text"
              }`}
            >
              <span className={active ? "text-accent" : ""}>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      {demo && (
        <div className="mt-auto rounded-lg border border-keep/30 bg-keep/10 p-3 text-xs text-keep">
          Demo-modus: voorbeelddata. Koppel Supabase in <code>.env.local</code> voor echte data.
        </div>
      )}
    </aside>
    </>
  );
}
