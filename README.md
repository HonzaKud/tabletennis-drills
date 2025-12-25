# TableTennis Drills

Live demo: https://tabletennis-drills.vercel.app

> Pracovní dokumentace projektu. Slouží jako hlavní zdroj pravdy pro kontext,
> rozhodnutí a další vývoj. Později se rozdělí do více souborů ve složce `/docs`.

---

## Requirements

- **Node.js**: 22+
- **npm**: dle Node instalace

---

## 1) Vize a smysl projektu

TableTennis Drills je webová aplikace pro stolní tenis, určená především
trenérům a hráčům. Umožňuje procházet a vybírat tréninková cvičení
podle jednoduchých filtrů.

Návrh aplikace je do určité míry **obecný**, aby bylo možné ji v budoucnu
přizpůsobit i jiným sportům.

---

## 2) Cílová skupina

- Trenéři stolního tenisu
- Hráči stolního tenisu (self-training)

---

## 3) Hlavní cíle projektu

- Jednoduché a rychlé rozhraní pro výběr cvičení
- Profesionální kvalita kódu (čitelnost, typy, struktura)
- Veřejně dostupná funkční aplikace
- Mobile-first a responzivní design

### Přístup k vývoji
- Nejdříve jednoduchá funkční verze (MVP)
- Postupné rozšiřování o další funkcionality

---

## 4) MVP – první funkční verze

### Hlavní stránka
- Stručné vysvětlení:
  - co aplikace je
  - pro koho je určena
- Základní branding (název, jednoduché logo / textové logo)
- Filtry + seznam cvičení
- Placeholder pro sponzory
- Footer (GitHub, základní odkazy)

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
> V UI se používají **české popisky**, v datech jsou použity **stabilní interní klíče**
> (viz `data-model.md`).

---

### Seznam cvičení

Zobrazuje základní informace:
- název
- krátký popis
- typ cvičení
- věková kategorie
- doporučená délka

Slouží jako rychlý přehled bez nutnosti přecházet na detail.

---

### Detail cvičení

Každé cvičení má:
- vlastní **unikátní ID (slug)**
- samostatnou stránku (např. `/drills/[id]`)

Detail obsahuje:
- název
- plný popis
- typ cvičení
- věkovou kategorii
- doporučenou délku
- pomůcky
- tagy

---

## 5) Datový model cvičení (MVP)

Každé cvičení obsahuje:

- `id` – unikátní identifikátor (string / slug)
- `title` – název cvičení
- `description` – textový popis
- `category` – typ cvičení (interní klíč)
- `ageGroup` – věková kategorie
- `durationMinutes` – doporučená délka
- `equipment` – seznam pomůcek (pokud relevantní)
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
- U her a specifických cvičení se pomůcky uvádějí explicitně

### Pevně definovaný seznam pomůcek (CZ)

- Kloboučky
- Ohrádky
- Koordinační žebřík
- Švihadlo
- Robot
- Zásobník (multiball)
- Stopky

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
- Jednoduché, přehledné UI
- Důraz na rychlou orientaci a použitelnost v hale / tělocvičně

---

## 10) Budoucí rozšíření

### Média
- Obrázky
- Videa
- YouTube odkazy
- Ikony

### Uživatelé
- Přihlášení
- Validace
- Admin rozhraní pro správu cvičení

### Data
- Přechod z JSON na databázi
- Zachování kompatibility datového modelu

---

## 11) Backlog (bez závazku)

- Autentizace uživatelů
- Admin rozhraní
- Správa cvičení (CRUD)
- Obrázky a videa u cvičení
- Vyhledávání
- Obtížnost cvičení
- Varianty cvičení
- Vícejazyčnost
- Export / tisk
- Možnost přizpůsobení pro jiné sporty

---

## 12) Struktura projektu (návrh)

Projekt je postavený na Next.js (App Router) a TypeScriptu.  
Struktura je navržena tak, aby MVP bylo jednoduché, ale bylo možné později
přidat autentizaci, admin rozhraní, databázi a validace bez velkého refaktoringu.

Hlavní části:
- `src/app` – routy a stránky
- `src/features` – doménová logika (např. drills)
- `src/data` – JSON data (MVP)
- `src/lib` – utility, validace, konstanty
- `src/components` – layout a obecné UI komponenty
- `docs` – architektura, datový model, rozhodnutí
