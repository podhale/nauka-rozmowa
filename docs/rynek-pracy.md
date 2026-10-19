# Rynek pracy .NET + Angular – analiza ofert (stan: październik 2026)

Cel: skalibrować bazę pytań (826 kart w `app/data/`) pod to, czego naprawdę wymagają pracodawcy w Polsce.

## Metodologia i zastrzeżenia

- **Próba: 37 unikalnych ofert** (fullstack .NET+Angular: 14, backend .NET: 16, frontend Angular: 7). Poziomy: **junior 6, mid 17, senior 14**.
- Źródła: pracuj.pl, justjoin.it, theprotocol.it i nofluffjobs (głównie przez agregatory hexjobs.com i czyjesteldorado.pl, bo bezpośrednie API justjoin.it było zablokowane). LinkedIn i bulldogjob nie dały się odczytać przez WebFetch.
- Okno czasowe: oferty opublikowane ok. **marzec–październik 2026**. Około 15 z nich było w październiku 2026 nadal aktywnych, reszta wygasła w ciągu ostatnich 1–7 miesięcy. Jedną ofertę sprzed 2 lat i jeden duplikat odrzuciłem.
- Poziom brałem z tytułu albo z wymaganego stażu. Bywa niespójny: zdarza się „junior” z 3–4 latami doświadczenia albo „mid” z 7+ latami.
- **Zawyżenie:** 3 oferty Prognetics (junior/mid/senior) mają ten sam szablon z bardzo długą listą „nice to have” (Aspire, gRPC, Polly, MassTransit, GraphQL, Blazor…). Część niskich wartości nice to have to w praktyce jeden pracodawca.
- Procenty liczone są od wszystkich 37 ofert. Oferty frontendowe (7) zaniżają udział technologii .NET: wśród 30 ofert backend/fullstack .NET i C# występują w ponad 90%.

Tło rynkowe (raport No Fluff Jobs „Rynek pracy IT 2025/2026”, styczeń 2026): ofert jest o 44% więcej r/r, ale **juniorzy to tylko ~5% ofert**, seniorzy ~60%, mid ~35%. B2B stanowi ~72% ofert mid/senior, praca hybrydowa wzrosła do ~35%, zdalna spada (~42%).

## 1. Tabela technologii – częstość w ofertach

„must” i „nice” to liczba ofert. Kolumny J/M/S podają % ofert danego poziomu, które wymieniają technologię (jako must albo nice).

