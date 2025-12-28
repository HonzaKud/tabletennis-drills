Architektura projektu – TableTennis Drills

Tento dokument popisuje architekturu projektu TableTennis Drills, hlavní technická rozhodnutí a strukturu aplikace v aktuálním stavu (MVP).

Cílem architektury je:

umožnit rychlý vývoj funkčního MVP

zachovat čitelnost a jednoduchost kódu

jasně oddělit doménovou logiku, UI a data

připravit projekt na budoucí rozšíření bez nutnosti velkých refaktorů

1) Přehled architektury

Aplikace je postavena jako moderní webová aplikace s využitím:

Next.js (App Router)

React

TypeScript

Tailwind CSS

JSON dat (MVP)

Architektura je navržena tak, aby:

UI nepracovalo přímo s datovým zdrojem

doménová logika byla soustředěna do feature modulů

datový zdroj (JSON → databáze / API) šel vyměnit bez zásahu do UI

2) Rozhodnutí: Next.js + App Router
Důvody volby Next.js

vestavěný routing

možnost server-side i static renderingu

jasná struktura projektu

bezproblémový deployment na Vercel

připravenost na budoucí backend (API routes)

App Router

moderní standard Next.js

práce s layouty a routami

oddělení server a client komponent

dlouhodobá udržitelnost projektu

3) Rozhodnutí: React + TypeScript

React jako UI knihovna (součást Next.js)

TypeScript zajišťuje:

typovou bezpečnost

konzistentní datový model

snadnější refaktoring

nižší chybovost při růstu projektu

4) Vrstvy aplikace
Routing a stránky (src/app)

definice URL struktury

layouty a stránky

navigace mezi stránkami

client a server komponenty dle potřeby

Feature vrstva (src/features)

doménová logika aplikace

komponenty, typy a helpery vztahující se ke konkrétní doméně

příklad: features/drills

Datová vrstva (src/data)

JSON soubory sloužící jako zdroj dat v MVP

data jsou verzována v Git repozitáři

Sdílené UI komponenty (src/components)

layoutové a znovupoužitelné komponenty

Header, Footer, Sponsors apod.

Dokumentace (docs)

architektura

datový model

technická rozhodnutí (ADR)

5) Struktura adresářů (aktuální)

src/

app/

features/

data/

components/

styles/

docs/

Adresářová struktura je záměrně jednoduchá a odpovídá rozsahu MVP.

6) Feature-first přístup

Projekt používá feature-first strukturu.

Příklad struktury:

features/drills/

components/

data/

types/

index.ts

Výhody:

jasné oddělení doménové logiky

snadné přidávání dalších feature

lepší orientace v projektu

omezení vzájemných závislostí

7) Datová architektura (MVP)
Zdroj dat

JSON soubory v src/data/drills/

jazyk dat: čeština

data jsou součástí repozitáře

struktura dat je popsána v docs/data-model.md

Přístup k datům

UI komponenty nepracují přímo s JSON

data jsou načítána přes loader ve feature vrstvě

UI pracuje pouze s typovanými daty

Tento přístup umožňuje:

pozdější přechod na databázi nebo API

zachování stejného rozhraní pro UI

8) Stabilní klíče vs. UI popisky

Rozhodnutí:

data používají stabilní interní klíče

UI zobrazuje české popisky

Příklad:

Data:
ageGroup = "U13"
equipment = ["cones", "ladder"]

UI:
cones → Kloboučky
ladder → Koordinační žebřík

Tento přístup:

zajišťuje stabilitu dat

umožňuje budoucí vícejazyčnost

odděluje data od prezentace

9) Routingová struktura
MVP

/ – landing stránka s filtry

/drills – seznam cvičení (výsledky)

Budoucí rozšíření

/drills/[id] – detail cvičení

/login

/admin

/admin/drills

/profile

10) Responzivita a design

mobile-first přístup

Tailwind CSS

jednoduché a přehledné UI

optimalizováno pro použití při tréninku

11) Připravenost na budoucí rozšíření

Architektura je připravena na:

autentizaci uživatelů

admin rozhraní

validaci dat

přechod na databázi

práci s médii (obrázky, videa)

vícejazyčnost

12) Shrnutí

Architektura projektu:

odpovídá aktuálnímu stavu MVP

podporuje rychlý vývoj

je čitelná a udržitelná

umožňuje postupné rozšiřování bez zásadních změn