# ADR 0001 – Volba technologického stacku

Datum: 2025-12-23  
Stav: Přijato

---

## Kontext

Projekt TableTennis Drills je webová aplikace zaměřená na práci s tréninkovými
cvičeními. Projekt je vyvíjen iterativně, bez pevně dané roadmapy, s důrazem na:

- rychlý vývoj funkčního MVP,
- čitelnost a udržitelnost kódu,
- možnost postupného rozšiřování,
- nasazení veřejně dostupné aplikace.

Technologický stack musí:
- podporovat moderní frontendový vývoj,
- umožnit server-side rendering,
- být vhodný pro práci s daty (JSON → databáze),
- minimalizovat nutnost budoucích refaktorů.

---

## Rozhodnutí

Byl zvolen následující technologický stack:

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- JSON soubory jako zdroj dat pro MVP
- Hosting na platformě Vercel

---

## Důvody rozhodnutí

### Next.js (App Router)
- moderní framework nad Reactem,
- podpora server-side a static renderingu,
- vestavěný routing a layout systém,
- API routy pro budoucí backend,
- přirozená integrace s Vercel.

### React
- osvědčená UI knihovna,
- komponentový přístup,
- široký ekosystém,
- dlouhodobá udržitelnost.

### TypeScript
- typová bezpečnost,
- lepší čitelnost kódu,
- jednodušší refaktoring,
- menší riziko chyb při růstu projektu.

### Tailwind CSS
- rychlé vytváření layoutů,
- mobile-first přístup,
- konzistentní styling bez složité CSS architektury,
- dobrá škálovatelnost UI.

### JSON jako zdroj dat (MVP)
- nejrychlejší způsob, jak vytvořit funkční aplikaci,
- jednoduchá editace a verzování,
- možnost snadného přechodu na databázi díky oddělené datové vrstvě.

### Vercel
- nativní podpora Next.js,
- jednoduchý a rychlý deployment,
- minimální provozní režie.

---

## Zvažované alternativy

- Čistý React + Vite  
  (méně vhodné pro SSR a budoucí backendové funkce)

- Jiný CSS framework  
  (vyšší režie bez zásadního přínosu)

- Databáze již od MVP  
  (zbytečná komplexita v rané fázi projektu)

---

## Důsledky rozhodnutí

### Pozitivní
- rychlý start projektu,
- jasná architektura,
- snadná rozšiřitelnost,
- vhodné prostředí pro iterativní vývoj.

### Negativní / omezení
- JSON jako zdroj dat není vhodný pro složitější správu obsahu,
- některé pokročilé funkce budou vyžadovat pozdější rozšíření stacku
  (auth, databáze, admin).

Tato omezení jsou považována za akceptovatelná v rámci MVP.

---

## Poznámka

Toto rozhodnutí se týká výchozí fáze projektu.
V případě zásadních změn (např. přechod na databázi, změna auth řešení)
bude vytvořen nový ADR dokument.
