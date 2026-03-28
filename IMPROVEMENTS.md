# Kreator CV — Analiza i propozycje ulepszeń

> Dokument przygotowany na podstawie analizy kodu źródłowego oraz działającej aplikacji (localhost:5173).

---

## Spis treści

1. [Brakujące sekcje CV](#1-brakujące-sekcje-cv)
2. [Nowe funkcjonalności](#2-nowe-funkcjonalności)
3. [Problemy w kodzie (bugi / ryzyka)](#3-problemy-w-kodzie)
4. [Wydajność](#4-wydajność)
5. [Dostępność (a11y)](#5-dostępność-a11y)
6. [Bezpieczeństwo](#6-bezpieczeństwo)
7. [UX / UI](#7-ux--ui)
8. [Internacjonalizacja (i18n)](#8-internacjonalizacja-i18n)
9. [Jakość kodu i architektura](#9-jakość-kodu-i-architektura)
10. [DevOps / Tooling](#10-devops--tooling)
11. [Podsumowanie priorytetów](#11-podsumowanie-priorytetów)

---

## 1. Brakujące sekcje CV

Standardowe CV (szczególnie w branży IT i akademickiej) często zawierają sekcje, których brakuje w aplikacji:

| Sekcja                            | Opis                                                                                                    | Priorytet |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | --------- |
| **Certyfikaty / Nagrody**         | Osobna sekcja na certyfikaty (AWS, Azure, CKAD itp.) i nagrody — obecnie schowane w "Szkolenia i Kursy" | 🔴 Wysoki |
| **Referencje**                    | Lista referencji lub notatka "dostępne na życzenie"                                                     | 🟡 Średni |
| **Publikacje**                    | Artykuły, prace naukowe, posty techniczne                                                               | 🟡 Średni |
| **Wolontariat**                   | Aktywności wolontariackie — cenione przez wielu rekruterów                                              | 🟡 Średni |
| **Sekcje niestandardowe**         | Możliwość dodania własnej sekcji z dowolną nazwą i treścią (np. "Wystąpienia publiczne", "Patenty")     | 🔴 Wysoki |
| **Profil / "O mnie" rozszerzony** | Możliwość dodania kluczowych wyników (metrics) np. "Zredukowałem czas ładowania o 40%"                  | 🟢 Niski  |

---

## 2. Nowe funkcjonalności

### 2.1 Eksport i udostępnianie

| Propozycja                  | Szczegóły                                                                                                                                                | Priorytet |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Eksport do DOCX**         | Wielu rekruterów wymaga formatu Word — można użyć `docx` npm package                                                                                     | 🔴 Wysoki |
| **Prawdziwy eksport PDF**   | Obecny `window.print()` daje różne wyniki w różnych przeglądarkach. Użyć `html2canvas` + `jsPDF` lub `@react-pdf/renderer` dla deterministycznego wyniku | 🔴 Wysoki |
| **Udostępnianie linkiem**   | Generowanie publicznego linku do podglądu CV (np. base64 w URL lub serwer)                                                                               | 🟡 Średni |
| **Eksport do Markdown/TXT** | Wersja tekstowa CV pod systemy ATS                                                                                                                       | 🟢 Niski  |

### 2.2 Zarządzanie wieloma CV

| Propozycja           | Szczegóły                                                            | Priorytet |
| -------------------- | -------------------------------------------------------------------- | --------- |
| **Wiele profili CV** | Tworzenie różnych wersji CV (np. pod frontend dev, fullstack, lider) | 🔴 Wysoki |
| **Duplikowanie CV**  | Kopiowanie istniejącego CV jako bazę do nowej wersji                 | 🟡 Średni |
| **Historia zmian**   | Undo/redo + przywracanie poprzednich wersji                          | 🟡 Średni |

### 2.3 Wspomaganie treści

| Propozycja                   | Szczegóły                                                                           | Priorytet |
| ---------------------------- | ----------------------------------------------------------------------------------- | --------- |
| **Podpowiedzi AI**           | Generowanie opisu stanowiska, podsumowania, ulepszanie języka (OpenAI / Gemini API) | 🟡 Średni |
| **Sprawdzanie pisowni**      | Integracja z checkerem gramatyki (np. LanguageTool API)                             | 🟡 Średni |
| **Słowa kluczowe ATS**       | Analiza dopasowania CV do konkretnej oferty pracy                                   | 🟢 Niski  |
| **Podpowiedzi formatu daty** | Walidacja i auto-formatowanie dat (MM/YYYY)                                         | 🟡 Średni |

### 2.4 Szablony i wygląd

| Propozycja               | Szczegóły                                                                      | Priorytet |
| ------------------------ | ------------------------------------------------------------------------------ | --------- |
| **Więcej szablonów**     | 3 to minimum — dodać co najmniej 2-3 nowe (np. kreatywny, akademicki, compact) | 🟡 Średni |
| **Podgląd szablonów**    | Miniaturki szablonów w panelu wyboru zamiast samych nazw                       | 🟡 Średni |
| **Kolory gradientowe**   | Nagłówek lub sidebar z gradientem                                              | 🟢 Niski  |
| **Ikony przy sekcjach**  | Opcjonalne ikonki (Lucide) przy nagłówkach sekcji CV                           | 🟢 Niski  |
| **Niestandardowe fonty** | Upload własnego fontu lub więcej opcji z Google Fonts                          | 🟢 Niski  |

### 2.5 Import danych

| Propozycja                    | Szczegóły                                                    | Priorytet |
| ----------------------------- | ------------------------------------------------------------ | --------- |
| **Import z LinkedIn**         | Parsowanie eksportu ZIP z LinkedIn                           | 🟡 Średni |
| **Import z istniejącego PDF** | OCR / parsowanie PDF do wypełnienia formularzy               | 🟢 Niski  |
| **Synchronizacja z chmurą**   | Zapis do Google Drive / Dropbox (obecnie tylko localStorage) | 🟡 Średni |

---

## 3. Problemy w kodzie

### 3.1 Bugi i ryzyka

| Problem                                 | Lokalizacja                                            | Opis                                                                                                                                        | Priorytet    |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Brak limitu rozmiaru zdjęcia**        | `CVContext.jsx` — `handlePersonalChange('photo', ...)` | Zdjęcie jest zapisywane jako base64 w localStorage (limit ~5MB). Duże zdjęcie (np. 8MB DSLR) -> quota exceeded -> cichy błąd, utrata danych | 🔴 Krytyczny |
| **Brak walidacji formularzy**           | Wszystkie panele                                       | Puste imię, niepoprawny email, złe daty — wszystko akceptowane                                                                              | 🔴 Wysoki    |
| **Brak walidacji URL**                  | `PersonalPanel.jsx`                                    | Pola LinkedIn/GitHub/Website trafiają bezpośrednio do `<a href>` bez walidacji — ryzyko XSS przy `javascript:` URI                          | 🔴 Wysoki    |
| **Puppeteer w dependencies**            | `package.json`                                         | Puppeteer (250MB+) jest w `dependencies` ale nigdzie nie używany. Zwiększa czas instalacji i rozmiar                                        | 🟡 Średni    |
| **Brak wersjonowania schematu danych**  | `CVContext.jsx`, `useLocalStorage.js`                  | Zmiana struktury danych łamie stare zapisy. Brak mechanizmu migracji                                                                        | 🟡 Średni    |
| **Cicha utrata danych**                 | `useLocalStorage.js`                                   | `localStorage.setItem` otoczony try/catch, ale brak powiadomienia użytkownika                                                               | 🟡 Średni    |
| **Paginacja przy ogromnych elementach** | `CVPreview.jsx`                                        | Jeśli pojedynczy element (np. długi opis doświadczenia) jest wyższy niż cała strona A4 — algorytm nie dzieli go poprawnie                   | 🟡 Średni    |

### 3.2 Niespójności

| Problem                         | Szczegóły                                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `languageLevels` only in Polish | Tablica w `translations.js` nie ma wersji angielskiej — po zmianie języka na EN nadal wyświetla polskie opisy poziomów |
| `sectionNamesPl` hardcoded      | Brak odpowiednika `sectionNamesEn` — panel boczny zawsze po polsku                                                     |
| Nazwa projektu `"init-temp"`    | W `package.json` → `name: "init-temp"` — wygląda na tymczasową                                                         |
| Brak `lang` na `<html>`         | Index.html: `<html lang="en">` — powinno być dynamiczne (pl/en) zależnie od wybranego języka                           |

---

## 4. Wydajność

| Problem                               | Rozwiązanie                                                                                                                                                            | Priorytet |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Brak debounce na inputach**         | Każde naciśnięcie klawisza → zapis do localStorage + re-render podglądu. Dodać `useDeferredValue` lub `debounce` (300ms)                                               | 🔴 Wysoki |
| **ResizeObserver + MutationObserver** | Oba nasłuchują jednocześnie na zmianę rozmiaru. Consolidować w jeden callback z `requestAnimationFrame`                                                                | 🟡 Średni |
| **Brak code-splitting**               | Cała aplikacja w jednym bundle. Szablony i panele mogłyby być lazy-loaded (`React.lazy`)                                                                               | 🟡 Średni |
| **Google Fonts ładowane dynamicznie** | Tworzenie `<link>` w `useEffect` — brak preload. Na wolnym łączu widać FOUT (flash of unstyled text)                                                                   | 🟡 Średni |
| **Brak memoizacji**                   | Komponenty szablonów (`ClassicTemplate`, `TwoColumnTemplate`, `MinimalistTemplate`) nie są wrapped w `React.memo`. Każdy re-render rodzica powoduje re-render szablonu | 🟡 Średni |
| **Zdjęcia bez kompresji**             | Base64 fotki nieprzeskalowane → mogą mieć 5MB+. Przeliczyć przez `<canvas>` do max 300x300px                                                                           | 🔴 Wysoki |

---

## 5. Dostępność (a11y)

| Problem                                                     | Rozwiązanie                                                                                         | Priorytet |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------- |
| **Kafelki kolorów (color swatches) niedostępne klawiaturą** | Dodać `role="radio"`, `tabIndex`, `onKeyDown`                                                       | 🔴 Wysoki |
| **Slidery bez etykiet**                                     | `<input type="range">` bez `aria-label` / `aria-valuetext`                                          | 🟡 Średni |
| **Przełączniki (toggle) bez ARIA**                          | Checkboxy stylowane jako switche — brak `role="switch"` i `aria-checked`                            | 🟡 Średni |
| **Brak skip-to-content**                                    | Dla użytkowników czytników ekranu brak możliwości pominięcia sidebara                               | 🟡 Średni |
| **Brak focus management**                                   | Po dodaniu/usunięciu elementu (doświadczenie itp.) focus nie przenosi się na nowy/poprzedni element | 🟡 Średni |
| **Kontrast kolorów**                                        | Niektóre kolory akcentujące (jasnoniebieskie) mogą nie spełniać WCAG AA na białym tle               | 🟡 Średni |
| **Brak alt text na zdjęciu**                                | Zdjęcie profilowe w podglądzie nie ma `alt` opisowego                                               | 🟢 Niski  |

---

## 6. Bezpieczeństwo

| Problem                          | Ryzyko                                                                                                                                                                      | Rozwiązanie                                        | Priorytet                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- | --------- |
| **Brak sanityzacji danych**      | Dane użytkownika renderowane bezpośrednio w JSX. React domyślnie escapuje, ale `dangerouslySetInnerHTML` nie jest wymagane — to OK. Jednak linki (`href`) nie są walidowane | `javascript:` URI w polu LinkedIn → XSS            | Walidacja URL (musi zaczynać się od `https://` lub `http://`) | 🔴 Wysoki |
| **Import JSON bez walidacji**    | Złośliwy plik JSON z ogromnym payloadem lub nieprawidłowymi typami                                                                                                          | Dodać schema validation (np. `zod` lub ręcznie)    | 🟡 Średni                                                     |
| **localStorage bez szyfrowania** | Dane CV (w tym zdjęcie, dane osobowe) dostępne w DevTools                                                                                                                   | Opcjonalne szyfrowanie (AES z hasłem użytkownika)  | 🟢 Niski                                                      |
| **Google Fonts CDN**             | Śledzenie przez Google (GDPR/RODO)                                                                                                                                          | Self-host fonty lub użyć `fontsource` npm packages | 🟡 Średni                                                     |

---

## 7. UX / UI

### 7.1 Problemy zmierzone na działającej aplikacji

| Problem                                   | Opis                                                                                                   | Priorytet |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------- |
| **Sidebar zawsze 480px**                  | Na ekranach 1024–1280px sidebar zajmuje prawie połowę. Brak opcji zwinięcia/resize                     | 🔴 Wysoki |
| **Brak drag & drop**                      | Kolejność sekcji i elementów zmieniana tylko strzałkami ↑↓. Drag & drop byłby znacznie intuicyjniejszy | 🟡 Średni |
| **Brak potwierdzenia usunięcia**          | "Usuń doświadczenie" — jedno kliknięcie bez potwierdzenia                                              | 🔴 Wysoki |
| **Brak undo/redo**                        | Żadna operacja nie jest odwracalna (Ctrl+Z nie działa)                                                 | 🟡 Średni |
| **Brak tooltipów**                        | Ikony przycisków (↑↓, 🗑, ➕) bez opisów — niejasne dla nowych użytkowników                            | 🟡 Średni |
| **Brak loading state**                    | Przy imporcie JSON, generowaniu PDF — brak spinnera lub skeleton                                       | 🟡 Średni |
| **Brak toastów/notyfikacji**              | Operacje (zapis, reset, eksport) nie dają feedbacku. Jedynie surowe `alert()`                          | 🔴 Wysoki |
| **Preview nie scrolluje się niezależnie** | Na długim CV trzeba scrollować cały viewport zamiast niezależnego scrollu preview i edytora            | 🟡 Średni |
| **Brak trybu "pusty szablon"**            | Nowy użytkownik dostaje wypełnione CV Jana Kowalskiego — nie ma opcji "zacznij od zera"                | 🟡 Średni |
| **Responsywność na tabletach**            | Breakpoint tylko na 768px. Na tabletach (1024px) układ jest niewygodny                                 | 🟡 Średni |

### 7.2 Brakujące komforty

- **Autosave indicator** — pasek lub ikona pokazujący "Zapisano" / "Zapisywanie..."
- **Podgląd na żywo numeru stron** — aktualnie widoczny, ale mógłby być bardziej wyraźny
- **Print preview mode** — tryb do zobaczenia jak CV wygląda na druku (bez UI edytora)
- **Zoom podglądu** — możliwość powiększenia/pomniejszenia podglądu CV
- **Podgląd na telefonie** — aktualnie jest toggle editor/preview, ale mógłby być bardziej intuicyjny

---

## 8. Internacjonalizacja (i18n)

| Problem                              | Rozwiązanie                                                                                       | Priorytet |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | --------- |
| **`languageLevels` tylko po polsku** | Dodać wersję EN: `['A1 – Beginner', 'A2 – Elementary', ...]`                                      | 🔴 Wysoki |
| **`sectionNamesPl` bez EN**          | Dodać `sectionNamesEn` i dynamicznie wybierać                                                     | 🔴 Wysoki |
| **Hardkodowany polski w UI edytora** | Nagłówek "Kreator CV", przyciski "Pobierz PDF", "Dodaj doświadczenie" — brak tłumaczenia          | 🟡 Średni |
| **Brak frameworka i18n**             | Tłumaczenia w ręcznym obiekcie. Przy więcej niż 2 językach — użyć `react-i18next` lub `next-intl` | 🟡 Średni |
| **Brak RTL**                         | Arabski, hebrajski — nie obsługiwane                                                              | 🟢 Niski  |
| **Format daty**                      | Daty zawsze w MM/YYYY — w niektórych krajach preferowane YYYY-MM lub DD.MM.YYYY                   | 🟢 Niski  |
| **Domyślna klauzula RODO**           | Tylko polska wersja — brak angielskiego odpowiednika                                              | 🟡 Średni |

---

## 9. Jakość kodu i architektura

### 9.1 Architektura

| Problem                    | Rozwiązanie                                                                                                                                             | Priorytet |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Monolityczny CVContext** | Jeden kontekst z 40+ wartościami → każda zmiana powoduje re-render WSZYSTKICH konsumentów. Podzielić na `DataContext`, `AppearanceContext`, `UIContext` | 🟡 Średni |
| **Brak TypeScript**        | Cała aplikacja w czystym JSX. Brak type-safety → łatwo o literówki w nazwach pól                                                                        | 🟡 Średni |
| **Brak testów**            | Zero testów (unit, integration, e2e). Krytyczne dla aplikacji, która manipuluje danymi użytkownika                                                      | 🔴 Wysoki |
| **Brak routingu**          | Jedna strona — OK na teraz, ale export/preview/print mogłyby mieć dedykowane ścieżki                                                                    | 🟢 Niski  |
| **Brak Error Boundary**    | Crash w komponencie → biały ekran. React Error Boundary chroniłby przed tym                                                                             | 🔴 Wysoki |

### 9.2 Code smells

| Problem                        | Lokalizacja                                     | Opis                                                                     |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------ |
| Magic numbers                  | `CVPreview.jsx`                                 | `36`, `24`, `1123`, `3.7795` — wyciągnąć do stałych                      |
| Duża funkcja paginacji         | `CVPreview.jsx`                                 | ~200 linii w jednym `useEffect`. Rozbić na custom hook `usePagination()` |
| Duplikacja logiki szablonów    | `ClassicTemplate.jsx`, `MinimalistTemplate.jsx` | Wspólny kod sekcji powtarza się — wyciągnąć do współdzielonych bloków    |
| `safeData` computed w renderze | `CVContext.jsx`                                 | Tworzony na nowo przy każdym renderze. Wrap w `useMemo`                  |
| `fileInputRef` w kontekście    | `CVContext.jsx`                                 | Ref na `<input type="file">` nie powinien żyć w state context            |
| Brak PropTypes/TS              | Wszystkie komponenty                            | Żaden komponent nie deklaruje oczekiwanych propsów                       |

### 9.3 Brakujące narzędzia

- **Prettier** — brak formattera kodu (tylko ESLint)
- **Husky + lint-staged** — brak pre-commit hooków
- **GitHub Actions CI** — brak automatycznych buildów/testów
- **Storybook** — przydatne do izolowanego rozwoju komponentów (opcjonalne)

---

## 10. DevOps / Tooling

| Propozycja                        | Szczegóły                                                            | Priorytet      |
| --------------------------------- | -------------------------------------------------------------------- | -------------- |
| **Usunąć Puppeteer**              | Nieużywany, 250MB+ — usunąć z `dependencies`                         | 🔴 Natychmiast |
| **Zmienić `name` w package.json** | `"init-temp"` → `"kreator-cv"` lub `"cv-builder"`                    | 🟢 Niski       |
| **Dodać `.nvmrc`**                | Określić wersję Node.js dla spójności                                | 🟢 Niski       |
| **Dodać Prettier**                | Spójne formatowanie kodu w zespole                                   | 🟡 Średni      |
| **Dodać testy**                   | Jest + React Testing Library lub Vitest                              | 🔴 Wysoki      |
| **Dodać CI/CD**                   | GitHub Actions: lint → test → build → deploy (np. na Vercel/Netlify) | 🟡 Średni      |
| **Performance budget**            | Lighthouse CI w pipeline                                             | 🟢 Niski       |

---

## 11. Podsumowanie priorytetów

### 🔴 Do zrobienia ASAP (krytyczne)

1. **Usunąć Puppeteer** z dependencies (natychmiast)
2. **Kompresja zdjęć** — max 300x300px, limit rozmiaru ~200KB
3. **Walidacja URL** w polach LinkedIn/GitHub/Website (`https://` prefix)
4. **Potwierdzenie przed usunięciem** elementów (modal/dialog)
5. **System notyfikacji** (toast zamiast `alert()`)
6. **Error Boundary** na najwyższym poziomie
7. **Sekcja Certyfikaty/Nagrody** — brakująca kluczowa sekcja CV
8. **Testy** — przynajmniej unit testy na CVContext i paginację

### 🟡 Następny krok (ważne)

9. Debounce na inputach (wydajność)
10. Pełna internacjonalizacja edytora (nie tylko CV)
11. `languageLevels` w EN + `sectionNamesEn`
12. Sekcje niestandardowe (custom sections)
13. Drag & drop dla kolejności sekcji
14. Undo/redo (historia edycji)
15. Wiele profili CV
16. Lepszy eksport PDF (`html2canvas` + `jsPDF`)
17. Podzielenie CVContext na mniejsze konteksty
18. Zwijany/resizable sidebar

### 🟢 Nice to have (przyszłość)

19. Import z LinkedIn
20. Eksport do DOCX
21. Sugestie AI (OpenAI/Gemini)
22. Więcej szablonów + miniaturki
23. TypeScript migration
24. Dark mode w podglądzie CV (nie tylko UI)
25. PWA (offline support, ikona na pulpicie)
26. Storybook komponentów

---

_Dokument wygenerowany: 2026-03-28_
