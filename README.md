# ⏱️ TimeSheet & CostCalc

Profesjonalna aplikacja do śledzenia czasu pracy i obliczania kosztów projektów.

## 🚀 Uruchomienie

Po prostu otwórz plik `index.html` w przeglądarce - aplikacja działa od razu!

## ✨ Funkcje

- ⏱️ **Precyzyjny timer** - stoper czasu pracy z dokładnością do sekundy
- 💰 **Automatyczne obliczanie kosztów** - na podstawie stawki godzinowej
- 📊 **Zarządzanie projektami** - dodawaj i wybieraj różne projekty
- 💾 **Historia sesji** - wszystkie sesje zapisywane lokalnie
- 📝 **Notatki** - dodawaj opisy wykonanej pracy
- 📈 **Statystyki dzienne** - podsumowanie czasu i zarobków

## 📖 Jak używać

1. **Wybierz projekt** z listy lub dodaj nowy
2. **Ustaw stawkę godzinową** (domyślnie 150 PLN/h)
3. **Kliknij START** aby rozpocząć liczenie czasu
4. **Pracuj** - timer liczy czas i koszty w czasie rzeczywistym
5. **Kliknij STOP** - sesja zostanie automatycznie zapisana
6. **Dodaj notatki** (opcjonalnie) przed zatrzymaniem timera

## 💾 Przechowywanie danych

Aplikacja używa **Firebase Firestore** do synchronizacji danych w chmurze:
- ☁️ Sesje zapisywane w Firebase
- 💾 Backup lokalny w localStorage
- 🔄 Automatyczna synchronizacja
- 📱 Dostęp z różnych urządzeń

## 🎨 Funkcje dodatkowe

- **Responsywny design** - działa na komputerach i urządzeniach mobilnych
- **Dark mode** - elegancki ciemny motyw
- **Historia z filtrowaniem** - przeglądaj wszystkie sesje
- **Statystyki dzienne** - zobacz ile dzisiaj przepracowałeś
- **Usuwanie sesji** - możliwość usunięcia błędnych wpisów

## 🔧 Technologie

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage API

## 📱 Kompatybilność

Działa we wszystkich nowoczesnych przeglądarkach:
- Chrome
- Firefox
- Safari
- Edge

## 📄 Licencja

MIT - możesz swobodnie używać i modyfikować
