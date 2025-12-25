# TableTennis Drills
Live demo: https://tabletennis-drills.vercel.app

> Pracovní dokumentace projektu.  
> README slouží jako **vstupní bod do projektu** – vysvětluje, co projekt je,
> pro koho je určen a jaký je jeho rozsah.  
> Detailní technická a architektonická dokumentace je uložena ve složce `/docs`.

Repozitář: `tabletennis-drills`

---

## 1) Vize a smysl projektu

TableTennis Drills je webová aplikace pro stolní tenis, určená především
trenérům a hráčům. Umožňuje rychle procházet a vybírat tréninková cvičení
podle jednoduchých filtrů.

Aplikace je navržena tak, aby:
- byla okamžitě použitelná v praxi (hala, tělocvična, telefon),
- byla dlouhodobě rozšiřitelná,
- a dala se v budoucnu přizpůsobit i jiným sportům.

---

## 2) Cílová skupina

- Trenéři stolního tenisu
- Hráči stolního tenisu (self-training)

---

## 3) Hlavní cíle projektu

- Jednoduché a rychlé rozhraní pro výběr cvičení.
- Profesionální kvalita kódu (čitelnost, typy, struktura).
- Veřejně dostupná funkční aplikace.
- Mobile-first a plně responzivní design.

### Přístup k vývoji
- Nejdříve jednoduchá, funkční verze (MVP).
- Postupné a řízené rozšiřování o další funkcionality.
- Architektura připravená na růst bez nutnosti velkých refaktorů.

---

## 4) MVP – první funkční verze

### Hlavní stránka (`/`)
- Krátké vysvětlení:
  - co aplikace je,
  - pro koho je určena.
- Základní branding (název, logo).
- Filtry + seznam cvičení.
- Místo pro sponzory (placeholder).
- Footer (odkazy, GitHub, kontakt).

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

Filtry jsou navrženy tak, aby:
- byly maximálně jednoduché,
- fungovaly intuitivně i na mobilních zařízeních.

---

### Seznam cvičení

Seznam slouží jako rychlý přehled a zobrazuje:
- název,
- krátký popis,
- typ cvičení,
- věkovou kategorii,
- doporučenou délku.

Uživatel získá základní informace i bez otevření detailu.

---

### Detail cvičení

Každé cvičení má:
- **unikátní ID (slug)**,
- samostatnou stránku (např. `/drills/[id]`).

Detail obsahuje:
- název,
- plný popis,
- typ cvičení,
- věkovou kategorii,
- doporučenou délku,
- pomůcky,
- tagy,
- autora / zdroj (pokud je uveden).

---

## 5) Datový model cvičení (MVP – přehled)

Každé cvičení obsahuje:

- `id` – unikátní identifikátor (string / slug)
- `title` – název cvičení
- `description` – textový popis
- `category` – typ cvičení (stabilní klíč)
- `ageGroup` – věková kategorie (stabilní klíč)
- `durationMinutes` – doporučená délka
- `equipment` – seznam pomůcek (pokud relevantní)
- `tags` – seznam tagů
- `author` – autor nebo zdroj (volitelné)

> Poznámka:  
> Data používají **stabilní klíče**, zatímco UI zobrazuje **české popisky**
> definované v konfiguračních konstantách.

Detailní popis datového modelu je v `docs/data-model.md`.

---

## 6) Typy cvičení

- Servis
- Kombinace se servisem
- Kombinace bez servisu
- Pravidelné kombinace
- Nepravidelné kombinace
- Pravidelně–nepravidelné kombinace
- Rozcvička
- Strečink
- Zásobník (multiball)

---

## 7) Pomůcky

### Poznámka
- U běžných kombinací jsou základní pomůcky implicitní
  (stůl, míčky, pálka).
- U sportovních her a specifických cvičení se pomůcky uvádějí explicitně.

### Pevně definovaný seznam pomůcek (CZ popisky)

- Kloboučky
- Ohrádky
- Koordinační žebřík
- Švihadlo
- Robot
- Zásobník (multiball)
- Stopky

---

## 8) Technologie (rozhodnuto)

- Framework: **Next.js** (App Router)
- UI knihovna: **React**
- Jazyk: **TypeScript**
- Styling: **Tailwind CSS**
- Hosting: **Vercel**

---

## 9) Přístupnost a design

- Mobile-first přístup (primárně telefony).
- Responzivní layout pro telefon, tablet i desktop.
- Jednoduché a přehledné UI.
- Důraz na rychlou orientaci a použitelnost v praxi.

---

## 10) Budoucí rozšíření (po MVP)

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
- Přechod z JSON souborů na robustnější úložiště.
- Zachování kompatibility se stávajícím datovým modelem.

---

## 11) Non-goals (vědomě neřešíme v MVP)

- Přihlášení a uživatelské účty
- Admin rozhraní
- Média (obrázky, videa)
- Vícejazyčnost

---

## 12) Definition of Done – MVP

MVP je považováno za hotové, pokud:
- fungují filtry podle věku a typu cvičení,
- existuje seznam cvičení i jejich detail,
- data jsou načítána z JSON přes datovou vrstvu,
- aplikace je responzivní,
- aplikace je nasazená a veřejně dostupná.

---

## 13) Architektura a další dokumentace

- Detailní architektura: `docs/architecture.md`
- Datový model: `docs/data-model.md`
- Rozhodnutí (ADR): `docs/decisions/`
