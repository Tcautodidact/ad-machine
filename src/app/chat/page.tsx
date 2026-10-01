import { Card, PageHeader } from "@/components/ui";

const EXAMPLES = [
  "Welke angles gebruiken concurrenten die wij nog niet testen?",
  "Schrijf 10 nieuwe hooks in de stijl van onze best presterende ad.",
  "Waarom adviseert Jev om ad #3 te killen?",
  "Vat de landingspagina van Roostr samen: aanbod, prijs, bezwaren.",
];

export default function ChatPage() {
  return (
    <>
      <PageHeader title="AI-chat" sub="Praat met al je ad-data. Claude schrijft en legt uit, Jev beslist." />
      <Card className="flex min-h-[420px] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-accent/10 text-2xl text-accent">✦</div>
          <div>
            <p className="font-medium">Komt in fase 4</p>
            <p className="mt-1 text-sm text-muted">Hier kun je straks dit soort vragen stellen:</p>
          </div>
          <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
            {EXAMPLES.map((e) => (
              <div key={e} className="rounded-xl border border-line bg-panel-2 p-3 text-left text-sm text-muted">
                {e}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <input
            disabled
            placeholder="Stel een vraag over je ads…"
            className="flex-1 rounded-xl border border-line bg-panel-2 px-4 py-3 text-sm outline-none"
          />
          <button disabled className="rounded-xl bg-accent px-5 text-sm font-semibold text-black opacity-40">
            Verstuur
          </button>
        </div>
      </Card>
    </>
  );
}
