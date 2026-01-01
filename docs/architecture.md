# Architektura projektu – TableTennis Drills

Tento dokument popisuje architekturu projektu TableTennis Drills, hlavní technická rozhodnutí a strukturu aplikace v aktuálním stavu (MVP).

Cílem architektury je umožnit rychlý vývoj funkčního MVP, zachovat čitelnost a jednoduchost kódu, jasně oddělit doménovou logiku, UI a data a připravit projekt na budoucí rozšíření bez nutnosti velkých refaktorů.

## 1) Přehled architektury

Aplikace je postavena jako moderní webová aplikace s využitím následujících technologií: Next.js (App Router), React, TypeScript, Tailwind CSS a JSON data jako zdroj dat v MVP.

Architektura je navržena tak, aby UI nepracovalo přímo s datovým zdrojem, doménová logika byla soustředěna do feature modulů a datový zdroj (JSON → databáze / API) šel vyměnit bez zásahu do UI vrstvy.

## 2) Rozhodnutí: Next.js + App Router

Next.js byl zvolen z následujících důvodů: vestavěný routing, možnost server-side i static renderingu, jasná a škálovatelná struktura projektu, bezproblémový deployment (Vercel / GitHub Pages) a připravenost na budoucí backend (API routes).

App Router je použit jako moderní standard Next.js. Umožňuje práci s layouty a routami, oddělení server a client komponent a dlouhodobou udržitelnost projektu.

## 3) Rozhodnutí: React + TypeScript

React je použit jako UI knihovna (součást Next.js). TypeScript zajišťuje typovou bezpečnost, konzistentní datový model, snadnější refaktoring a nižší chybovost při růstu projektu.

Datové typy jsou sdílené mezi loaderem, UI a routingem, což zajišťuje jednotný kontrakt napříč aplikací.

## 4) Vrstvy aplikace

### Routing a stránky (`src/app`)

Vrstva `src/app` definuje URL strukturu aplikace, layouty a stránky. Obsahuje logiku navigace mezi stránkami a kombinuje server a client komponenty podle potřeby.

Routing odpovídá aktuálnímu MVP:
- `/` – landing stránka s filtry
- `/drills` – seznam cvičení
- `/drills/[id]` – detail cvičení

### Feature vrstva (`src/features`)

Feature vrstva obsahuje doménovou logiku aplikace. Každá feature (např. `drills`) má vlastní strukturu zahrnující typy, datové loadery, helpery a UI komponenty vztahující se ke konkrétní doméně.

Feature vrstva slouží jako mezivrstva mezi UI a datovým zdrojem.

### Datová vrstva (`src/data`)

Datová vrstva obsahuje JSON soubory sloužící jako zdroj dat v MVP. Data jsou verzována v Git repozitáři a jejich struktura je popsána v dokumentu `docs/data-model.md`.

Zdroj dat je považován za vyměnitelný detail (JSON → databáze / API).

### Sdílené UI komponenty (`src/components`)

Obsahuje layoutové a znovupoužitelné UI komponenty, které nejsou svázané s konkrétní doménou. Patří sem například Header, Footer, Sponsors a obecné UI prvky.

### Statické assety (`src/assets`)

Adresář `src/assets` obsahuje statické grafické podklady používané v aplikaci (loga, SVG, branding, sponzoři apod.). Assety nejsou součástí doménové logiky.

### Dokumentace (`docs` – root projektu)

Adresář `docs` se nachází v kořeni repozitáře a obsahuje technickou dokumentaci projektu – architekturu, datový model a technická rozhodnutí (ADR). Dokumentace slouží jako zdroj pravdy pro další vývoj projektu.

## 5) Struktura adresářů (aktuální)

Aktuální struktura projektu:

/
├─ docs/
│  ├─ architecture.md
│  ├─ data-model.md
│  └─ decisions/
│
├─ src/
│  ├─ app/
│  ├─ features/
│  ├─ data/
│  ├─ components/
│  └─ assets/
│
└─ public/

Styly jsou řešeny pomocí Tailwind CSS a globálního souboru `src/app/globals.css`. Samostatný adresář `styles/` není v projektu používán. Adresářová struktura je záměrně jednoduchá a odpovídá rozsahu MVP.

## 6) Feature-first přístup

Projekt používá feature-first strukturu. Každá doména (např. drills) je izolovaná do vlastního modulu.

Příklad struktury feature:
features/drills/
├─ components/
├─ data/
├─ types/
└─ index.ts

Tento přístup zajišťuje jasné oddělení doménové logiky, snadné přidávání dalších feature, lepší orientaci v projektu a omezení vzájemných závislostí.

## 7) Datová architektura (MVP)

Zdroj dat tvoří JSON soubory v `src/data/drills/`. Jazyk dat je čeština. Data jsou součástí repozitáře a jejich struktura je stabilně popsána v `docs/data-model.md`.

UI komponenty nepracují přímo s JSON soubory. Přístup k datům je realizován pomocí loaderů ve feature vrstvě. UI pracuje výhradně s typovanými daty.

Tento přístup umožňuje pozdější přechod na databázi nebo API při zachování stejného rozhraní pro UI.

## 8) Stabilní klíče vs. UI popisky

Data používají stabilní interní klíče bez diakritiky. UI zobrazuje české popisky pomocí mapování v konfiguračních konstantách.

Příklad:
Data:
ageGroup = "U13"
equipment = ["cones", "ladder"]

UI:
cones → Kloboučky
ladder → Koordinační žebřík

Tento přístup zajišťuje stabilitu dat, umožňuje budoucí vícejazyčnost a odděluje data od prezentace.

## 9) Routingová struktura

Aktuální MVP routing:
- `/` – landing stránka s filtry
- `/drills` – seznam cvičení
- `/drills/[id]` – detail cvičení

Možná budoucí rozšíření:
- `/login`
- `/admin`
- `/admin/drills`
- `/profile`

## 10) Responzivita a design

Aplikace je navržena mobile-first přístupem. Styling je realizován pomocí Tailwind CSS. UI je jednoduché, přehledné a optimalizované pro použití při tréninku (telefon, tablet, desktop).

## 11) Připravenost na budoucí rozšíření

Architektura je připravena na autentizaci uživatelů, admin rozhraní, validaci dat, přechod na databázi / API, práci s médii (obrázky, videa) a vícejazyčnost bez nutnosti zásadních architektonických změn v existujícím kódu.

## 12) Shrnutí

Architektura projektu TableTennis Drills odpovídá aktuálnímu stavu MVP, je čitelná, udržitelná a podporuje rychlý vývoj i budoucí rozšiřování projektu.
