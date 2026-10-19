# Lekcje do czytania („Nauka”) – format

Cel: wieczorne czytanie (10–15 min na lekcję), które naprawdę uczy tematu od podstaw do poziomu, na którym można o nim swobodnie rozmawiać na rozmowie (mid, z akcentami seniorskimi). Po lekcji egzamin.
Czytelnik: programista znający C#/TS, przygotowujący się do rozmowy .NET + Angular. Język: polski, terminy techniczne po angielsku. Stan wiedzy: .NET 10 / C# 14, EF Core 10, Angular 21, TypeScript 5.x. Nie wymyślaj API; experimental/preview oznaczaj.

Jeden plik na moduł: `lessons/<module>.json` (UTF-8, wcięcie 2):
```json
{
  "module": "net",
  "title": ".NET i backend",
  "order": 1,
  "lessons": [
    {
      "id": "net-async",                 // unikalne w całej bazie, kebab-case z prefiksem modułu
      "cat": "csharp",                   // obszar bazy pytań, z którym lekcja się łączy (fiszki/ściągi)
      "title": "async/await od środka",
      "level": 2,                        // 1 podstawy, 2 mid, 3 senior
      "minutes": 12,                     // szacowany czas czytania
      "intro": "2–3 zdania: czego się nauczysz i dlaczego pytają o to na rozmowach.",
      "sections": [
        { "h": "Nagłówek sekcji", "text": "Treść w prostym markdownie: akapity oddzielone pustą linią, listy '- ', **pogrubienia**, `kod inline`. Bez nagłówków # i bez tabel.", "code": "opcjonalny przykład", "lang": "csharp" }
      ],
      "takeaways": ["5–8 zdań „Najważniejsze do zapamiętania”"],
      "interview": ["3–5 typowych pytań z rozmowy na ten temat (same pytania)"],
      "exam": [
        { "id": "net-async-e1", "q": "…", "code": "opcjonalnie", "lang": "csharp", "options": ["A","B","C","D"], "correct": 2, "why": "…" }
      ]
    }
  ]
}
```
Zasady treści:
- 5–8 sekcji na lekcję, łącznie ok. 1200–2000 słów. Od intuicji („po co to jest”, analogia) → jak działa → przykład kodu → typowe błędy/pułapki → dobre praktyki → jak o tym mówić na rozmowie.
- Kod: krótki, poprawny, realistyczny (do ~20 linii na blok). `lang` ∈ csharp, typescript, html, css, sql, json, bash, yaml, dockerfile, text.
- Egzamin: 8–10 pytań na lekcję, sprawdzających zrozumienie TREŚCI lekcji (nie trywia), 4 opcje, wiarygodne dystraktory, `correct` rozłożone równomiernie, `why` po polsku. Id `<lessonId>-e1`…
- Walidacja na koniec: JSON się wczytuje; id lekcji i pytań unikalne (także względem innych plików w lessons/); `correct` w zakresie; każda lekcja ma ≥5 sekcji, takeaways, interview i ≥8 pytań.
- Pisz plik przyrostowo (po każdej lekcji zapisz), żeby praca nie przepadła.

## STYL: „łopatologicznie” (WAŻNE – życzenie użytkownika)
- Tłumacz tak, jakbyś tłumaczył koledze przy kawie: najpierw prosta analogia z życia (np. async = kelner, który nie stoi przy kuchni; kolejka = skrzynka pocztowa; DI = gniazdko elektryczne), dopiero potem szczegóły techniczne.
- Każde nowe pojęcie wyjaśnij jednym prostym zdaniem w momencie, gdy się pojawia. Żadnych skrótów bez rozwinięcia przy pierwszym użyciu.
- Krótkie akapity (2–4 zdania), dużo list i przykładów „krok po kroku” (np. „1. Przeglądarka wysyła… 2. Serwer…”).
- Pokazuj „źle → dobrze” na kodzie i wyjaśniaj, co się dzieje linijka po linijce przy trudniejszych fragmentach.
- Dopiero na końcu lekcji poziom „jak to powiedzieć na rozmowie” i niuanse seniorskie.
