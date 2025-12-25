# Architektura projektu – TableTennis Drills

Tento dokument popisuje architekturu projektu TableTennis Drills,
hlavní technická rozhodnutí a strukturu aplikace.

Cílem architektury je:
- umožnit rychlý vývoj MVP
- zachovat čistotu a čitelnost kódu
- připravit projekt na budoucí rozšíření (auth, admin, databáze, média)
- minimalizovat nutnost velkých refaktorů v dalších fázích

---

1) Přehled architektury

Aplikace je postavena jako moderní webová aplikace s využitím:
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- JSON dat (MVP)

Architektura je navržena tak, aby:
- UI bylo oddělené od datové vrstvy
- doménová logika byla soustředěná do feature modulů
- datový zdroj (JSON → DB) šel vyměnit bez zásahu do UI

---

2) Rozhodnutí: Next.js + App Router

Důvody volby Next.js:
- server-side rendering a static rendering
- vestavěný routing
- API routy (připraveno pro budoucí backend)
- bezproblémový deployment na Vercel

App Router:
- moderní standard Next.js
- lepší práce s layouty
- možnost server components
- dlouhodobá udržitelnost

---

3) Rozhodnutí: React + TypeScript

- React jako UI knihovna (součást Next.js)
- TypeScript zajišťuje:
  - typovou bezpečnost
  - lepší refaktoring
  - čitelné a konzistentní datové modely
  - nižší chybovost při růstu projektu

---

4) Vrstvy aplikace

Routing a stránky (src/app):
- URL struktura
- layouty
- error handling
- server-side načítání dat

Feature vrstva (src/features):
- doménová logika aplikace
- komponenty, typy a helpery
- příklad: features/drills

Datová vrstva (src/data + src/lib/data):
- JSON data
- abstrakce nad zdrojem dat
- validace

Sdílené utility (src/lib):
- konstanty
- helper funkce
- konfigurační hodnoty

Layout a UI komponenty (src/components):
- Header
- Footer
- Sponsors
- znovupoužitelné UI prvky

---

5) Struktura adresářů (vysoká úroveň)

src/
- app/
- features/
- data/
- lib/
- components/
- styles/
- tests/

---

6) Feature-first přístup

Doménová logika je strukturovaná feature-first.

features/drills/
- components/
- lib/
- types/
- index.ts

Výhody:
- jasné oddělení domén
- snadné přidávání dalších feature
- lepší orientace v projektu

---

7) Datová architektura (MVP)

Zdroj dat:
- JSON soubory v src/data/drills/
- jazyk dat: čeština
- data verzovaná v Git repozitáři
- struktura dat a význam jednotlivých polí jsou detailně popsány v docs/data-model.md

Přístup k datům:
- UI nikdy nečte JSON přímo
- data se načítají přes lib/data
- umožňuje přechod na DB bez refaktoru

---

8) Stabilní klíče vs. popisky

Rozhodnutí:
- data používají stabilní klíče
- UI zobrazuje české popisky

Příklad:
ageGroup = U13
equipment = cones, ladder

UI:
cones → Kloboučky
ladder → Koordinační žebřík

---

9) Routingová struktura

MVP:
- /
- /drills/[id]

Budoucí:
- /login
- /admin
- /admin/drills
- /profile

---

10) Responzivita a design

- mobile-first přístup
- Tailwind CSS
- použití v hale / tělocvičně

---

11) Připravenost na budoucí rozšíření

Architektura počítá s:
- autentizací
- admin rozhraním
- validací dat
- databází
- médii
- vícejazyčností

---

12) Shrnutí

Architektura:
- podporuje rychlý vývoj MVP
- je čitelná a udržitelná
- odpovídá moderním postupům
- umožňuje dlouhodobý rozvoj projektu