| # | Technologia / wymaganie | Razem % ofert | must | nice | Junior % | Mid % | Senior % | Dominuje |
|---|---|---|---|---|---|---|---|---|
| 1 | .NET (Core/5+/6/8+) | **76%** (28) | 28 | 0 | 67% | 88% | 64% | must |
| 2 | C# | **70%** (26) | 26 | 0 | 83% | 76% | 57% | must |
| 3 | Angular | **65%** (24) | 20 | 4 | 50% | 65% | 71% | must |
| 4 | Git | **59%** (22) | 20 | 2 | 67% | 53% | 64% | must |
| 5 | TypeScript | **51%** (19) | 14 | 5 | 50% | 41% | 64% | must |
| 6 | MS SQL Server | **46%** (17) | 17 | 0 | 33% | 71% | 21% | must |
| 7 | Kubernetes | **46%** (17) | 8 | 9 | 17% | 59% | 43% | nice |
| 8 | Docker | **46%** (17) | 12 | 5 | 17% | 59% | 43% | must |
| 9 | ASP.NET (Core) / Web API | **46%** (17) | 17 | 0 | 50% | 47% | 43% | must |
| 10 | Testy jednostkowe .NET (xUnit/NUnit/MSTest) | **43%** (16) | 13 | 3 | 50% | 53% | 29% | must |
| 11 | Scrum/Agile | **38%** (14) | 13 | 1 | 33% | 41% | 36% | must |
| 12 | Angielski (B2+) | **38%** (14) | 14 | 0 | 67% | 29% | 36% | must |
| 13 | Code review | **38%** (14) | 14 | 0 | 17% | 29% | 57% | must |
| 14 | CI/CD (ogólnie) | **38%** (14) | 8 | 6 | 17% | 41% | 43% | must |
| 15 | REST API | **35%** (13) | 11 | 2 | 17% | 47% | 29% | must |
| 16 | Entity Framework (Core) | **35%** (13) | 10 | 3 | 33% | 35% | 36% | must |
| 17 | Azure | **35%** (13) | 4 | 9 | 33% | 41% | 29% | nice |
| 18 | RabbitMQ | **30%** (11) | 6 | 5 | 17% | 24% | 43% | must |
| 19 | HTML/CSS (SCSS) | **30%** (11) | 9 | 2 | 33% | 29% | 29% | must |
| 20 | Dokumentacja techniczna | **30%** (11) | 11 | 0 | 0% | 41% | 29% | must |
| 21 | SQL (ogólnie) | **30%** (11) | 11 | 0 | 33% | 29% | 29% | must |
| 22 | PostgreSQL | **27%** (10) | 7 | 3 | 17% | 35% | 21% | must |
| 23 | .NET Framework / legacy (MVC, WCF, WPF, WinForms) | **27%** (10) | 8 | 2 | 50% | 41% | 0% | must |
| 24 | SOLID / wzorce projektowe | **24%** (9) | 9 | 0 | 0% | 29% | 29% | must |
| 25 | AWS | **24%** (9) | 2 | 7 | 17% | 24% | 29% | nice |
| 26 | RxJS | **22%** (8) | 6 | 2 | 17% | 24% | 21% | must |
| 27 | NgRx / biblioteka stanu | **22%** (8) | 4 | 4 | 17% | 18% | 29% | must |
| 28 | JavaScript | **22%** (8) | 5 | 3 | 33% | 18% | 21% | must |
| 29 | T-SQL | **19%** (7) | 7 | 0 | 33% | 18% | 14% | must |
| 30 | Observability (OpenTelemetry/Serilog/Grafana/Splunk) | **19%** (7) | 1 | 6 | 17% | 12% | 29% | nice |
| 31 | LINQ | **19%** (7) | 6 | 1 | 50% | 6% | 21% | must |
| 32 | Testy E2E (Cypress/Playwright/Cucumber) | **19%** (7) | 3 | 4 | 0% | 24% | 21% | nice |
| 33 | Redis | **16%** (6) | 0 | 6 | 17% | 18% | 14% | nice |
| 34 | Polski C1+ (wymóg wprost) | **16%** (6) | 6 | 0 | 0% | 24% | 14% | must |
| 35 | Mikroserwisy | **16%** (6) | 4 | 2 | 0% | 29% | 7% | must |
| 36 | MassTransit/NServiceBus/Wolverine | **16%** (6) | 0 | 6 | 17% | 6% | 29% | nice |
| 37 | Kafka | **16%** (6) | 3 | 3 | 17% | 12% | 21% | must |
| 38 | CQRS / MediatR | **16%** (6) | 3 | 3 | 17% | 12% | 21% | must |
| 39 | React (jako alternatywa/dodatek) | **14%** (5) | 0 | 5 | 0% | 18% | 14% | nice |
| 40 | NoSQL (MongoDB/DynamoDB/Cosmos) | **14%** (5) | 1 | 4 | 33% | 12% | 7% | nice |
| 41 | Mentoring | **14%** (5) | 5 | 0 | 0% | 6% | 29% | must |
| 42 | Jenkins/TeamCity | **14%** (5) | 4 | 1 | 0% | 24% | 7% | must |
| 43 | GraphQL | **14%** (5) | 1 | 4 | 17% | 6% | 21% | nice |
| 44 | Testy frontu (Jest/Jasmine/Karma) | **14%** (5) | 4 | 1 | 17% | 6% | 21% | must |
| 45 | DDD | **14%** (5) | 5 | 0 | 0% | 6% | 29% | must |
| 46 | Dapper | **14%** (5) | 1 | 4 | 17% | 18% | 7% | nice |
| 47 | OpenAPI/Swagger/Postman | **11%** (4) | 4 | 0 | 17% | 6% | 14% | must |
| 48 | Moq/NSubstitute/FluentAssertions | **11%** (4) | 4 | 0 | 17% | 6% | 14% | must |
| 49 | Jira | **11%** (4) | 4 | 0 | 0% | 24% | 0% | must |
| 50 | GitHub Actions | **11%** (4) | 0 | 4 | 17% | 6% | 14% | nice |
| 51 | Blazor (+WPF/WCF) | **11%** (4) | 1 | 3 | 17% | 12% | 7% | nice |
| 52 | Azure DevOps | **11%** (4) | 2 | 2 | 0% | 18% | 7% | must |
| 53 | Azure Service Bus | **11%** (4) | 1 | 3 | 17% | 6% | 14% | nice |
| 54 | Narzędzia AI (Copilot/Claude) | **11%** (4) | 1 | 3 | 0% | 12% | 14% | nice |
| 55 | SOAP / WS-Security | **8%** (3) | 3 | 0 | 17% | 12% | 0% | must |
| 56 | Polly | **8%** (3) | 0 | 3 | 17% | 6% | 7% | nice |
| 57 | Optymalizacja wydajności | **8%** (3) | 3 | 0 | 0% | 6% | 14% | must |
| 58 | Oracle PL/SQL | **8%** (3) | 1 | 2 | 0% | 12% | 7% | nice |
| 59 | OpenShift | **8%** (3) | 2 | 1 | 0% | 6% | 14% | must |
| 60 | Node.js/Express | **8%** (3) | 1 | 2 | 0% | 0% | 21% | nice |
| 61 | Minimal APIs | **8%** (3) | 3 | 0 | 17% | 6% | 7% | must |
| 62 | JWT | **8%** (3) | 3 | 0 | 17% | 6% | 7% | must |
| 63 | IaC (Terraform/Helm/Ansible) | **8%** (3) | 0 | 3 | 0% | 12% | 7% | nice |
| 64 | gRPC | **8%** (3) | 0 | 3 | 17% | 6% | 7% | nice |
| 65 | Elasticsearch | **8%** (3) | 0 | 3 | 0% | 18% | 0% | nice |
| 66 | Dependency Injection (wprost) | **8%** (3) | 3 | 0 | 17% | 12% | 0% | must |
| 67 | .NET Aspire | **8%** (3) | 0 | 3 | 17% | 6% | 7% | nice |
| 68 | Bezpieczeństwo / SSDLC / auth | **8%** (3) | 3 | 0 | 0% | 12% | 7% | must |
| 69 | TDD | **5%** (2) | 2 | 0 | 0% | 6% | 7% | must |
| 70 | Angular Signals (wprost) | **5%** (2) | 2 | 0 | 0% | 6% | 7% | must |
| 71 | Nx / monorepo | **5%** (2) | 2 | 0 | 0% | 0% | 14% | must |
| 72 | Event-driven | **5%** (2) | 2 | 0 | 0% | 0% | 14% | must |
| 73 | Design system | **5%** (2) | 2 | 0 | 0% | 0% | 14% | must |
| 74 | async/await, TPL | **5%** (2) | 2 | 0 | 0% | 12% | 0% | must |
| 75 | Angular Material | **5%** (2) | 0 | 2 | 0% | 12% | 0% | nice |
| 76 | Linux/Bash/PowerShell | **5%** (2) | 1 | 1 | 0% | 12% | 0% | must |
| 77 | Mikrofrontendy / Module Federation | **3%** (1) | 1 | 0 | 0% | 0% | 7% | must |
| 78 | Testcontainers / Pact (contract) | **3%** (1) | 1 | 0 | 0% | 0% | 7% | must |

