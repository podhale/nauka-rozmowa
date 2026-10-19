# Baza pytań

Każdy obszar ma swoje pliki JSON. `npm run content` sprawdza je i składa w `public/content/content.json`, który wczytuje aplikacja. Tego pliku nie edytuj ręcznie.

```
content/
  cards/   <cat>.json, <cat>-senior.json …   karty (fiszki) i pytania testowe; pliki o tym samym "cat" są scalane
  cheats/  <cat>.json, <cat>-senior.json …   ściągi, przypisane do tematu ("topic")
```

## Karty i pytania (`content/cards/*.json`)

```json
{
  "cat": "aspnet",
  "name": "ASP.NET Core Web API",
  "cards": [
    {
      "id": "aspnet-001",
      "topic": "Middleware",
      "level": 2,
      "q": "Pytanie (może zawierać `kod` i **pogrubienia**)",
      "a": "Odpowiedź, jaką warto powiedzieć na rozmowie (2–5 zdań).",
      "deep": "Opcjonalnie: pogłębienie na poziomie senior.",
      "code": "app.UseRouting();",
      "lang": "csharp",
      "tip": "Opcjonalnie: na co patrzy rekruter."
    }
  ],
  "quiz": [
    {
      "id": "aspnet-q001",
      "topic": "Middleware",
      "level": 2,
      "q": "Treść pytania",
      "code": "opcjonalny kod",
      "lang": "csharp",
      "options": ["A", "B", "C", "D"],
      "correct": 1,
      "why": "Dlaczego poprawna jest ta odpowiedź."
    }
  ]
}
```

- `level`: 1 = junior, 2 = mid, 3 = senior.
- `id` musi być unikalne w całej bazie. Konwencja: `<cat>-001`, `<cat>-q001`, a w pakietach seniorskich `<cat>-s001` i `<cat>-sq001`.
- `lang`: csharp, typescript, javascript, html, css, sql, json, bash, yaml, dockerfile, text.
- Postęp nauki jest zapisywany po `id`. Zmiana `id` istniejącej karty resetuje jej postęp.

## Ściągi (`content/cheats/*.json`)

```json
{
  "cat": "aspnet",
  "sheets": [
    {
      "topic": "Middleware",
      "points": ["Krótki punkt do zapamiętania"],
      "pitfalls": ["Typowa pułapka"],
      "code": "opcjonalny przykład",
      "lang": "csharp",
      "say": "Gotowa formułka na rozmowę"
    }
  ]
}
```

`topic` musi mieć dokładnie taką samą nazwę jak `topic` w kartach. Po tym polu aplikacja łączy ściągę z pytaniami.

## Nowy obszar

1. Dodaj `content/cards/<cat>.json` i `content/cheats/<cat>.json`.
2. Przypisz `cat` do grupy w `GROUPS` w `src/app/core/content.service.ts`. Bez tego obszar trafi do grupy „Inne”.
3. Uruchom `npm run content:check`.
