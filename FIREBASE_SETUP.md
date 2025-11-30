# 🔥 Konfiguracja Firebase

## WAŻNE! Ustaw reguły Firestore

1. Przejdź do: https://console.firebase.google.com/
2. Wybierz projekt: **instagenius-9f123**
3. W menu wybierz **Firestore Database**
4. Kliknij zakładkę **Rules** (Reguły)
5. Wklej poniższe reguły:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
  }
}
```

6. Kliknij **Publish** (Opublikuj)

## Testowanie

Po ustawieniu reguł:
1. Otwórz `index.html`
2. Otwórz konsolę (F12)
3. Wybierz projekt
4. START → poczekaj → STOP
5. Sprawdź w konsoli czy widzisz: "☁️ Zapisano do Firebase"

## Sprawdzanie danych

W Firebase Console → Firestore Database → Data
Powinieneś zobaczyć kolekcję `sessions` z zapisanymi sesjami.

## Rozwiązywanie problemów

### Błąd: "Missing or insufficient permissions"
- Ustaw reguły jak powyżej
- Poczekaj 1-2 minuty na propagację

### Sesje zapisują się tylko lokalnie
- Sprawdź reguły Firestore
- Sprawdź konsolę przeglądarki (F12) dla błędów
- Upewnij się że masz połączenie z internetem

### Dane nie synchronizują się
- Odśwież stronę (F5)
- Sprawdź czy w Firebase Console widzisz dane
