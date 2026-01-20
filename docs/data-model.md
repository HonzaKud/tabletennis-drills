# Datový model – TableTennis Drills

Tento dokument popisuje **datový model aplikace TableTennis Drills**.
Slouží jako **stabilní kontrakt** mezi daty (JSON / databáze / API),
aplikační logikou a UI vrstvou.

V dokumentaci jsou pojmy **„cvičení“** a **„drill“** používány jako synonyma.

Zdroj dat (JSON, databáze, API) je považován za **vyměnitelný detail**.
Struktura dat a význam jednotlivých polí jsou považovány za **stabilní**.

---

## 1. Základní principy datového modelu

- Každé cvičení je **samostatná entita**.
- Každé cvičení má **unikátní identifikátor** (`id` / slug).
- Data používají **stabilní interní klíče** (bez diakritiky, bez mezer).
- Uživatelsky čitelné popisky (čeština) se řeší **výhradně v UI vrstvě**.
- Datový model je:
  - použitelný v MVP (JSON),
  - připravený na databázi,
  - rozšiřitelný bez porušení zpětné kompatibility.

---

## 2. Entita: Cvičení (Drill)

Jedno cvičení reprezentuje **jeden konkrétní tréninkový drill nebo kombinaci**.

### Povinná pole (MVP)
- `id`
- `title`
- `description`
- `category`
- `ageGroup`
- `durationMinutes`
- `equipment`
- `tags`

### Volitelná pole (MVP-ready)
- `image`

---

## 3. Detailní popis polí

### `id`
- typ: `string`
- povinné: **ano**

Unikátní identifikátor cvičení.
Používá se pro routing, odkazy a interní identifikaci.

- formát: slug (lowercase, pomlčky)
- příklad:  
  `fh-bh-basic-combo`

---

### `title`
- typ: `string`
- povinné: **ano**

Krátký název cvičení zobrazovaný v seznamu i detailu.

- příklad:  
  `Základní kombinace FH–BH`

---

### `description`
- typ: `string`
- povinné: **ano**

Textový popis cvičení.
Vysvětluje průběh, cíl a základní provedení.

> Poznámka:  
> V MVP se jedná o čistý text bez formátování (Markdown / HTML se zatím nepoužívá).

---

### `category`
- typ: `string` (stabilní klíč)
- povinné: **ano**

Typ cvičení. Používá se pro filtrování a kategorizaci.

#### Povolené hodnoty (MVP)
- `serve`
- `serve_combo`
- `no_serve_combo`
- `regular_combo`
- `irregular_combo`
- `mixed_regular_irregular`
- `warmup`
- `stretching`
- `multiball`

> Poznámka:  
> UI zobrazuje české popisky pomocí mapování v konfiguračních konstantách.

---

### `ageGroup`
- typ: `string` (stabilní klíč)
- povinné: **ano**

Doporučená věková kategorie pro cvičení.

#### Povolené hodnoty
- `U9`
- `U11`
- `U13`
- `U15`
- `U17`
- `ADULT`
- `ALL`

> Poznámka:  
> Hodnota `ALL` označuje cvičení vhodná pro všechny věkové kategorie  
> (např. rozcvička, strečink).  
> Ve filtrech je hodnota `ALL` vždy implicitně zahrnuta.

---

### `durationMinutes`
- typ: `number`
- povinné: **ano**

Doporučená délka cvičení v minutách.

- příklad:  
  `10`

---

### `equipment`
- typ: `string[]` (stabilní klíče)
- povinné: **ano** (pole vždy existuje, může být prázdné)

Seznam pomůcek potřebných ke cvičení.

Prázdné pole znamená, že nejsou potřeba žádné specifické pomůcky nad rámec
základního vybavení (stůl, míčky, pálka).

#### Povolené hodnoty (MVP)
- `cones`
- `barriers`
- `ladder`
- `jump_rope`
- `robot`
- `multiball_basket`
- `stopwatch`

---

### `tags`
- typ: `string[]`
- povinné: **ano** (pole vždy existuje, může být prázdné)

Volitelné tagy popisující cvičení.

- slouží pro budoucí rozšíření (vyhledávání, doporučení, filtrování),
- v MVP se jedná o **volné texty** (ne stabilní klíče).

Příklady:
- `forehand`
- `backhand`
- `topspin`
- `footwork`
- `consistency`

---

### `image`
- typ: `string`
- povinné: **ne**

Cesta nebo URL k obrázku cvičení.

Pole je již podporováno v kódu a UI, ale jeho použití je v MVP volitelné.

- příklad:  
  `/images/drills/fh-bh-basic-combo.png`

---

## 4. Příklad cvičení (JSON – MVP)

```json
{
  "id": "fh-bh-basic-combo",
  "title": "Základní kombinace FH–BH",
  "description": "Hráč hraje pravidelnou kombinaci forhend–bekhend s důrazem na správné postavení a rytmus.",
  "category": "regular_combo",
  "ageGroup": "U13",
  "durationMinutes": 10,
  "equipment": [],
  "tags": ["forehand", "backhand", "consistency"]
}
5. Rozšiřitelnost datového modelu
Datový model je navržen tak, aby bylo možné bez porušení existujících dat
přidat například:

média (images, videos, youtubeId)

obtížnost (difficulty)

cíle cvičení (goals)

varianty cvičení

jazykové mutace

Všechna nová pole musí být:

volitelná,

zpětně kompatibilní,

zdokumentovaná v tomto souboru.

6. Shrnutí
Tento datový model definuje stabilní kontrakt aplikace TableTennis Drills.
Odpovídá aktuálnímu stavu MVP, odděluje data od UI,
umožňuje plynulý přechod z JSON na databázi
a slouží jako hlavní reference pro další vývoj.
