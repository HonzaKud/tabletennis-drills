# Authentication & Authorization – Architecture (Auth v1)

Tento dokument popisuje návrh a rozsah autentizační vrstvy aplikace **TableTennis Drills**.

Cílem je vytvořit **bezpečný, produkčně realistický a dlouhodobě rozšiřitelný autentizační základ**, který:
- je plně integrován do stávající aplikace,
- běží v prostředí Next.js App Router na platformě Vercel,
- odpovídá moderním best practices,
- slouží jako kvalitní technická reference (portfolio).

Auth je navržen jako **core součást aplikace**, nikoliv jako samostatný projekt nebo externí služba.

---

## 1. Scope a filozofie Auth v1

Auth v1 se zaměřuje výhradně na **robustní přihlášení a správu uživatelské session**.

### Auth v1 řeší:
- přihlášení (login)
- odhlášení (logout)
- server-side session
- ochranu chráněných částí aplikace
- jednotnou validaci vstupních dat (frontend + backend)
- základní bezpečnostní opatření (hash hesla, rate limiting, cookies)

### Auth v1 záměrně neřeší:
- veřejnou registraci
- reset zapomenutého hesla (self-service)
- invite onboarding
- role (admin / user)
- platby a subscription logiku
- OAuth (Google, GitHub apod.)
- remember me funkcionalitu

Tyto funkce jsou považovány za **budoucí rozšíření** a nejsou součástí jádra Auth v1.

---

## 2. Architektonický kontext

- Aplikace je jeden **Next.js projekt**.
- Auth je implementován přímo v tomto projektu.
- Runtime prostředí je **serverless (Vercel)**.
- Autentizace je **server-side**, nikoliv pouze frontendová.

Auth **není** řešen jako:
- samostatná aplikace,
- externí identity provider,
- SSO systém.

---

## 3. Autentizační model: Session-based authentication

Aplikace používá **session-based authentication** založenou na httpOnly cookies.

### Základní princip
- Po úspěšném přihlášení server vytvoří session.
- Klient obdrží pouze **session ID uložené v cookie**.
- Identita uživatele je vždy ověřována na serveru.

### Důvody volby
- vyšší bezpečnost (ochrana proti XSS)
- možnost invalidace session
- realističtější produkční přístup
- lepší kontrola nad životním cyklem přihlášení

JWT uložené v `localStorage` se **záměrně nepoužívá**.

---

## 4. Session lifecycle a TTL

### Délka session
- Session má platnost **48 hodin (2 dny)**.
- Po vypršení session je uživatel automaticky odhlášen.
- Heslo uživatele se **nikdy nemaže** – expiruje pouze session.

### Konfigurace
- TTL session je definováno centrálně v konfiguraci auth vrstvy.
- Stejná hodnota je použita:
  - pro expiraci session záznamu,
  - pro expiraci session cookie.

## 4.1 Session storage (Auth v1)

V Auth v1 jsou session ukládány v **in-memory storage** na straně serveru.

### Důvody tohoto rozhodnutí
- jednoduchost a rychlost implementace v MVP fázi
- žádná závislost na databázi v Auth v1
- plná kontrola nad session lifecycle

Toto rozhodnutí je **vědomé a záměrné**.

### Dopady
- session jsou platné pouze po dobu běhu serverového runtime
- při restartu instance dojde k jejich zneplatnění

Tento přístup je akceptovatelný pro demonstrační a MVP účely.

### Budoucí rozšíření
V Auth v1.1 / v2 se počítá s přesunem session storage do databáze
(např. MongoDB), bez změny veřejného API ani auth flow.


---

## 5. Cookies – bezpečnostní nastavení

Session cookie je nastavena s následujícími parametry:

- `httpOnly: true`  
  Cookie není dostupná z JavaScriptu (ochrana proti XSS).

- `secure: true` (v produkci)  
  Cookie se přenáší pouze přes HTTPS.

- `sameSite: "lax"`  
  Základní ochrana proti CSRF.

- `path: "/"`  
  Cookie je dostupná pro celou aplikaci.

---

## 6. API Endpoints (Auth v1)

### POST `/api/auth/login`
Přihlášení uživatele.

**Input:**
- email
- password

**Chování:**
- validace vstupu pomocí Zod
- ověření hashovaného hesla
- vytvoření session
- nastavení session cookie

