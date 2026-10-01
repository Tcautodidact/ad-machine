@AGENTS.md

# Projectcontext (voor nieuwe sessies)

- Eigenaar praat Nederlands en is niet heel technisch: antwoord in het Nederlands, leg simpel uit.
- Doel: één tool om meerdere software-bedrijven te launchen. Elk bedrijf = workspace.
  1. Concurrent-ads scrapen (Meta Ad Library, later Google + TikTok) + landingspagina's
  2. Jev (TypeSafe AI) tagt hooks/angles/formats en geeft een winnaar-score
  3. Eigen ads managen: Jev adviseert kill/houden/opschalen, uitvoeren alleen na goedkeuring
  Claude doet chat en copywriting (Jev kan geen tekst genereren).
- Gebruik altijd de TypeSafe-skill (`.claude/skills/typesafe-ai/`) bij Jev-werk.
- Stack: Next.js + Supabase + Vercel. Zonder `.env.local` draait demo-modus met voorbeelddata.
- Status 2026-10-01: fase 1+2 gebouwd (dashboard, schema, scraper, Jev-analyse), nog niet getest met echte keys.
  Eigenaar heeft een Supabase-project en Jev-key; Meta developer-account wordt thuis aangemaakt.
- Volgende stappen: zie Roadmap in README.md (Supabase koppelen, media + transcriptie, eigen Meta-cijfers, chat, deploy).
