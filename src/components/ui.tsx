import { label } from "@/lib/taxonomy";

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-panel p-5 ${className}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

export function Tag({ k, tone = "default" }: { k: string | null | undefined; tone?: "default" | "accent" }) {
  if (!k) return null;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
        tone === "accent" ? "border-accent/40 bg-accent/10 text-accent" : "border-line bg-panel-2 text-muted"
      }`}
    >
      {label(k)}
    </span>
  );
}

/** Ronde score-meter 0–100. */
export function ScoreRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 70 ? "var(--accent)" : value >= 45 ? "var(--keep)" : "var(--muted)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={4} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-xs font-semibold">{value}</span>
    </div>
  );
}

const ACTION_STYLE = {
  kill: { text: "Kill", cls: "border-kill/40 bg-kill/10 text-kill" },
  keep: { text: "Houden", cls: "border-keep/40 bg-keep/10 text-keep" },
  scale: { text: "Opschalen", cls: "border-scale/40 bg-scale/10 text-scale" },
};

export function ActionBadge({ action, confidence }: { action: keyof typeof ACTION_STYLE; confidence?: number }) {
  const s = ACTION_STYLE[action];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      {s.text}
      {confidence !== undefined && <span className="font-mono opacity-70">{Math.round(confidence * 100)}%</span>}
    </span>
  );
}

export const euro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
