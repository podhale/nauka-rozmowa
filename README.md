# Rozmowa .NET + Angular

Aplikacja do przygotowania się do rozmowy rekrutacyjnej (.NET API, Angular, SQL, architektura, DevOps, AI, HR):
- fiszki z powtórkami w odstępach (algorytm SM-2),
- testy jednokrotnego wyboru z wyjaśnieniami,
- ściągi do każdego tematu,
- próbna rozmowa.

Napisana w Angularze 21: standalone, zoneless, signals, nowy control flow. Jest też gotowa konfiguracja Capacitora pod Androida.

## Szybki start

```bash
npm install
npm start            # składa bazę pytań i uruchamia ng serve → http://localhost:4200
```

Wymagany Node 22+. Pierwsze `npm start` utworzy `public/content/content.json` z plików w `content/`.

## Skrypty

| Komenda | Co robi |
|---|---|
| `npm start` | baza pytań + serwer deweloperski |
| `npm run content` | waliduje `content/` i składa `public/content/content.json` |
| `npm run content:check` | tylko walidacja (np. w CI) |
| `npm run build` | build produkcyjny → `dist/nauka-rozmowa/browser` |
| `npm run build:artifact` | build + wersja do publikacji jako artefakt Claude → `dist/artifact` |
| `npm run android` | build, `cap sync`, otwiera Android Studio |

## Struktura

```
content/                 baza pytań (JSON) – opis formatu w content/README.md
  cards/                 karty + pytania testowe, plik na obszar (+ pakiety *-senior)
  cheats/                ściągi do tematów
scripts/
  build-content.mjs      walidacja i scalanie bazy
  make-artifact.mjs      przygotowanie buildu do publikacji w Claude
src/app/
  core/                  logika bez UI
    models.ts            typy treści i postępu
    content.service.ts   wczytanie bazy, grupy obszarów, wyszukiwanie po temacie
    progress.store.ts    stan nauki (jeden signal), zapis do localStorage
    progress-merge.ts    scalanie postępu z dwóch urządzeń (czysta funkcja)
    srs.ts               algorytm powtórek SM-2 i pomocnicze funkcje dat
    session.service.ts   trwająca sesja fiszek / testu
    sync.service.ts      synchronizacja postępu przez Claude (opcjonalna)
    ai.service.ts        wyjaśnianie błędów, dopytywanie, ocena odpowiedzi (opcjonalne)
    claude-runtime.ts    typy dla window.claude
    ui-state.service.ts  wybrane obszary, filtry, motyw, toast
  shared/                komponenty i pipe'y wielokrotnego użytku
  features/              strony: today, cards, study, quiz, sheets, stats
  app.routes.ts          routing (hash location)
src/styles.css           tokeny kolorów (jasny/ciemny) i komponenty CSS
```

Ciekawe miejsca do omówienia na rozmowie:
- **`ProgressStore`**: niemutowalny stan w jednym `signal`, `computed` dla widoków i `effect` do zapisu.
- **`progress-merge.ts`**: przemienne scalanie danych z dwóch urządzeń („nowszy wygrywa”, tombstone po resecie).
- **`SessionService`**: stan sesji poza komponentami, więc przetrwa przejście do ściągi i z powrotem.
- **Komponenty**: `input()`, `viewChild()`, `withComponentInputBinding()` (parametry trasy jako inputy), OnPush wszędzie.

## Funkcje z Claude'em

Synchronizacja postępu między telefonem a komputerem oraz funkcje AI działają, gdy aplikacja jest otwarta jako artefakt w Claude: korzysta wtedy z `window.claude`. Wszędzie indziej (`ng serve`, Capacitor) te funkcje są ukryte, a postęp zostaje w `localStorage`. Naturalny następny krok to własne API w ASP.NET Core do synchronizacji, a nawet do AI.

## Android (Capacitor)

```bash
npx cap add android      # tylko za pierwszym razem, wymaga Android Studio
npm run android
```

## Dodawanie pytań

Edytuj albo dodaj pliki w `content/cards` i `content/cheats` (format opisany w `content/README.md`), a potem uruchom `npm run content:check`.
