# Datový model – TableTennis Drills

Tento dokument popisuje datový model aplikace TableTennis Drills. Slouží jako stabilní kontrakt mezi daty (JSON / databáze / API), aplikační logikou a UI vrstvou. V dokumentaci jsou pojmy „cvičení“ a „drill“ používány jako synonyma.

Zdroj dat (JSON, databáze, API) je považován za vyměnitelný detail. Struktura dat a význam jednotlivých polí jsou považovány za stabilní.

## 1) Základní principy

Každé cvičení je samostatná entita. Každé cvičení má unikátní identifikátor (ID / slug). Data používají stabilní interní klíče (bez diakritiky). Uživatelsky čitelné texty (české popisky) se řeší v UI vrstvě.

Datový model je navržen tak, aby fungoval v MVP (JSON soubory), byl připravený na databázi a byl rozšiřitelný bez porušení zpětné kompatibility.

## 2) Entita: Cvičení (Drill)

Jedno cvičení reprezentuje jeden konkrétní tréninkový drill nebo kombinaci.

Povinná pole entity:
id, title, description, category, ageGroup, durationMinutes, equipment, tags

Volitelná pole (MVP-ready):
image

## 3) Detailní popis polí

id  
typ: string  
povinné: ano  

Unikátní identifikátor cvičení. Slouží pro routing, odkazy a interní identifikaci.  
Příklad: fh-bh-basic-combo

title  
typ: string  
povinné: ano  

Krátký název cvičení, zobrazovaný v seznamu i detailu.  
Příklad: Základní kombinace FH–BH

description  
typ: string  
povinné: ano  

Textový popis cvičení. Vysvětluje průběh, cíl a základní provedení.  
Poznámka: V MVP se jedná o čistý text bez formátování.

category  
typ: string (stabilní klíč)  
povinné: ano  

Typ cvičení. Používá se pro filtrování a kategorizaci.  
Povolené hodnoty (MVP):  
serve, serve_combo, no_serve_combo, regular_combo, irregular_combo, mixed_regular_irregular, warmup, stretching, multiball  

Poznámka: UI zobrazuje české popisky podle mapování v konfiguračních konstantách.

ageGroup  
typ: string (stabilní klíč)  
povinné: ano  

Doporučená věková kategorie pro cvičení.  
Povolené hodnoty: U9, U11, U13, U15, U17, ADULT, ALL  

Poznámka: Hodnota ALL označuje cvičení vhodná pro všechny věkové kategorie (např. rozcvička, strečink). Ve filtrech je ALL vždy zahrnuto.

durationMinutes  
typ: number  
povinné: ano  

Doporučená délka cvičení v minutách.  
Příklad: 10

equipment  
typ: array of string (stabilní klíče)  
povinné: ano (pole vždy existuje, může být prázdné)  

Seznam pomůcek potřebných ke cvičení. Prázdné pole znamená, že nejsou potřeba žádné specifické pomůcky nad rámec základního vybavení (stůl, míčky, pálka).  
Povolené hodnoty (MVP): cones, barriers, ladder, jump_rope, robot, multiball_basket, stopwatch

tags  
typ: array of string  
povinné: ano (pole vždy existuje, může být prázdné)  

Volitelné tagy popisující cvičení. Slouží pro budoucí rozšíření (vyhledávání, doporučení, pokročilé filtrování).  
Poznámka: V MVP se jedná o volné texty (bez stabilních klíčů).  
Příklady: forehand, backhand, topspin, footwork, consistency

image  
typ: string  
povinné: ne  

Cesta nebo URL k obrázku cvičení. Pole je již podporováno v kódu a UI, ale jeho využití je zatím volitelné.  
Příklad: /images/drills/fh-bh-basic-combo.png

## 4) Příklad cvičení (JSON – MVP)

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

## 5) Rozšiřitelnost modelu

Datový model je navržen tak, aby bylo možné bez porušení existujících dat přidat například média (images, videos, youtubeId), obtížnost (difficulty), cíle cvičení (goals), varianty cvičení nebo jazykové mutace.

Nová pole musí být volitelná, zpětně kompatibilní a zdokumentovaná v tomto souboru.

## 6) Shrnutí

Tento datový model definuje stabilní kontrakt aplikace, odpovídá aktuálnímu stavu MVP, odděluje data od UI, umožňuje plynulý přechod z JSON na databázi a slouží jako hlavní reference pro další vývoj.