### Najważniejsze obserwacje z tabeli
- **Rdzeń (≥45%)**: C#/.NET, ASP.NET Core Web API, Angular + TypeScript, MS SQL Server, Git, Docker i Kubernetes. Kubernetes równie często bywa must, co nice.
- **Druga linia (25–40%)**: testy jednostkowe, REST, EF Core, Azure (głównie nice), RabbitMQ, CI/CD, Scrum, code review, angielski, dokumentacja techniczna, PostgreSQL oraz **legacy .NET Framework (27%, a u juniorów 50%)**.
- **Wersje**: oferty piszą „.NET 6/8”, „.NET 8+”, „.NET Core”, „Angular 2+/6+/16+/19+”. **Nikt nie wymaga wprost .NET 10 ani Angular 20/21.** Sygnały wymieniają wprost tylko 2 oferty, obie frontendowe. W bazie jest odwrotnie: ~57 kart o sygnałach i 0 kart o klasycznym NgRx Store.
- **Messaging**: RabbitMQ (30%) jest wyraźnie popularniejszy niż Kafka (16%) i Azure Service Bus (11%). MassTransit pojawia się jako nice to have u seniorów.
- **Chmura**: Azure 35%, AWS 24%, GCP 5%. U mid i seniorów zwykle nice to have, ale niektóre oferty mają Azure jako must (App Service, Functions).
- **AI**: 4 oferty (11%) wymieniają GitHub Copilot lub Claude, jedna (C&F) jako must („hands-on AI-assisted development”). Rośnie, ale baza z 47 kartami już to pokrywa z nadmiarem.
- **Nieobecne w ofertach**: SignalR (0), zoneless, SSR, @defer, Signal Forms, .NET Aspire tylko jako nice (3). To tematy na rozmowy u seniorów i w firmach produktowych, nie warunek wejścia.

## 2. Wnioski per poziom

