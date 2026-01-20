# ADR 0001 – Volba technologického stacku

Datum: 2025-12-23  
Stav: Přijato

---

## Kontext

Projekt **TableTennis Drills** je webová aplikace zaměřená na práci s tréninkovými
cvičeními pro stolní tenis.

Projekt je vyvíjen iterativně, bez pevně dané dlouhodobé roadmapy,
s důrazem na:

- rychlý vývoj funkčního MVP,
- čitelnost a dlouhodobou udržitelnost kódu,
- možnost postupného rozšiřování bez zásadních refaktorů,
- veřejně dostupnou aplikaci s jednoduchým nasazením.

Technologický stack musí splňovat následující požadavky:

- podporovat moderní frontendový vývoj,
- umožnit server-side rendering (SSR) i static rendering,
- být vhodný pro práci s daty (JSON → databáze / API),
- minimalizovat provozní a konfigurační režii,
- umožnit budoucí rozšíření o autentizaci a backendové funkce.

---

## Rozhodnutí

Byl zvolen následující technologický stack:

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **JSON soubory jako zdroj dat pro MVP**
- **Hosting na platformě Vercel**

---

## Odůvodnění rozhodnutí

### Next.js (App Router)

- moderní framework nad Reactem,
- podpora server-side i static renderingu,
- vestavěný routing a layout systém,
- možnost API rout pro budoucí backendovou logiku,
- přirozená integrace s platformou Vercel.

Použití App Routeru odpovídá současným doporučeným postupům Next.js
a zajišťuje dlouhodobou udržitelnost projektu.

---

### React

- osvědčená UI knihovna,
- komponentový přístup,
- široký ekosystém a dlouhodobá podpora,
- přirozená volba v kombinaci s Next.js.

---

### TypeScript

- typová bezpečnost napříč aplikací,
- lepší čitelnost a srozumitelnost kódu,
- jednodušší refaktoring při růstu projektu,
- nižší riziko chyb při práci s datovým modelem.

---

### Tailwind CSS

- rychlé vytváření UI bez vlastní CSS architektury,
- mobile-first přístup,
- konzistentní styling napříč aplikací,
- dobrá škálovatelnost bez nárůstu technického dluhu.

---

### JSON jako zdroj dat (MVP)

- nejrychlejší způsob vytvoření funkční aplikace,
- jednoduchá editace a verzování v Git repozitáři,
- žádná provozní závislost na databázi v rané fázi,
- datová vrstva je oddělena tak, aby byl možný
  pozdější přechod na databázi nebo API bez změn UI.

---

### Vercel

- nativní podpora Next.js,
- jednoduchý a rychlý deployment,
- minimální provozní režie,
- vhodné prostředí pro MVP i veřejnou demonstraci projektu.

---

## Zvažované alternativy

- **Čistý React + Vite**  
  Nevhodné z hlediska SSR a budoucích backendových funkcí.

- **Jiný CSS framework**  
  Vyšší režie bez zásadního přínosu pro rozsah MVP.

- **Databáze již v MVP fázi**  
  Zbytečná komplexita a provozní náklady v rané fázi projektu.

---

## Důsledky rozhodnutí

### Pozitivní důsledky

- rychlý start vývoje,
- jasná a čitelná architektura,
- snadná rozšiřitelnost aplikace,
- vhodné prostředí pro iterativní vývoj,
- minimální provozní náklady v MVP fázi.

---

### Negativní důsledky / omezení

- JSON jako zdroj dat není vhodný pro složitější správu obsahu,
- některé pokročilé funkce budou vyžadovat pozdější rozšíření stacku
  (databáze, autentizace, admin rozhraní).

Tato omezení jsou považována za **akceptovatelná v rámci MVP**.

---

## Poznámka

Toto rozhodnutí se vztahuje k výchozí fázi projektu (MVP).

V případě zásadních architektonických změn
(např. přechod na databázi, změna autentizační strategie)
bude vytvořen nový ADR dokument.
