# Ad Machine

Eén tool om ads te scrapen, analyseren en managen voor meerdere bedrijven.

1. **Scrapen**: concurrent-ads via de Meta Ad Library (later Google + TikTok)
2. **Analyseren**: [Jev](https://docs.typesafe.ai) tagt elke ad (hook, angle, format, emotie, aanbod) en geeft een winnaar-score
3. **Managen**: eigen ads met kill/houden/opschalen-advies van Jev, uitgevoerd na jouw goedkeuring

Elk bedrijf is een **workspace** met eigen concurrenten, ads en cijfers.

## Lokaal draaien

```bash
npm install
cp .env.example .env.local   # optioneel: zonder Supabase draait de demo-modus
npm run dev
```

Open http://localhost:3000

## Supabase koppelen

1. Maak een project op [supabase.com](https://supabase.com)
2. SQL Editor → plak `supabase/migrations/0001_init.sql` → Run
3. Zet `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
4. Voeg een workspace en concurrenten toe (Table Editor). Voor `competitors.meta_page_id`: het page-id uit de Ad Library-URL (`view_all_page_id=...`)

## Jobs

| Route | Wat |
|---|---|
| `POST /api/jobs/scrape` | Haalt ads van alle concurrenten op uit de Meta Ad Library |
| `POST /api/jobs/analyze` | Laat Jev alle nieuwe ads taggen en scoren |

Aanroepen met header `Authorization: Bearer $CRON_SECRET`.

## Structuur

```
src/lib/taxonomy.ts                  categorieën voor hooks/angles/formats (Jev kiest hieruit)
src/lib/jev.ts                       Jev-client
src/lib/analyze.ts                   tagging + winnaar-score
src/lib/decide.ts                    kill/keep/scale-advies
src/lib/platforms/meta-ad-library.ts scraper
supabase/migrations/                 databaseschema
```

## Roadmap

- [x] Fase 1: workspaces, Meta Ad Library-scraper, gallery
- [x] Fase 2: Jev-tagging + winnaar-score (code klaar, API-key nodig)
- [ ] Media downloaden + video's transcriberen
- [ ] Landingspagina's scrapen
- [ ] Fase 3: eigen Meta-account koppelen, dagelijkse cijfers, kill/scale uitvoeren
- [ ] Fase 4: AI-chat met Claude + ad-teksten genereren
- [ ] Fase 5: Google + TikTok
- [ ] Login + deployen op Vercel