### Junior (6 ofert; ~5% całego rynku)
- Must have: **C#, OOP, .NET (często też .NET Framework 4.x lub MVC), SQL / MS SQL, Git, testy jednostkowe, angielski B2**, podstawy frontu (HTML/CSS/TS albo „dowolny framework”). W ofertach Angular-junior: Angular + TS + HTML/CSS + REST + Git, a RxJS i NgRx tylko jako nice.
- Wymagany staż to zwykle 0,5–1 roku albo projekty na GitHubie. Liczy się „chęć nauki”.
- Docker, K8s i chmura rzadko pojawiają się jako must, najwyżej jako nice (Azure).
- Na rozmowach wracają **klasyczne pytania OOP i C#**: klasa abstrakcyjna vs interfejs, overloading vs overriding, polimorfizm, delegaty, generyki, GC „pod spodem”, IEnumerable vs IQueryable, synchronizacja wątków, uwierzytelnianie tokenem, filtry MVC. Do tego proste live codingi (zliczanie powtórzeń znaków w stringu) i SQL (self-join).

### Mid / Regular (17 ofert)
- Must have: **C#/.NET Core, ASP.NET Core Web API, REST, EF Core (+ czasem Dapper), MS SQL (71% ofert mid!) / PostgreSQL, Angular + TS + RxJS (fullstack), SOLID i wzorce, DI, testy jednostkowe, Git, CI/CD (Jenkins/TeamCity/Azure DevOps), Docker/K8s (59%)**.
- Typowe nice to have: Azure lub AWS, Redis, RabbitMQ, Elasticsearch, mikroserwisy, NgRx, testy E2E, React jako drugi framework.
- Środowisko jest bardzo często **enterprise/bankowe/publiczne**: .NET Framework obok .NET Core, SOAP/WCF, IIS, Oracle, Jira i dokumentacja techniczna (41%).

### Senior (14 ofert)
- Must have dochodzą: **architektura (DDD, CQRS, event-driven, mikroserwisy, systemy rozproszone), messaging (RabbitMQ 43%, Kafka), code review (57%), mentoring (29%), wydajność, bezpieczeństwo (authN/authZ, identity)**, decyzje techniczne (ADR) i własność projektu.
- Nice to have u seniorów to głównie: MassTransit/NServiceBus/Wolverine, OpenTelemetry/Grafana, Kubernetes/Helm/OpenShift, chmura, GraphQL, AI coding assistants.
- Senior frontend Angular: **NgRx, RxJS, Nx/monorepo, Module Federation/mikrofrontendy, design system, testy (Jest/Cypress), wydajność, TDD, mentoring**. Signals wymienia tylko „Frontend Architect”.
- Senior w ofertach fullstack to często „8+ lat Angulara, 3+ lata .NET” albo odwrotnie. Firmy wybierają jedną stronę jako dominującą.

## 3. Typowe obowiązki (co się robi w pracy)
1. Rozwój i utrzymanie usług backendowych w C#/.NET (REST API, integracje REST/SOAP/kolejki).
2. Rozwój frontendu w Angularze (komponenty UI z makiet, Angular Material/design system, SPA).
3. Praca z bazą: modelowanie, optymalizacja zapytań SQL, EF Core i Dapper, duże wolumeny danych.
4. Testy jednostkowe i integracyjne, rzadziej E2E. Udział w SIT/UAT.
5. Code review, pair programming, standardy kodu (clean code, SOLID).
6. Udział w CI/CD (z DevOps), konteneryzacja i deploy na K8s/OpenShift/Azure.
7. Dokumentacja techniczna (czasem UML), analiza wymagań z analitykami i PO, ceremonie Scrum.
8. Wsparcie produkcyjne: debugowanie, 3rd-line support, optymalizacja wydajności i bezpieczeństwa.
9. (Senior) projektowanie architektury, DDD i event-driven, ADR, mentoring, coaching zespołu.

## 4. Proces rekrutacji i pytania z rozmów

**Typowy proces** (Prognetics, Scalo, B2B.NET, ITFS, GOLDENORE, Sii, ITDS, ITLT) ma 2–4 etapy i trwa ~2 tygodnie (EPAM według Glassdoor: średnio 14 dni):
1. Rozmowa z HR/rekruterem (~30 min): doświadczenie, oczekiwania, dostępność, angielski.
2. Rozmowa techniczna (~60 min): teoria plus czasem live coding lub SQL.
3. **Rozmowa z klientem lub managerem**: bardzo częsta, bo ponad połowa ofert pochodzi od firm outsourcingowych/body leasingowych (Link Group, ITDS, Scalo, Antal, emagine, Sii, B2B.NET, ITFS, Square One, Shimi, NATEK, Prognetics).
4. Decyzja / oferta.

