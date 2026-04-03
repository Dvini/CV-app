# 📄 Kreator CV – Nowoczesny Generator Życiorysów

![Kreator CV Preview](./preview.png)

**Kreator CV** to zaawansowana aplikacja webowa stworzona w celu ułatwienia procesu tworzenia profesjonalnych, estetycznych i skutecznych życiorysów. Dzięki intuicyjnemu edytorowi i podglądowi na żywo użytkownik może w kilka minut przygotować dokument gotowy do wysłania rekruterowi.

---

## 🚀 Główne Funkcje

### ✏️ Edytor i Podgląd
- **Edytor na żywo** – Wprowadzaj zmiany i obserwuj natychmiastowe odzwierciedlenie w podglądzie dokumentu.
- **Wielostronicowe CV** – Automatyczna paginacja z poprawnym renderowaniem marginesów na każdej stronie.
- **Motyw Dark / Light** – Przełączaj się między ciemnym a jasnym widokiem edytora.

### 🎨 Personalizacja Wyglądu
- **5 szablonów CV** do wyboru:
  - **Klasyczny** – Elegancki, jednokolumnowy układ.
  - **Nowoczesny** – Dwukolumnowy układ z wydzieloną sekcją kontaktów.
  - **Minimalistyczny** – Przejrzysty styl bez zbędnych ozdobników.
  - **Kompaktowy** – Zoptymalizowany pod kątem oszczędności miejsca.
  - **Kreatywny** – Dwukolumnowy z kolorowym nagłówkiem osobowym.
- **Kolor akcentujący** – Wybierz spośród predefiniowanych kolorów lub użyj własnego (color picker).
- **Kolor tła nagłówka** – Dedykowana opcja dla szablonu Kreatywnego.
- **Typografia** – Pełna integracja z Google Fonts (Inter, Merriweather, Roboto, Open Sans, Montserrat, Lato, Playfair Display).
- **Skalowanie czcionki** – Niezależna regulacja rozmiaru nagłówków i tekstu (80–130%).
- **Ikony sekcji** – Opcjonalne ikony przy nagłówkach sekcji w dokumencie.
- **Ikony danych kontaktowych** – Opcjonalne ikony (email, telefon, lokalizacja itp.).
- **Marginesy dokumentu** – Presety (małe / normalne / duże) oraz tryb własny (0–50 mm osobno dla osi pionowej i poziomej).

### 🖼️ Zdjęcie Profilowe
- Obsługa przesyłania zdjęcia (z podglądem).
- Wybór kształtu: **koło**, **zaokrąglony kwadrat**, **prostokąt**.
- Regulacja rozmiaru zdjęcia.

### 📋 Rozbudowane Sekcje CV
Aplikacja obsługuje kompleksowy zestaw sekcji:

| Sekcja | Opis |
|--------|------|
| **Dane osobowe** | Imię, nazwisko, stanowisko, kontakt, zdjęcie |
| **Doświadczenie zawodowe** | Firma, stanowisko, zakres dat, opis |
| **Edukacja** | Uczelnia, kierunek, zakres dat |
| **Projekty** | Nazwa, opis, technologie |
| **Kursy i szkolenia** | Nazwa kursu, organizator, daty |
| **Certyfikaty** | Nazwa certyfikatu, wydawca, data |
| **Publikacje** | Tytuł, wydawca, data |
| **Języki** | Język i poziom zaawansowania |
| **Umiejętności** | Lista umiejętności technicznych i miękkich |
| **Zainteresowania** | Hobby i zainteresowania |
| **Wolontariat** | Organizacja, rola, opis, daty |
| **Referencje** | Imię, firma, kontakt |
| **Sekcja własna** | Dowolna treść zdefiniowana przez użytkownika |
| **Klauzula RODO** | Konfigurowalna klauzula ochrony danych |

### 📤 Eksport i Import Danych
- **Eksport do PDF** – Zoptymalizowany druk w formacie A4 (bez nagłówków i stopek przeglądarki).
- **Eksport JSON** – Zapisz wszystkie dane CV do pliku.
- **Import JSON** – Wczytaj i kontynuuj edycję zapisanego CV.

### 🌍 Dwujęzyczność
- Możliwość przełączenia języka dokumentu między **polskim** a **angielskim** (etykiety sekcji, daty, itp.).

---

## 🛠️ Stos Technologiczny

| Technologia | Zastosowanie |
|-------------|-------------|
| **React 19** | Główny framework UI |
| **TypeScript** | Typowanie statyczne |
| **Vite** | Błyskawiczne środowisko deweloperskie |
| **CSS3 (Vanilla)** | Custom properties, dynamiczny motyw, layout |
| **Lucide React** | Elegancki zestaw ikon SVG |
| **Google Fonts** | Integracja z popularnymi krojami pisma |
| **AI Assisted** | Rozwijany przy wsparciu modeli Claude i Gemini |

---

## ⚙️ Szybki Start

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/TwojUser/app_cv.git
   cd app_cv
   ```

2. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

3. **Uruchom serwer deweloperski:**
   ```bash
   npm run dev
   ```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`.

---

## 📁 Struktura Projektu

```
src/
├── components/
│   ├── Editor/
│   │   ├── panels/          # Panele edytora (dane osobowe, doświadczenie, wygląd…)
│   │   └── shared/          # Komponenty współdzielone edytora (Panel, pola formularza…)
│   ├── Preview/
│   │   ├── templates/       # Szablony CV (Classic, TwoColumn, Minimalist, Compact, Creative)
│   │   └── sections/        # Komponenty sekcji podglądu
│   └── Layout/              # Ogólny układ aplikacji
├── context/
│   ├── CVContext.tsx         # Główny hub kontekstu
│   ├── CVAppearanceContext.tsx  # Stan wyglądu (szablon, kolory, czcionki, marginesy)
│   ├── CVDataContext.tsx     # Stan danych sekcji CV
│   └── CVProfileContext.tsx  # Stan danych osobowych i zdjęcia
├── constants/               # Stałe (kolory, layout, czcionki)
├── hooks/                   # Hooki pomocnicze (useLocalStorage itp.)
├── types/                   # Typy TypeScript
└── utils/                   # Narzędzia pomocnicze (obsługa zdjęć itp.)
```

---

## 📄 Licencja

Projekt udostępniony na licencji **MIT**. Możesz dowolnie go modyfikować i rozwijać na własne potrzeby.

---

*Stworzone przy wsparciu AI z pasją do dobrego designu i czystego kodu.* 🤖✨
