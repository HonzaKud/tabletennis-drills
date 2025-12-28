Datový model – TableTennis Drills

Tento dokument popisuje datový model aplikace TableTennis Drills.
Slouží jako stabilní kontrakt mezi:

daty (JSON / databáze),

aplikační logikou,

UI vrstvou.

V dokumentaci jsou pojmy „cvičení“ a „drill“ používány jako synonyma.

Zdroj dat (JSON, databáze, API) je považován za vyměnitelný detail.
Struktura dat a význam jednotlivých polí jsou považovány za stabilní.

1) Základní principy

Každé cvičení je samostatná entita.

Každé cvičení má unikátní identifikátor (ID / slug).

Data používají stabilní interní klíče (bez diakritiky).

Uživatelsky čitelné texty (CZ popisky) se řeší v UI vrstvě.

Datový model je navržen tak, aby:

fungoval v MVP (JSON soubory),

byl připravený na databázi,

byl rozšiřitelný bez porušení zpětné kompatibility.

2) Entita: Cvičení (Drill)

Jedno cvičení reprezentuje jeden konkrétní tréninkový drill nebo kombinaci.

Pole entity:

id

title

description

category

ageGroup

durationMinutes

equipment

tags

3) Detailní popis polí
id

typ: string

povinné: ano

popis:
Unikátní identifikátor cvičení.
Slouží pro routing, odkazy a interní identifikaci.

příklad:
fh-bh-basic-combo

title

typ: string

povinné: ano

popis:
Krátký název cvičení, zobrazovaný v seznamu i detailu.

příklad:
Základní kombinace FH–BH

description

typ: string

povinné: ano

popis:
Textový popis cvičení.
Vysvětluje průběh, cíl a základní provedení.

poznámka:
V MVP se jedná o čistý text bez formátování.

category

typ: string (stabilní klíč)

povinné: ano

popis:
Typ cvičení.
Používá se pro filtrování a kategorizaci.

povolené hodnoty (MVP):
serve
serve_combo
no_serve_combo
regular_combo
irregular_combo
mixed_regular_irregular
warmup
stretching
multiball

Poznámka:
UI zobrazuje české popisky podle mapování v konfiguračních konstantách.

ageGroup

typ: string (stabilní klíč)

povinné: ano

popis:
Doporučená věková kategorie.

povolené hodnoty:
U9
U11
U13
U15
U17
ADULT

durationMinutes

typ: number

povinné: ano

popis:
Doporučená délka cvičení v minutách.

příklad:
10

equipment

typ: array of string (stabilní klíče)

povinné: ano (pole vždy existuje, může být prázdné)

popis:
Seznam pomůcek potřebných ke cvičení.
Prázdné pole znamená, že nejsou potřeba žádné specifické pomůcky
nad rámec základního vybavení (stůl, míčky, pálka).

povolené hodnoty (MVP):
cones
barriers
ladder
jump_rope
robot
multiball_basket
stopwatch

tags

typ: array of string

povinné: ano (pole vždy existuje, může být prázdné)

popis:
Volitelné tagy popisující cvičení.
Slouží pro budoucí rozšíření (vyhledávání, doporučení, pokročilé filtry).

poznámka:
V MVP se jedná o volné texty (bez stabilních klíčů).

příklady:
forehand
backhand
topspin
footwork
consistency

4) Příklad cvičení (JSON – MVP)

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

5) Rozšiřitelnost modelu

Datový model je navržen tak, aby bylo možné bez porušení existujících dat přidat:

média (images, videos, youtubeId)

obtížnost (difficulty)

cíle cvičení (goals)

varianty cvičení

jazykové mutace

Nová pole musí být:

volitelná,

zpětně kompatibilní,

zdokumentovaná v tomto souboru.

6) Shrnutí

Tento datový model:

definuje stabilní kontrakt aplikace,

odpovídá aktuálnímu stavu MVP,

odděluje data od UI,

umožňuje plynulý přechod z JSON na databázi,

slouží jako hlavní reference pro další vývoj.