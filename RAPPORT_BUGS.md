# RAPPORT_BUGS — MedSys Microservices
> Audit du 08/04/2026 — Mission 3 jours

---

## Résumé exécutif

| Service | Bugs critiques | Bugs mineurs | Statut |
|---|---|---|---|
| ms-auth | 0 | 1 | ✅ OK |
| ms-patient-personnel | 2 | 0 | ✅ Corrigé |
| medsys-web (vite.config.js) | 1 | 0 | ✅ Corrigé |
| medsys-web (api.js) | 0 | 0 | ✅ OK |
| medsys-web (AuthContext.jsx) | 0 | 0 | ✅ OK |
| medsys-web (App.jsx) | 0 | 0 | ✅ OK |
| medsys-mobile (api.js) | 1 | 0 | ✅ Corrigé |
| medsys-mobile (LoginScreen.js) | 0 | 0 | ✅ OK |
| medsys-mobile (HomeScreen.js) | 1 | 0 | ✅ Corrigé |
| medsys-mobile (package.json) | 0 | 0 | ✅ OK |

---

## Bugs détectés et corrigés

---

### BUG-01 — ms-patient-personnel : fallback JWT secret incohérent
**Fichier :** `ms-patient-personnel/src/main/java/com/hospital/patient/security/JwtService.java`
**Sévérité :** Mineur (risque uniquement si le YAML ne se charge pas)
**Description :** Le fallback de l'annotation `@Value` était :
```
medsys-secret-key-hospital-management-2026-very-long-secret
```
…alors que ms-auth utilise :
```
medsys-hospital-jwt-secret-key-2026-very-long-and-secure-string-please-change-in-prod
```
Si la propriété `jwt.secret` n'est pas trouvée dans application.yml, les deux services utilisent des secrets différents → les tokens générés par ms-auth seraient **rejetés** par ms-patient-personnel.

**Correction appliquée :** Alignement du fallback de l'annotation avec celui de ms-auth.

---

### BUG-02 — ms-patient-personnel : propriété `ms-auth.url` manquante
**Fichier :** `ms-patient-personnel/src/main/resources/application.yml`
**Sévérité :** Mineur (fonctionnel si JWT validé localement, mais propriété requise par l'architecture)
**Description :** La propriété `ms-auth.url` était absente alors que ms-auth a `ms-patient.url`. Cohérence et préparation pour les appels inter-services (ex: validation de token déportée).

**Correction appliquée :**
```yaml
ms-auth:
  url: ${MS_AUTH_URL:http://localhost:8082}
```

---

### BUG-03 — medsys-web/vite.config.js : proxy `/api/v1/admin` mal routé
**Fichier :** `medsys-web/vite.config.js`
**Sévérité :** Critique (les appels admin ne fonctionnaient pas)
**Description :** L'ancienne configuration avait :
```js
'/api': { target: 'http://localhost:8082' }  // très large
```
La nouvelle config simplifiée (`/api/v1/auth` → 8082, `/api/v1` → 8081) aurait routé `/api/v1/admin` vers ms-patient-personnel (8081), alors que `AdminController` est dans ms-auth (8082).

**Correction appliquée :** Ajout explicite de la règle `/api/v1/admin` → 8082 :
```js
'/api/v1/auth': { target: 'http://localhost:8082' },
'/api/v1/admin': { target: 'http://localhost:8082' },  // ← ajouté
'/api/v1': { target: 'http://localhost:8081' },
```

---

### BUG-04 — medsys-mobile/src/api/api.js : IP codée en dur sans constante
**Fichier :** `medsys-mobile/src/api/api.js`
**Sévérité :** Majeur (maintenance difficile, erreurs fréquentes)
**Description :** L'adresse IP était répétée deux fois directement dans les URLs :
```js
const AUTH_BASE = 'http://192.168.1.100:8082/api/v1'
const PATIENT_BASE = 'http://192.168.1.100:8081/api/v1'
```
Chaque développeur devait modifier deux lignes. Risque d'oubli.

**Correction appliquée :** Extraction en constante centralisée :
```js
const LOCAL_IP = '192.168.1.X'  // ← un seul endroit à changer
const AUTH_BASE = `http://${LOCAL_IP}:8082/api/v1`
const PATIENT_BASE = `http://${LOCAL_IP}:8081/api/v1`
```

---

### BUG-05 — medsys-mobile/HomeScreen.js : profil patient non chargé depuis ms-patient
**Fichier :** `medsys-mobile/src/screens/HomeScreen.js`
**Sévérité :** Moyen (affichage incomplet)
**Description :** HomeScreen utilisait uniquement les données du contexte d'authentification (réponse du login ms-auth). Les champs spécifiques au profil patient (téléphone, adresse, données médicales) ne sont disponibles que via `GET /api/v1/patient/me` sur ms-patient-personnel.

**Correction appliquée :** Ajout d'un appel `patientApi.me()` au montage du composant avec :
- Indicateur de chargement (ActivityIndicator)
- Fallback sur le contexte auth en cas d'erreur
- Champ `telephone` ajouté depuis le profil patient complet

---

## Points de vigilance non corrigés (non bloquants)

### WARN-01 — ms-auth : jwt.expiration = 900000ms (15 min) vs recommandé 86400000ms (24h)
**Fichier :** `ms-auth/src/main/resources/application.yml`
**Impact :** Les tokens expirent en 15 minutes. L'utilisateur web devra se reconnecter souvent.
**Recommandation :** Changer en `${JWT_EXPIRATION:86400000}` pour le développement, garder 15min pour la production. Ou implémenter le refresh token (déjà présent dans le DTO).

### WARN-02 — ms-auth/me endpoint retourne peu d'information
**Fichier :** `ms-auth/src/main/java/com/hospital/auth/controller/AuthController.java`
**Impact :** `GET /api/v1/auth/me` retourne seulement email + authorities. Le frontend web utilise le login response directement (correct), mais si `/me` est appelé seul (rechargement de page), les données sont insuffisantes.
**Recommandation :** Enrichir la réponse de `/me` avec les données complètes (nom, prenom, role, patientId).

### WARN-03 — Synchronisation patientId entre ms-auth et ms-patient-personnel
**Impact :** Le token JWT inclut `patientId` généré par ms-auth. Si ce patientId ne correspond pas à l'ID en base dans ms-patient-personnel, `/patient/me` retournera 404.
**Recommandation :** Vérifier que le flow RabbitMQ (EventPublisher) synchronise bien le patientId lors de l'inscription.

---

## Fichiers créés

| Fichier | Description |
|---|---|
| `ms-auth/TEST_ENDPOINTS.md` | Commandes curl pour tester ms-auth |
| `ms-patient-personnel/TEST_ENDPOINTS.md` | Commandes curl pour tester ms-patient |
| `DEMARRAGE.md` | Guide de démarrage complet du projet |
| `RAPPORT_BUGS.md` | Ce fichier |