**Konkretne pytania z relacji kandydatów (Glassdoor 2026, EPAM i Capgemini):**
- GC „pod spodem”, generacje; IEnumerable vs IQueryable; ArrayList vs List<T>.
- Abstract class (czy można utworzyć instancję), abstract method, klasa abstrakcyjna vs interfejs, brak wielodziedziczenia klas w C#, override, polimorfizm w runtime, overloading vs overriding, klasy generyczne, delegaty.
- Wielowątkowość: jak zsynchronizować dwa wątki.
- Uwierzytelnianie vs autoryzacja, token-based auth, filtry w MVC.
- Live coding: zliczanie powtórzeń znaków w stringu. SQL: zapytanie z self-join.
- Pytania architektoniczne: wzorce, DI, integracja z chmurą, skalowanie aplikacji.

**Tematy pytań na seniora .NET (codewithmukesh, 2026, pod .NET 10/C# 14):** diagnostyka memory leaków, Server vs Workstation GC, DATAS, LOH, thread pool starvation, sync-over-async, lock vs SemaphoreSlim vs Interlocked, metryki RED/USE, p50 vs p99, BenchmarkDotNet, migracje schematu bez przestojów, read replica lag, skalowanie ×10, **modernizacja .NET Framework 4.8**, governance kodu z AI. Większość tych tematów baza już pokrywa (csharp-senior, data-senior, arch-senior). Brakuje modernizacji z .NET Framework.

**Tematy pytań na Angulara (arc.dev 2026):** standalone, inject(), lifecycle, reactive vs template forms vs Signal Forms, pure/impure pipes, input()/output(), funkcyjne guardy i resolvery, @defer, incremental hydration, signals vs RxJS, linkedSignal/resource, **plain signal vs NgRx SignalStore vs klasyczny NgRx**, operatory flattening, OnPush, trackBy, CDK virtual scroll, runOutsideAngular, zoneless. Baza pokrywa prawie wszystko poza klasycznym NgRx.

## 5. Widełki płacowe (orientacyjnie, październik 2026)

Z ofert (stawki B2B netto + VAT; przelicznik ~168 h/mies.):
| Poziom | Stawka godzinowa B2B | ≈ miesięcznie B2B netto | Przykłady |
|---|---|---|---|
| Junior | ~50–80 zł/h | ~8–13 tys. | Link Group Junior Angular (13–21 USD/h) |
| Mid | ~75–120 zł/h | ~13–20 tys. | Prognetics 75–110, P&P 85–95, Margo 100–110, Scalo FS 115, ZPR 10–15 tys./mies. (UoP/B2B), Shimi 1120 zł/MD |
| Senior | ~110–150 zł/h | ~19–25 tys. | Square One 120–135, DCG 125–150, Prognetics 120–145, Scalo 145, KUBO 140–150, DEVAPO 110–140, NESS 115–120, Antal 20–28,5 tys./mies. |

Odstaje sektor publiczny: ITLT, senior, 70–90 zł/h.
Ogólnorynkowo (Freenance na bazie NFJ Q1 2026, JJIT 2025/26, Bulldogjob „IT w Polsce 2026”): junior UoP 6–9 tys. brutto / B2B 8–13 tys.; mid UoP 12–18 tys. / B2B 15–22 tys.; senior UoP 18–26 tys. / B2B 22–30 (35+) tys.

## 6. Porównanie z bazą (826 kart, 27 plików)

Obszary dobrze pokryte, a nawet nadreprezentowane względem ofert: **signals (57 kart), ai (47), algo (49), sql (45), review (35), frontend (41)**. To nie jest błąd, bo rozmowy idą dalej niż ogłoszenia, ale nowych kart w tych obszarach nie trzeba dokładać.

Obszary zgodne z rynkiem: C# (57), ASP.NET (57), EF (52), Docker (23 karty), testing (46), arch (55), web/security (46), dist (40), soft (37).

## 7. LUKI – tematy do dopisania (priorytet)

Liczba w nawiasie to stan bazy: karty, których pytanie lub topic dotyczy tematu.

### P1 – wysoki (często w ofertach albo na rozmowach, a baza ma ~0)
1. **Podstawy OOP w C# – „klasyki” z rozmów juniorskich** [baza: 0 kart o polimorfizmie, overloading/overriding, filarach OOP]. Cztery filary OOP, polimorfizm (compile-time vs runtime), overloading vs overriding, `virtual`/`override`/`new` (method hiding), abstract method, dlaczego nie ma wielodziedziczenia klas, modyfikatory dostępu (`protected internal`, `private protected`), kolejność wywołań konstruktorów, `static` vs instancja, kompozycja vs dziedziczenie, Thread vs Task, ArrayList vs List<T>. → `csharp`, ~8–10 kart, level 1–2.
2. **Klasyczny NgRx Store** [baza: 0 kart z actions/reducers/effects/selectors; NgRx SignalStore 3 karty]. Wymaga go 22% ofert (29% seniorów). Zakres: Store/Actions/Reducers/Selectors (memoizacja), Effects (switchMap/concatMap/exhaustMap, obsługa błędów), @ngrx/entity, facade, kiedy NgRx, a kiedy serwis z sygnałami lub SignalStore, migracja Store → SignalStore, NGXS/Akita w jednym zdaniu, testowanie reducerów i efektów. → `angular`/`signals`, ~8 kart.
3. **Azure w praktyce dla dewelopera .NET** [baza: „Azure dla .NET” 5 kart, Azure Functions 0, App Service 1 pytanie]. Azure występuje w 35% ofert. Zakres: App Service (sloty, skalowanie, konfiguracja), **Azure Functions** (triggery i bindingi, isolated worker, cold start, Durable Functions), Key Vault + Managed Identity, Application Insights, Azure SQL, Storage (Blob/Queue), Service Bus vs Event Grid vs Event Hubs, Entra ID dla API i SPA. → `devops`, ~8 kart.
4. **Legacy .NET Framework i modernizacja** [baza: 1 karta „.NET vs .NET Framework”; WCF/SOAP/IIS/MVC 0]. Wymaga tego 27% ofert, u juniorów 50%. Zakres: ASP.NET MVC 5 vs ASP.NET Core, **filtry MVC** (action/exception/authorization) vs middleware, Razor, WCF/SOAP i CoreWCF, `web.config` vs `appsettings`, hosting w IIS vs Kestrel, .NET Standard, strategie migracji (strangler fig + YARP, upgrade assistant / Copilot modernization), WinForms/WPF w jednym zdaniu. → `aspnet`, ~8 kart.
5. **Rozmowa po angielsku + specyfika outsourcingu/B2B** [baza: 0 kart]. Angielski jest must w 38% ofert, a ponad 50% procesów ma etap „rozmowa z klientem”. Zakres: „Tell me about yourself / your last project” po angielsku, słownictwo techniczne, jak przejść rozmowę z klientem przy body leasingu, pytania o stawkę godzinową i B2B vs UoP, MD-rate, okres wypowiedzenia/dostępność. → `soft`, ~6 kart.

### P2 – średni (regularnie w ofertach, baza ma 1–5 kart)
6. **Mocking i biblioteki testowe .NET w praktyce** [Moq/NSubstitute 1, asercje 1]. Zakres: Setup/Returns/Verify, `It.IsAny`, mockowanie `HttpClient` (HttpMessageHandler), strict vs loose mocks, FluentAssertions i zmiana licencji v8 (Shouldly/AwesomeAssertions), MSTest. → `testing`, ~5.
7. **CI/CD konkretnie (pipeline .NET + Angular)** [CI/CD 4, Azure DevOps 1 wzmianka, Jenkins/TeamCity 0]. CI/CD w 38% ofert. Zakres: YAML Azure Pipelines i GitHub Actions (stages, cache NuGet/npm, artefakty, environments/approvals, sekrety), Jenkins/TeamCity, wersjonowanie, Git Flow vs trunk-based, quality gates (Sonar, testy, coverage). → `devops`, ~6.
8. **RabbitMQ + MassTransit głębiej** [RabbitMQ 2 karty, „Biblioteki messagingowe” 1]. RabbitMQ: 30% ofert, 43% u seniorów. Zakres: typy exchange'y i routing keys, ack/nack/requeue, prefetch, DLX, publisher confirms, kolejki quorum; MassTransit: consumers, retry vs redelivery, outbox, saga state machine, zmiana licencji (v9 komercyjna). → `dist`, ~6.
9. **Kubernetes dla dewelopera + Helm/OpenShift** [K8s 7, Helm/OpenShift/Terraform 0]. K8s w 46% ofert. Zakres: probes vs health checks w .NET, ConfigMap/Secret, requests/limits a GC w kontenerze, HPA, Helm chart, OpenShift (Routes, SCC, non-root), debugowanie poda, podstawy IaC (Terraform/Bicep). → `devops`, ~5.
10. **AWS dla dewelopera .NET** [1 pytanie]. Występuje w 24% ofert. Zakres: Lambda (.NET), ECS/EKS, S3, SQS/SNS, DynamoDB, RDS, IAM i Secrets Manager, mapowanie usług Azure ↔ AWS. → `devops`, ~4–5.
11. **Dapper + T-SQL i procedury w praktyce** [Dapper 1 pytanie, T-SQL głównie w „Obiekty programowalne” 3]. MS SQL w 46%, T-SQL w 19%, Dapper w 14% ofert. Zakres: QueryAsync i multi-mapping, parametry i SQL injection, transakcje, Dapper obok EF, wywołanie stored procedure z EF/Dapper, TVP, zadania SQL z rozmów (self-join, duplikaty, top-N per grupa). → `data`/`sql`, ~5.
12. **Legacy/enterprise Angular** [NgModule 1 wzmianka, 0 pytań; „Aktualizacje wersji” 1]. Oferty piszą „Angular 2+/6+/16+”. Zakres: NgModules (declarations/imports/providers, forRoot/forChild), dekoratory @Input/@Output vs input()/output(), *ngIf/*ngFor vs @if/@for, zone.js i Default CD, migracja do standalone, control flow i sygnałów (schematy `ng generate`), `ng update` przez kilka wersji. → `angular`, ~6.
13. **Dokumentacja i modelowanie** [ADR 1, C4/UML 0]. Dokumentacji wymaga 30% ofert. Zakres: ADR, model C4, diagram sekwencji i klas UML, dokumentowanie API (OpenAPI), runbook/README. → `arch`, ~3–4.

### P3 – niski (nisza, pojedyncze oferty)
14. **NoSQL**: MongoDB (dokumenty, indeksy, aggregation, driver .NET), Cosmos DB (partition key, RU), DynamoDB [0 pytań; 14% ofert]. → `data`, ~4.
15. **GraphQL** (HotChocolate, Apollo Angular, N+1 i DataLoader, vs REST) [1; 14%]. → `web`, ~3.
16. **Blazor** (render modes Server/WASM/Auto, komponenty, kiedy zamiast Angulara) [0; 11%]. → `aspnet`, ~3.
17. **Testy frontu „klasycznie”**: Jasmine/Karma → Jest/Vitest, Cypress component testing, BDD (Cucumber/Reqnroll) [Jasmine/Karma 0 pytań, Cypress/Playwright 2; 14–19%]. → `testing`, ~3.
18. **Nx monorepo / Module Federation / design system (Storybook)** [Nx 1, mikrofrontendy 1; senior FE 14%]. → `angular-senior`, ~3–4.
19. **Elasticsearch** (indeksowanie, full-text, mapping, klient .NET) [0; 8%]. → `dist`, ~2–3.
20. **Wielowątkowość klasyczna / TPL** (Parallel.ForEach, PLINQ, Interlocked, Monitor/ManualResetEvent) [lock/SemaphoreSlim 2, WhenAll 1; 5%, ale wraca na rozmowach]. → `csharp`, ~3.

**Proponowana skala uzupełnień:** ~45 kart P1, ~40 kart P2, ~20 kart P3.

**Czego NIE dokładać:** sygnały, AI/LLM, algorytmy, SignalR, Aspire. Te obszary są już mocno pokryte względem tego, czego wymagają oferty.

## 8. Źródła

**Oferty (37 w analizie):**
- https://justjoin.it/job-offer/itlt-fullstack-developer-net-angular--poland-remote--net (ITLT, senior FS)
- https://czyjesteldorado.pl/praca/341053-full-stack-developer-net-angular-kubo-poland (KUBO, FS)
- https://czyjesteldorado.pl/praca/410596-senior-net-developer-angular-square-one-resources (Square One, senior FS)
- https://czyjesteldorado.pl/praca/312021-senior-fullstack-developer-net-angular-dcg-sp-z-o-o (DCG, senior FS)
- https://www.hexjobs.com/offer/external/preview/theprotocol-98e1f442a6c12f588d34c0a659dc1f98 (Capgemini, junior .NET+Angular)
- https://pl.hexjobs.com/praca/oferta/zewnetrzna/regular-fullstack-net-developer-angular-52f708bf206b1cb3ef325d3f42decc1f (Margo, regular FS)
- https://hexjobs.com/praca/oferta/zewnetrzna/justjoinit-53ec808171c95c57b0c76ca2fdfaeb06 (P&P Solutions, FS)
- https://hexjobs.com/praca/oferta/zewnetrzna/justjoinit-3fe7f9086b3ca6d41f2bf0145d787abb (Shimi, .NET+Angular)
- https://justjoin.it/offers/link-group--net-developer-ze-znajomoscia-angulara--warszawa-net (Link Group, mid)
- https://www.pracuj.pl/praca/fullstack-developer-net-%2b-angular-warszawa,oferta,1005048320 (C&F, mid FS)
- https://www.pracuj.pl/praca/senior-net-developer-warszawa-ogrodowa-58,oferta,1005134343 (Prognetics, senior)
- https://www.pracuj.pl/praca/net-developer-warszawa-ogrodowa-58,oferta,1005134345 (Prognetics, mid)
- https://www.pracuj.pl/praca/junior-net-developer-warszawa-ogrodowa-58,oferta,1005134344 (Prognetics, junior)
- https://www.pracuj.pl/praca/net-developer-f-m-x-warszawa,oferta,1005102829 (B2B.NET)
- https://www.pracuj.pl/praca/senior-net-fullstack-developer-angular-warszawa,oferta,1004968860 (GOLDENORE, senior FS)
- https://www.pracuj.pl/praca/senior-angular-developer-warszawa-aleje-jerozolimskie-100,oferta,1005154742 (DEVAPO, senior Angular)
- https://www.pracuj.pl/praca/senior-frontend-developer-angular-warszawa,oferta,1004974630 (NESS, senior Angular)
- https://www.pracuj.pl/praca/frontend-developer-angular-poznan,oferta,1004991908 (NATEK, senior Angular)
- https://www.hexjobs.com/praca/oferta/zewnetrzna/mid-net-developer-fullstack-or-backend-c0d74fe01f1b29ff60b692fff08ef93c (Spyrosoft, mid)
- https://hexjobs.com/praca/oferta/zewnetrzna/mid-level-fullstack-net-developer-204970bc04a9a5d2aeb805add2ce8f5a (ITDS, mid FS)
- https://justjoin.it/job-offer/link-group-junior-angular-developer-gdansk-javascript (Link Group, junior Angular)
- https://hexjobs.com/praca/oferta/zewnetrzna/junior-angular-developer-bceda02b4ae56e88255bbfa26011deb2 (to samo, duplikat, nieliczony)
- https://justjoin.it/job-offer/itfs--net-developer-backend-fullstack--warszawa-net (ITFS)
- https://pl.hexjobs.com/praca/oferta/zewnetrzna/senior-net-developer-5b763b300c2194c95012ffdf77251e18 (emagine, senior)
- https://czyjesteldorado.pl/praca/332291-senior-angular-developer-xm (XM, senior Angular)
- https://www.hexjobs.com/praca/oferta/zewnetrzna/fullstack-angular-developer-e96b2b6592264573eda15b9761a16fd1 (STX Next, Angular)
- https://www.pracuj.pl/praca/junior-net-developer-wroclaw,oferta,1004641978 (BPX, junior)
- https://www.pracuj.pl/praca/senior-net-developer-wroclaw-powstancow-slaskich-9,oferta,1004985717 (Scalo, senior)
- https://pl.hexjobs.com/praca/oferta/zewnetrzna/frontend-architect-angular-a7b189bc0fe39235af080301d5dd7c0c (ITDS, Frontend Architect)
- https://czyjesteldorado.pl/praca/296152-senior-fullstack-net-developer-antal (Antal, senior FS)
- https://justjoin.it/job-offer/endava-senior-net-developer-lodz-net (Endava, senior)
- https://www.pracuj.pl/praca/net-developer-f-m-d-poznan-piekary-14-15,oferta,1004998542 (Grupa ZPR Media)
- https://www.pracuj.pl/praca/fullstack-developer-net-%2b-angular-warszawa-aleje-jerozolimskie-93,oferta,1004985893 (Scalo, mid FS)
- https://www.pracuj.pl/praca/net-developer-opole-gustawa-morcinka-43,oferta,1004990865 (HART)
- https://www.pracuj.pl/praca/junior-software-developer-radzionkow-meczennikow-oswiecimia-40,oferta,1004963674 (Aspekt, junior)
- https://www.pracuj.pl/praca/net-developer-z-blazor-f-m-x-katowice,oferta,1004969312 (Sii, Blazor)
- https://www.pracuj.pl/praca/net-developer-f-m-x-lodz-piotrkowska-157,oferta,1004961865 (Sii, Łódź)
- https://pl.hexjobs.com/praca/oferta/zewnetrzna/junior-net-developer-f-m-ebac5d5b7cbfbd527886935a2ecebd93 (Netcompany, junior)
- (odrzucona jako zbyt stara) https://pracuj.pl/praca/fullstack-net-developer-angular-warszawa,oferta,1003931668

**Rynek i wynagrodzenia:**
- https://antyweb.pl/rynek-pracy-w-it-2026 (NFJ „Rynek pracy IT 2025/2026”)
- https://antyweb.pl/zarobki-w-branzy-it-raport-2026
- https://freenance.io/zarobki/zarobki-programisty-2026-pl-junior-mid-senior-warszawa-zdalnie-stack-it

**Rozmowy i pytania:**
- https://www.glassdoor.com.mx/Entrevista/EPAM-Systems-Entrevista-E15544-RVW100232840.htm (EPAM .NET, 2026)
- https://static.glassdoor.com.mx/Interview/Capgemini-Interview-E3803-RVW49162037.htm (Capgemini .NET)
- https://codewithmukesh.com/blog/senior-dotnet-developer-interview-questions (senior .NET, .NET 10)
- https://arc.dev/employer-blog/angular-interview-questions-from-fundamentals-to-senior-level-scenarios/ (Angular 2026)