**Error stavy:**
- neplatné přihlašovací údaje (bez rozlišení, zda existuje email)
- překročený rate limit

---

### POST `/api/auth/logout`
Odhlášení uživatele.

**Chování:**
- zneplatnění session
- smazání session cookie

---

### GET `/api/auth/me`
Kontrola aktuální autentizace.

**Výstup:**
- `authenticated: true | false`
- základní identita uživatele (např. id, email)

Používá se:
- po refreshi stránky
- pro inicializaci UI stavu
- pro klientské ověření přihlášení

---

## 7. Redirect po přihlášení

Po úspěšném loginu je uživatel přesměrován na:
- **úvodní chráněnou stránku aplikace (`/`)**

Nejedná se o stránku s drilly, ale o první vstupní stránku aplikace.

---

## 8. Protected routes

### Server-side ochrana (zdroj pravdy)
- Chráněné části aplikace jsou umístěny v `(protected)` route group.
- Server při renderování ověřuje existenci platné session.
- Neautorizovaný uživatel je přesměrován na `/login`.

### Client-side reakce
- UI reaguje na stav `/api/auth/me`.
- Client-side ochrana slouží pouze pro UX, nikoliv jako bezpečnostní bariéra.

---

## 9. Validace vstupních dat (Zod)

Aplikace používá **Zod** jako jednotný validační nástroj.

- Stejná validační schémata jsou sdílena mezi frontendem a backendem.
- Validace probíhá:
  - na klientovi (UX, okamžitá zpětná vazba),
  - na serveru (bezpečnost).

Zod schémata představují **single source of truth** pro tvar dat.

---

## 10. Hesla a jejich zabezpečení

Hesla jsou chráněna pomocí **hashování**, nikoliv šifrování.

- Hesla se **nikdy neukládají v otevřené podobě**.
- Používá se algoritmus **Argon2id**, který je považován za moderní standard
  pro bezpečné ukládání hesel.

### Důvody volby Argon2id
- paměťová náročnost (odolnost vůči GPU útokům)
- navržený přímo pro hashování hesel
- doporučovaný bezpečnostní komunitou

### Flow
- při vytvoření nebo změně hesla se ukládá hash
- při loginu se porovnává hash zadaného hesla s uloženým hashem

---

## 11. Rate limiting (login)

Login endpoint je chráněn proti brute-force útokům.

- omezení počtu pokusů na IP / email
- časové okno (základní implementace)

Cílem není enterprise-level ochrana, ale demonstrace bezpečnostního přemýšlení.

---

## 12. Audit log (základní)

Auth v1 počítá se základním audit logem:

- neúspěšné pokusy o přihlášení
- zaznamenání času a základního kontextu (email, IP)

Audit log slouží jako:
- bezpečnostní stopa,
- základ pro budoucí rozšíření.

---

## 13. Zapomenuté heslo – scope rozhodnutí

### Stav v Auth v1
- Auth v1 **neobsahuje self-service reset zapomenutého hesla**.
- Aplikace je v této fázi chápána jako **uzavřený systém**.
- Reset hesla je řešen **administrativně (support flow)**.

Toto rozhodnutí je záměrné a odpovídá MVP fázi projektu.

---

## 14. Future: Invite onboarding & reset hesla (Auth v1.1)

V Auth v1.1 bude přidán:
- **invite-only onboarding**
- **token-based reset zapomenutého hesla**

### Společný technický základ
Invite onboarding i reset hesla sdílí stejný mechanismus:
- jednorázový token
- expirace
- nastavení nového hesla

### Invite / reset flow (budoucí)
1. Systém vygeneruje token s expirací.
2. Uživatel obdrží email s odkazem.
3. Po otevření odkazu si nastaví nové heslo.
4. Token je zneplatněn.

Tato funkcionalita bude implementována jako **samostatná nadstavba** bez zásahu do core auth vrstvy.

---

## 15. Shrnutí

Auth v1 poskytuje:
- bezpečné přihlášení a odhlášení,
- serverovou session s TTL 48 hodin,
- chráněné části aplikace,
- jednotnou validaci dat,
- jasně definovaný scope a odpovědnosti.

Cílem Auth v1 není maximální počet funkcí, ale **čistý, profesionální a dlouhodobě udržitelný autentizační základ**, připravený na budoucí rozšíření.
