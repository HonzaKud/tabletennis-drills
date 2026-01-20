# Authentication & Authorization – Architecture (Auth v1)

Tento dokument popisuje návrh, rozsah a architekturu autentizační vrstvy
aplikace **TableTennis Drills**.

Cílem Auth v1 je vytvořit **bezpečný, produkčně realistický a dlouhodobě
rozšiřitelný základ**, který:

- je plně integrován do stávající aplikace,
- běží v prostředí Next.js App Router na platformě Vercel,
- respektuje moderní best practices,
- slouží jako kvalitní technická reference (portfolio).

Autentizace je navržena jako **core součást aplikace**, nikoliv jako externí
služba nebo samostatný projekt.

---

## 1. Scope a filozofie Auth v1

Auth v1 se zaměřuje výhradně na **robustní přihlášení a správu uživatelské session**.

### Auth v1 řeší
- přihlášení (login)
- odhlášení (logout)
- server-side session
- ochranu chráněných částí aplikace
- jednotnou validaci vstupních dat (frontend + backend)
- základní bezpečnostní opatření (hashování hesel, rate limiting, cookies)

### Auth v1 záměrně neřeší
- veřejnou registraci
- reset zapomenutého hesla (self-service)
- invite onboarding
- role (admin / editor)
- OAuth (Google, GitHub apod.)
- „remember me“ funkcionalitu
- platební nebo subscription logiku

Tyto oblasti jsou považovány za **budoucí rozšíření** a nejsou součástí jádra Auth v1.

---

## 2. Architektonický kontext

- Aplikace je jeden **Next.js projekt** (App Router).
- Auth je implementován přímo v tomto projektu.
- Runtime prostředí je **serverless (Vercel)**.
- Autentizace je řešena **server-side**.

Auth **není** řešen jako:
- samostatná aplikace,
- externí identity provider,
- SSO systém.

---

## 3. Autentizační model

Aplikace používá **session-based authentication** založenou na httpOnly cookies.

### Základní princip
- Po úspěšném přihlášení server vytvoří session.
- Klient obdrží pouze **session ID uložené v cookie**.
- Identita uživatele je vždy ověřována na serveru.

### Důvody volby
- vyšší bezpečnost (ochrana proti XSS)
- možnost invalidace session
- realističtější produkční přístup
- plná kontrola nad životním cyklem přihlášení

JWT uložené v `localStorage` se **záměrně nepoužívá**.

---

## 4. Session lifecycle a TTL

### Délka session
- Session má platnost **48 hodin (2 dny)**.
- Po vypršení TTL je uživatel automaticky odhlášen.
- Heslo uživatele se nikdy nemaže – expiruje pouze session.

### Konfigurace
TTL session je definováno centrálně v auth konfiguraci a je použito:
- pro expiraci session záznamu,
- pro expiraci session cookie.

---

## 5. Session storage (Auth v1)

V Auth v1 jsou session ukládány v **in-memory storage** na straně serveru.

### Důvody tohoto rozhodnutí
- jednoduchost a rychlost implementace v MVP
- žádná závislost na databázi
- jasná a čitelná architektura

### Dopady
- session jsou platné pouze po dobu běhu serverového runtime
- při restartu instance dojde k jejich zneplatnění

Tento přístup je **vědomý a akceptovatelný** pro MVP a demonstrační účely.

### Budoucí rozšíření
V Auth v1.1 / v2 se počítá s přesunem session storage do databáze
(např. MongoDB) bez změny veřejného API ani auth flow.

---

## 6. Cookies – bezpečnostní nastavení

Session cookie je nastavena s následujícími parametry:

- `httpOnly: true` – ochrana proti XSS
- `secure: true` (v produkci) – pouze HTTPS
- `sameSite: "lax"` – základní ochrana proti CSRF
- `path: "/"` – dostupná pro celou aplikaci

---

## 7. API endpoints (Auth v1)

### POST `/api/auth/login`
Přihlášení uživatele.

**Chování**
- validace vstupu pomocí Zod
- ověření hashovaného hesla
- vytvoření session
- nastavení session cookie

**Chybové stavy**
- neplatné přihlašovací údaje (bez rozlišení existence emailu)
- překročený rate limit

---

### POST `/api/auth/logout`
Odhlášení uživatele.

**Chování**
- zneplatnění session
- smazání session cookie

---

### GET `/api/auth/me`
Kontrola aktuální autentizace.

**Výstup**
- `authenticated: true | false`
- základní identita uživatele (id, email)

Používá se:
- po refreshi stránky
- pro inicializaci UI stavu
- pro klientskou kontrolu přihlášení

---

## 8. Protected routes

### Server-side ochrana (zdroj pravdy)
- chráněné části aplikace jsou umístěny v `(protected)` route group
- server při renderování ověřuje platnou session
- neautorizovaný uživatel je přesměrován na `/login`

### Client-side reakce
- UI reaguje na výsledek `/api/auth/me`
- client-side kontrola slouží pouze pro UX, nikoliv jako bezpečnostní bariéra

---

## 9. Validace vstupních dat

Aplikace používá **Zod** jako jednotný validační nástroj.

- stejná validační schémata jsou sdílena mezi frontendem a backendem
- validace probíhá:
  - na klientovi (UX),
  - na serveru (bezpečnost)

Zod schémata představují **single source of truth** pro tvar dat.

---

## 10. Hesla a jejich zabezpečení

Hesla jsou chráněna pomocí **hashování**, nikoliv šifrování.

- hesla se nikdy neukládají v otevřené podobě
- používá se algoritmus **Argon2id**

### Důvody volby Argon2id
- paměťová náročnost (odolnost vůči GPU útokům)
- navržen přímo pro hashování hesel
- doporučovaný bezpečnostní komunitou

---

## 11. Rate limiting (login)

Login endpoint je chráněn proti brute-force útokům.

- omezení počtu pokusů:
  - na kombinaci IP + email
  - globálně na IP
- pevné časové okno

Cílem není enterprise-level ochrana, ale **prokazatelný bezpečnostní přístup**.

---

## 12. Audit log (základní)

Auth v1 obsahuje základní audit log autentizačních událostí:

- úspěšné přihlášení
- neúspěšné pokusy
- rate limit události
- interní chyby

Audit log slouží jako:
- bezpečnostní stopa
- základ pro budoucí monitoring a alerting

---

## 13. Rozhodnutí: zapomenuté heslo

Auth v1 **neobsahuje self-service reset zapomenutého hesla**.

Aplikace je v této fázi chápána jako **uzavřený systém**.
Reset hesla je řešen administrativně (support flow).

Toto rozhodnutí je záměrné a odpovídá MVP fázi projektu.

---

## 14. Budoucí rozšíření (Auth v1.1+)

Plánované rozšíření:
- invite-only onboarding
- token-based reset zapomenutého hesla

### Společný technický základ
- jednorázový token
- expirace
- nastavení nového hesla

Tato funkcionalita bude implementována jako **nadstavba** bez zásahu do core auth vrstvy.

---

## 15. Shrnutí

Auth v1 poskytuje:
- bezpečné přihlášení a odhlášení,
- serverovou session s TTL 48 hodin,
- chráněné části aplikace,
- jednotnou validaci dat,
- jasně definovaný scope a odpovědnosti.

Cílem Auth v1 není maximální počet funkcí, ale **čistý, profesionální a dlouhodobě
udržitelný autentizační základ**, připravený na budoucí rozšíření.
