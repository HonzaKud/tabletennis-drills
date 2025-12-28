# TableTennis Drills

Live demo: https://tabletennis-drills.vercel.app

> Pracovní dokumentace projektu.  
> Slouží jako hlavní zdroj pravdy pro aktuální stav aplikace, její smysl,
> strukturu a další směřování.  
> Dokumentace odpovídá **reálnému stavu kódu** (MVP).

---

## Requirements

- **Node.js**: doporučeno 18+ (ověřeno lokálně i na Vercelu)
- **npm**: dle Node instalace

---

## 1) Vize a smysl projektu

**TableTennis Drills** je webová aplikace pro stolní tenis, určená především
trenérům a hráčům.  
Umožňuje **rychle procházet a vybírat tréninková cvičení** pomocí jednoduchých
filtrů.

Projekt je od začátku navržen tak, aby:
- byl snadno pochopitelný a použitelný přímo v hale / tělocvičně
- měl čistý a čitelný kód
- bylo možné ho v budoucnu rozšířit (detail cvičení, média, databáze)

Datový a doménový model je záměrně **obecný**, aby bylo možné aplikaci později
přizpůsobit i jiným sportům.

---

## 2) Cílová skupina

- Trenéři stolního tenisu
- Aktivní hráči (self-training)

---

## 3) Hlavní cíle projektu

- Jednoduché a rychlé rozhraní pro výběr cvičení
- Jasně strukturovaný a typovaný kód
- Veřejně dostupná funkční aplikace (MVP)
- Mobile-first a responzivní design

### Přístup k vývoji

- Nejprve funkční a stabilní MVP
- Dokumentace jako zdroj pravdy
- Postupné rozšiřování bez velkých refaktorů

---

## 4) MVP – aktuální stav aplikace

### Routing (MVP)

- `/` – landing stránka s filtry a úvodem
- `/drills` – stránka se seznamem cvičení (výsledky)

---

### Hlavní stránka (`/`)

Obsahuje:
- stručné vysvětlení:
  - co aplikace je
  - pro koho je určena
- základní branding (název / jednoduché logo)
- filtry cvičení
- tlačítko **Vyhledat** (navigace na `/drills`)
- placeholder pro sponzory
- footer (GitHub, základní odkazy)

Na hlavní stránce se **nezobrazuje seznam cvičení** – slouží primárně jako
vstupní bod a rozcestník.

---

### Filtry (MVP)

- **Věková kategorie**
  - U9
  - U11
  - U13
  - U15
  - U17
  - Dospělí

- **Typ cvičení**
  - viz seznam níže

> Poznámka:  
> V UI se používají **české popisky**,  
> v datech jsou použity **stabilní interní klíče**  
> (viz `docs/data-model.md`).

---

### Seznam cvičení (`/drills`)

Zobrazuje základní informace o každém cvičení:
- název
- krátký popis
- typ cvičení
- věková kategorie
- doporučená délka

Slouží jako rychlý přehled bez nutnosti detailního zobrazení.

---

## 5) Datový model cvičení (MVP)

Každé cvičení obsahuje:

- `id` – unikátní identifikátor (string / slug)
- `title` – název cvičení
- `description` – textový popis
- `category` – typ cvičení (interní klíč)
- `ageGroup` – věková kategorie
- `durationMinutes` – doporučená délka
- `equipment` – seznam pomůcek (pole, může být prázdné)
- `tags` – seznam tagů (v datech již v MVP, UI později)

---

## 6) Typy cvičení (UI popisky)

- Servis
- Kombinace se servisem
- Kombinace bez servisu
- Pravidelné kombinace
- Nepravidelné kombinace
- Pravidelně–nepravidelné kombinace
- Rozcvička
- Strečink
- Zásobník (multiball)

> Interně jsou typy reprezentovány stabilními klíči  
> (např. `serve`, `regular_combo`, `irregular_combo`, …).

---

## 7) Pomůcky

### Poznámka

- U běžných kombinací jsou základní pomůcky implicitní  
  (stůl, míčky, pálka)
- U specifických cvičení se pomůcky uvádějí explicitně

### Pevně definovaný seznam pomůcek (UI – CZ)

- Kloboučky
- Ohrádky
- Koordinační žebřík
- Švihadlo
- Robot
- Zásobník (multiball)
- Stopky

Interně jsou pomůcky reprezentovány stabilními klíči  
(viz `docs/data-model.md`).

---

## 8) Technologie

- Framework: **Next.js (App Router)**
- UI: **React**
- Jazyk: **TypeScript**
- Styling: **Tailwind CSS**
- Hosting: **Vercel**
- Data (MVP): **JSON soubory**

---

## 9) Přístupnost a design

- Mobile-first přístup
- Responzivní layout (telefon / tablet / desktop)
- Jednoduché a přehledné UI
- Optimalizováno pro použití při tréninku

---

## 10) Budoucí rozšíření (mimo MVP)

### Detail cvičení
- samostatná stránka cvičení (`/drills/[id]`)
- detailní popis
- média (obrázky, video, YouTube)

### Média
- obrázky
- videa
- ikony a ilustrace

### Uživatelé
- přihlášení
- role (admin / editor)
- admin rozhraní

### Data
- přechod z JSON na databázi
- zachování kompatibility datového modelu

---

## 11) Backlog (bez závazku)

- Autentizace uživatelů
- Admin rozhraní
- Správa cvičení (CRUD)
- Vyhledávání
- Obtížnost cvičení
- Varianty cvičení
- Vícejazyčnost
- Export / tisk
- Přizpůsobení pro jiné sporty

---

## 12) Struktura projektu (aktuální)

Projekt je postavený na Next.js (App Router) a TypeScriptu.

Hlavní části:
- `src/app` – routy a stránky
- `src/features` – doménová logika (např. drills)
- `src/data` – JSON data (MVP)
- `src/components` – layout a obecné UI komponenty
- `docs` – architektura, datový model, rozhodnutí (ADR)
