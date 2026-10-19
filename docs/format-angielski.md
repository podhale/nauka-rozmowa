# Obszar „Angielski na rozmowę” (cat = "english", name = "Angielski na rozmowę")

Użytkownik ma SŁABY angielski (ok. A2/B1). Cel: przeżyć i dobrze wypaść na rozmowie technicznej/HR po angielsku. Wszystko ma być proste, krótkie i z polskim tłumaczeniem.

Format jak w SPEC.md (karty + quiz), z DODATKOWYMI polami w kartach:
- `q` – po polsku (np. „Jak powiedzieć: Byłem odpowiedzialny za backend.” albo „Pytanie rekrutera: Tell me about yourself.”) lub angielskie pytanie rekrutera.
- `a` – TYLKO tekst angielski, który użytkownik ma powiedzieć (to pole aplikacja czyta na głos syntezatorem en-US). Bez polskich wtrąceń, bez markdownu poza `kodem` jeśli konieczne.
- `tr` – polskie tłumaczenie `a` (wymagane).
- `pron` – opcjonalnie: wymowa trudnych słów z `a` zapisana „po polsku”, np. „cache – kesz; queue – kju; architecture – arkitekczer”.
- `tip` – po polsku: na co uważać, jak to uprościć, alternatywna krótsza wersja.
- `level`: 1 = proste zdania/zwroty, 2 = dłuższe odpowiedzi, 3 = opowiadanie o architekturze/decyzjach.
- Bez `code`/`lang`.
Zdania w `a`: krótkie (do ~15 słów), proste czasy (Present Simple, Past Simple, Present Perfect), naturalne, bez idiomów. Dłuższe odpowiedzi (level 2–3) = 3–6 krótkich zdań.

Quiz: pytania po polsku, opcje po angielsku (lub odwrotnie), `why` po polsku wyjaśnia błąd. Typowo: wybierz poprawne zdanie / tłumaczenie / zwrot; typowe błędy Polaków; false friends.

Ściągi (cheats/<plik>.json, format CHEATS_SPEC.md): `points` w formacie „English phrase — polskie tłumaczenie”, `pitfalls` = typowe błędy, `say` = jedno gotowe zdanie EN (z tłumaczeniem w nawiasie). Bez `code`.

Id: `english-NNN`/`english-qNNN` (plik english.json) albo `english-vNNN`/`english-vqNNN` (plik english-vocab.json).
Walidacja jak w SPEC.md + każda karta ma niepuste `tr`; każdy topic ma ściągę.
