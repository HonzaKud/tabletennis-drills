# TableTennis Drills

Live demo: https://tabletennis-drills.vercel.app

> Pracovní dokumentace projektu.  
> Slouží jako hlavní zdroj pravdy pro aktuální stav aplikace, její smysl,
> architekturu a další směřování.  
> Dokumentace odpovídá **reálnému stavu kódu (MVP)**.

---

## Requirements

- **Node.js**: doporučeno 18+ (ověřeno lokálně i na Vercelu)
- **npm**: dle Node instalace

---

## 1) Vize a smysl projektu

**TableTennis Drills** je webová aplikace pro stolní tenis, určená především
trenérům a aktivním hráčům.  
Umožňuje **rychle procházet a vybírat tréninková cvičení** pomocí jednoduchých
a srozumitelných filtrů.

Projekt je od začátku navržen tak, aby:
- byl snadno použitelný přímo v hale / tělocvičně
- měl čistý, čitelný a typově bezpečný kód
- byl dlouhodobě udržitelný a snadno rozšiřitelný

Datový i doménový model je záměrně **obecný**, aby bylo možné aplikaci v budoucnu
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

- Nejprve stabilní a funkční MVP
- Dokumentace jako zdroj pravdy
- Postupné rozšiřování bez zbytečné komplexity

---

## 4) MVP – aktuální stav aplikace

### Routing (MVP)

- `/login` – přihlášení uživatele
- `/` – hlavní stránka s filtry a úvodem (chráněná)
- `/drills` – seznam cvičení
- `/drills/[id]` – detail cvičení

> Poznámka:  
> Aplikace je v MVP **přístupná pouze přihlášeným uživatelům**.

---

### Hlavní stránka (`/`)

Obsahuje:
- stručné vysvětlení:
  - co aplikace je
  - pro koho je určena
- základní branding (název / logo)
- filtry cvičení
- tlačítko **Vyhledat** (navigace na `/drills`)
- placeholder pro sponzory
- footer (GitHub, základní odkazy)

Na hlavní stránce se **nezobrazuje seznam cvičení** – slouží jako vstupní bod
a rozcestník.

---

### Filtry (MVP)

#### Věková kategorie (UI)

- U9
- U11
- U13
- U15
- U17
- Dospělí

#### Speciální hodnota

- **ALL** – cvičení vhodná pro všechny věkové kategorie  
  (např. rozcvička, strečink)

> V datech je `ALL` reprezentováno explicitně a filtr ho vždy zahrne.

---

### Typ cvičení (UI popisky)

- Servis
- Kombinace se servisem
- Kombinace bez servisu
- Pravidelné kombinace
- Nepravidelné kombinace
- Pravidelně–nepravidelné kombinace
- Rozcvička
- Strečink
- Zásobník (multiball)

> V UI se používají **české popisky**,  
> v datech **stabilní interní klíče**  
> (viz `docs/data-model.md`).

---

### Seznam cvičení (`/drills`)

Zobrazuje:
- název
- krátký popis
- typ cvičení
- věkovou kategorii
- doporučenou délku

Slouží jako rychlý přehled bez nutnosti detailního studia.

---

### Detail cvičení (`/drills/[id]`)

Obsahuje:
- název cvičení
- popis
- typ cvičení
- věkovou kategorii
- délku trvání
- seznam pomůcek
- tagy

Detail je připravený na budoucí rozšíření o média a další metadata.

---

## 5) Datový model cvičení (MVP)

Každé cvičení obsahuje:

- `id` – unikátní identifikátor (string / slug)
- `title` – název cvičení
- `description` – textový popis
- `category` – typ cvičení (interní klíč)
- `ageGroup` – věková kategorie (`U9` … `ADULT` | `ALL`)
- `durationMinutes` – doporučená délka
- `equipment` – seznam pomůcek
- `tags` – seznam tagů
- `image?` – volitelný obrázek (připraveno do budoucna)

---

## 6) Pomůcky

### Poznámka

- U běžných kombinací jsou základní pomůcky implicitní  
  (stůl, míčky, pálka)
- U specifických cvičení se pomůcky uvádějí explicitně

### Pevně definovaný seznam (UI – CZ)

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

## 7) Autentizace (Auth v1)

Aplikace obsahuje vlastní autentizační vrstvu navrženou jako
produkčně realistické MVP.

### Vlastnosti

- session-based autentizace (httpOnly cookies)
- server-side ověřování uživatele
- chráněné routy pomocí `(protected)` layoutu
- rate limiting přihlašování
- audit log autentizačních událostí
- demo účet (konfigurovatelný přes env)

### Účel

Autentizace v MVP slouží především:
- k ochraně aplikace
- jako architektonická reference
- jako základ pro budoucí rozšíření

Veřejná registrace zatím není součástí projektu.

---

## 8) Technologie

- Framework: **Next.js (App Router)**
- UI: **React**
- Jazyk: **TypeScript**
- Styling: **Tailwind CSS**
- Hosting: **Vercel**
- Data (MVP): **JSON soubory**
- Auth state / rate limiting: **Vercel KV (Upstash)**

---

## 9) Přístupnost a design

- Mobile-first přístup
- Responzivní layout (telefon / tablet / desktop)
- Jednoduché a přehledné UI
- Optimalizováno pro použití při tréninku

---

## 10) Budoucí rozšíření (mimo MVP)

### Média
- obrázky
- videa
- YouTube odkazy

### Uživatelé
- invite-only onboarding
- role (admin / editor)
- admin rozhraní

### Data
- přechod z JSON na databázi
- zachování kompatibility datového modelu

---

## 11) Backlog (bez závazku)

- Invite-only onboarding
- Admin rozhraní
- Správa cvičení (CRUD)
- Vyhledávání
- Obtížnost cvičení
- Varianty cvičení
- Vícejazyčnost
- Export / tisk
- Přizpůsobení pro jiné sporty

---

## 12) Struktura projektu

Projekt je postavený na Next.js (App Router) a TypeScriptu.

Hlavní části:
- `src/app` – routy a stránky
- `src/features` – doménová logika
- `src/data` – JSON data (MVP)
- `src/components` – layout a UI komponenty
- `src/server` – server-side logika (auth, rate limit, audit)
- `docs` – architektura, datový model, ADR

Struktura odpovídá **feature-first přístupu** a je navržena tak,
aby byla dlouhodobě udržitelná.
