# Architektura projektu – TableTennis Drills

Tento dokument popisuje architekturu projektu **TableTennis Drills**,
hlavní technická rozhodnutí a strukturu aplikace v aktuálním stavu (MVP).

Cílem architektury je:
- umožnit rychlý vývoj funkčního MVP,
- zachovat čitelnost a jednoduchost kódu,
- jasně oddělit UI, doménovou logiku a data,
- připravit projekt na budoucí rozšíření bez nutnosti zásadních refaktorů.

---

## 1. Přehled architektury

Aplikace je postavena jako moderní webová aplikace využívající:

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **JSON data** jako zdroj dat v MVP

Architektura je navržena tak, aby:
- UI nepracovalo přímo s datovým zdrojem,
- doménová logika byla soustředěna do feature modulů,
- datový zdroj (JSON → databáze / API) byl snadno vyměnitelný bez zásahu do UI.

---

## 2. Rozhodnutí: Next.js + App Router

Next.js byl zvolen z následujících důvodů:
- vestavěný routing,
- podpora server-side a static renderingu,
- jasná a škálovatelná struktura projektu,
- bezproblémový deployment na Vercel,
- připravenost na backendové API a autentizaci.

Použit je **App Router** jako moderní a doporučený standard Next.js.
Umožňuje práci s layouty, route groups a jasné oddělení server a client komponent.

---

## 3. Rozhodnutí: React + TypeScript

React slouží jako UI vrstva aplikace (součást Next.js).
TypeScript zajišťuje:

- typovou bezpečnost,
- konzistentní datový model,
- snadnější refaktoring,
- nižší chybovost při rozšiřování projektu.

Datové typy jsou sdílené mezi doménovou logikou, loadery a UI,
což vytváří jednotný kontrakt napříč aplikací.

---

## 4. Vrstvy aplikace

### Routing a stránky (`src/app`)

Vrstva `src/app` definuje:
- URL strukturu aplikace,
- layouty,
- stránky,
- rozdělení na server a client komponenty.

Aktuální routing (MVP):
- `/` – úvodní stránka s filtry
- `/drills` – seznam cvičení
- `/drills/[id]` – detail cvičení
- `/login` – přihlášení (Auth v1)
- `(protected)` – chráněné části aplikace

---

### Feature vrstva (`src/features`)

Feature vrstva obsahuje **doménovou logiku aplikace**.
Každá feature (např. `drills`) je izolovaná do vlastního modulu.

Obsahuje:
- typy,
- datové loadery,
- helpery,
- UI komponenty specifické pro danou doménu.

Feature vrstva slouží jako **mezivrstva mezi UI a datovým zdrojem**.

---

### Datová vrstva (`src/data`)

Datová vrstva obsahuje JSON soubory, které slouží jako zdroj dat v MVP.

- data jsou verzována v Git repozitáři,
- struktura dat je popsána v `docs/data-model.md`,
- zdroj dat je považován za **vyměnitelný detail**.

Přechod na databázi nebo API je možný bez změn v UI.

---

### Sdílené UI komponenty (`src/components`)

Obsahuje znovupoužitelné a layoutové komponenty,
které nejsou svázané s konkrétní doménou.

Např.:
- Header
- Footer
- obecné UI prvky

---

### Autentizace a server logika (`src/server`, `src/lib/auth`)

Autentizační logika (Auth v1) je implementována server-side.

Obsahuje:
- správu session,
- rate limiting,
- audit log,
- ochranu chráněných rout.

Architektura autentizace je popsána samostatně v `docs/auth.md`.

---

### Statické assety (`src/assets`)

Adresář obsahuje statické grafické podklady:
- loga,
- SVG,
- branding,
- sponzorské prvky.

Assety nejsou součástí doménové logiky.

---

### Dokumentace (`docs`)

Adresář `docs` v kořeni projektu obsahuje:
- architekturu projektu,
- datový model,
- autentizační dokumentaci,
- technická rozhodnutí (ADR).

Dokumentace slouží jako **zdroj pravdy pro další vývoj**.

---

## 5. Struktura adresářů (aktuální)

/
├─ docs/
│ ├─ architecture.md
│ ├─ auth.md
│ ├─ data-model.md
│ └─ decisions/
│
├─ src/
│ ├─ app/
│ ├─ features/
│ ├─ data/
│ ├─ components/
│ ├─ server/
│ ├─ lib/
│ └─ assets/
│
└─ public/

yaml
Zkopírovat kód

Styling je řešen pomocí Tailwind CSS a `src/app/globals.css`.
Samostatný adresář `styles/` není používán.

---

## 6. Feature-first přístup

Projekt používá **feature-first strukturu**.

Příklad:
features/drills/
├─ components/
├─ data/
├─ types/
└─ index.ts

yaml
Zkopírovat kód

Výhody:
- jasné oddělení domén,
- lepší orientace v projektu,
- snadné přidávání dalších feature,
- omezení nechtěných závislostí.

---

## 7. Datová architektura (MVP)

- zdrojem dat jsou JSON soubory (`src/data/drills`)
- data jsou typovaná
- UI nikdy nepracuje přímo s JSON soubory
- přístup k datům probíhá přes loadery ve feature vrstvě

Tento přístup umožňuje plynulý přechod na databázi nebo API.

---

## 8. Stabilní klíče vs. UI popisky

Data používají stabilní interní klíče (bez diakritiky).
UI zobrazuje české popisky pomocí mapování.

Příklad:
Data:
equipment = ["cones", "ladder"]

UI:
cones → Kloboučky
ladder → Koordinační žebřík

yaml
Zkopírovat kód

Tento přístup:
- odděluje data od prezentace,
- umožňuje vícejazyčnost,
- zajišťuje stabilitu datového modelu.

---

## 9. Responzivita a design

Aplikace je navržena **mobile-first** přístupem.

- Tailwind CSS
- responzivní layout (telefon / tablet / desktop)
- jednoduché a přehledné UI
- optimalizace pro použití při tréninku

---

## 10. Připravenost na budoucí rozšíření

Architektura je připravena na:
- rozšíření autentizace,
- admin rozhraní,
- správu dat (CRUD),
- práci s médii (obrázky, videa),
- vícejazyčnost,
- přechod na databázi / API.

Bez nutnosti zásadních změn v existujícím kódu.

---

## 11. Shrnutí

Architektura projektu **TableTennis Drills** odpovídá aktuálnímu stavu MVP,
je čitelná, udržitelná a podporuje jak rychlý vývoj,
tak dlouhodobé rozšiřování aplikace.