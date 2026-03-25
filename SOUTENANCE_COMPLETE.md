# MedSys — Guide Complet de Soutenance
## Tout ce qu'il faut savoir pour présenter le projet

---

# PARTIE 1 — PRÉSENTATION GÉNÉRALE DU PROJET

## 1.1 Qu'est-ce que MedSys ?

**MedSys** est un **système de gestion hospitalière numérique** complet. Il permet à un hôpital de :
- Gérer les **dossiers médicaux** de ses patients
- Gérer le **personnel médical** (médecins, infirmiers, administrateurs)
- Permettre aux patients de **consulter leur dossier en ligne**
- Gérer les **rendez-vous**, **documents**, **analyses**, **ordonnances**
- Donner au directeur une **vue statistique** de l'hôpital

## 1.2 Composants du projet

| Composant | Technologie | Port | Rôle |
|-----------|-------------|------|------|
| `ms-auth` | Spring Boot 3.2 (Java 21) | 8082 | Authentification et gestion des comptes |
| `ms-patient-personnel` | Spring Boot 3.2 (Java 21) | 8081 | Dossiers patients, documents, messagerie |
| `medsys-web` | React 18 + Vite | 5173 | Interface web (tous les rôles) |
| `medsys-mobile` | React Native + Expo | — | Application mobile patients |
| MySQL | SGBD relationnel | 3307 | Persistance des données |

## 1.3 Les 5 rôles utilisateurs

| Rôle | Qui ? | Accès |
|------|-------|-------|
| `PATIENT` | Patient de l'hôpital | Son dossier, ses messages, ses documents |
| `MEDECIN` | Médecin | Dossiers patients, consultations, ordonnances |
| `PERSONNEL` | Infirmier, technicien | Dossiers patients |
| `DIRECTEUR` | Directeur de l'hôpital | Statistiques, vue globale |
| `ADMIN` | Administrateur système | Gestion des comptes, tout |

---

# PARTIE 2 — ARCHITECTURE MICROSERVICES

## 2.1 Pourquoi des microservices ?

L'**architecture microservices** découpe l'application en petits services indépendants, chacun responsable d'un domaine métier précis. C'est l'opposé d'une architecture **monolithique** où tout le code est dans une seule application.

**Avantages dans MedSys :**
- **Indépendance** : ms-auth peut tomber sans que ms-patient soit affecté
- **Scalabilité** : Si le login est sous forte charge, on peut dupliquer uniquement ms-auth
- **Technologies différentes** : Chaque service peut avoir ses propres dépendances
- **Équipes indépendantes** : Chaque service peut être développé par une équipe différente

## 2.2 Schéma d'architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        COUCHE PRÉSENTATION                            │
│                                                                      │
│   medsys-web (React 18, Vite)    medsys-mobile (React Native/Expo)  │
│   localhost:5173                  Application iOS/Android            │
└────────────────────────┬─────────────────────────────────────────────┘
                         │ Requêtes HTTP/HTTPS
                         │ Header: Authorization: Bearer <JWT>
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
┌─────────────────────┐        ┌──────────────────────────────┐
│     ms-auth         │        │   ms-patient-personnel        │
│     Port 8082       │◄──────►│   Port 8081                  │
│                     │        │                              │
│  • Login / Register │        │  • Dossiers médicaux         │
│  • Génération JWT   │        │  • Consultations             │
│  • Reset password   │        │  • Ordonnances               │
│  • Gestion users    │        │  • Analyses de labo          │
│  • Admin panel      │        │  • Radiologies               │
│                     │        │  • Documents (upload)        │
│  Base: ms_auth_db   │        │  • Messagerie patient        │
│                     │        │  • QR Code / PDF export      │
└────────┬────────────┘        └──────────────┬───────────────┘
         │                                    │
         └──────────────┬─────────────────────┘
                        │
                        ▼
              ┌──────────────────────┐
              │   MySQL (port 3307)  │
              │                      │
              │  ms_auth_db          │
              │  ms_patient_db       │
              └──────────────────────┘
```

## 2.3 Communication inter-services

Lors de l'**inscription d'un patient**, les deux microservices communiquent :

```
Frontend  →  ms-auth /api/v1/auth/register
              ↓
         ms-auth valide email/CIN
              ↓
         ms-auth appelle ms-patient /api/v1/patients (RestTemplate)
              ↓
         ms-patient crée Patient + DossierMedical
              ↓
         ms-auth stocke UserAccount avec patientId
              ↓
         ms-auth génère JWT et retourne au frontend
```

Cette communication se fait via **RestTemplate** (client HTTP intégré à Spring) :
```java
restTemplate.postForEntity("http://localhost:8081/api/v1/patients", patientRequest, PatientResponseDTO.class)
```

---

# PARTIE 3 — SÉCURITÉ : JWT (JSON Web Token)

## 3.1 Qu'est-ce qu'un JWT ?

Un JWT est un **token signé numériquement** qui contient des informations sur l'utilisateur. Il a 3 parties séparées par des points :

```
eyJhbGciOiJIUzI1NiJ9  .  eyJ1c2VySWQiOjEsInJvbGUiOiJNRURFQ0lOIn0  .  signature
     HEADER                          PAYLOAD                              SIGNATURE
   (algorithme)                 (données utilisateur)                (vérification)
```

**Avantage** : Le serveur n'a pas besoin de stocker les sessions. Il suffit de vérifier la signature avec la clé secrète.

## 3.2 JWT dans MedSys — ms-auth (pour le personnel)

```java
// JwtService.java — génération du token
public String generateToken(UserAccount user) {
    return Jwts.builder()
        .subject(user.getEmail())           // Identifiant principal
        .claim("userId", user.getId())
        .claim("role", user.getRole())       // MEDECIN, ADMIN, DIRECTEUR...
        .claim("nom", user.getNom())
        .claim("prenom", user.getPrenom())
        .claim("patientId", user.getPatientId())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))  // 24h
        .signWith(getSigningKey())           // HMAC-SHA256 avec JWT_SECRET
        .compact();
}
```

## 3.3 JWT dans MedSys — ms-patient (pour les patients)

Le patient se connecte avec **CIN + date de naissance** (pas de mot de passe) :
```java
// JwtService.java (ms-patient)
public String generateToken(Long patientId, String cin) {
    return Jwts.builder()
        .subject(cin)                        // CIN comme identifiant
        .claim("patientId", patientId)
        .claim("role", "PATIENT")
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSigningKey())
        .compact();
}
```

## 3.4 Flux d'authentification complet

```
1. Utilisateur saisit email + password (personnel) ou CIN + dateNaissance (patient)

2. Frontend envoie POST /api/v1/auth/login
   Body: { "email": "dr.ali@hospital.ma", "password": "secret123" }

3. Le service vérifie les credentials en base de données
   - Personnel : bcrypt.matches(password, hash_stocké)
   - Patient : dateNaissance.equals(dateStockée)

4. Le service génère un JWT signé avec JWT_SECRET

5. Le JWT est retourné au frontend
   Response: { "token": "eyJ...", "role": "MEDECIN", "nom": "Ali", ... }

6. Le frontend stocke le JWT
   - Web : sessionStorage (perdu à la fermeture de l'onglet)
   - Mobile : AsyncStorage (persistant entre les sessions)

7. Chaque requête suivante inclut le JWT :
   GET /api/v1/patient/me
   Header: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

8. Le JwtAuthFilter intercepte chaque requête :
   - Extrait le token du header
   - Vérifie la signature avec JWT_SECRET
   - Vérifie que le token n'est pas expiré
   - Extrait le rôle et l'email
   - Définit le SecurityContext Spring

9. Spring Security applique les règles d'accès :
   .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
   .requestMatchers("/api/v1/patient/**").hasRole("PATIENT")
```

## 3.5 JwtAuthFilter — Le filtre de sécurité

Ce filtre s'exécute **avant chaque requête HTTP** :

```java
// Extrait le header Authorization
String authHeader = request.getHeader("Authorization");

// Vérifie qu'il commence bien par "Bearer "
if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    filterChain.doFilter(request, response);  // Pas de token → on continue sans auth
    return;
}

// Extrait et valide le token
String token = authHeader.substring(7);  // Enlève "Bearer "
if (jwtService.isTokenValid(token)) {
    String role = jwtService.extractRole(token);
    // Définit l'utilisateur dans le contexte Spring Security
    SecurityContextHolder.getContext().setAuthentication(
        new UsernamePasswordAuthenticationToken(email, null,
            List.of(new SimpleGrantedAuthority("ROLE_" + role)))
    );
}
```

---

# PARTIE 4 — MS-AUTH : Service d'authentification

## 4.1 Modèle de données

### Entité `UserAccount`
```
UserAccount
├── id (Long, auto-increment)
├── email (String, unique, not null)
├── password (String, hashé bcrypt)
├── role (Enum: PATIENT, MEDECIN, ADMIN, PERSONNEL, DIRECTEUR)
├── patientId (Long, lien vers ms-patient)
├── personnelId (Long, lien vers Medecin)
├── nom (String)
├── prenom (String)
├── cin (String, unique)
├── enabled (boolean, compte actif/inactif)
├── resetToken (String, UUID pour reset mot de passe)
├── resetTokenExpiry (LocalDateTime, expiration 1h)
├── createdAt (LocalDateTime)
└── updatedAt (LocalDateTime)
```

**Attention** : Il n'y a pas de `@ForeignKey` entre `UserAccount` et `Patient` car ce sont deux bases de données différentes (ms_auth_db et ms_patient_db). Le lien est uniquement logique via `patientId`.

## 4.2 Endpoints disponibles

### AuthController `/api/v1/auth`

| Méthode | URL | Auth ? | Description |
|---------|-----|--------|-------------|
| POST | `/login` | Non | Connexion personnel (email + password) |
| POST | `/register` | Non | Inscription patient |
| POST | `/forgot-password` | Non | Demande de reset |
| POST | `/reset-password` | Non | Réinitialisation avec token |
| POST | `/change-password` | Oui | Changer son mot de passe |
| GET | `/verify?token=...` | Non | Vérifier un JWT |
| GET | `/me` | Oui | Infos de l'utilisateur connecté |

### AdminController `/api/v1/admin`

| Méthode | URL | Auth ? | Description |
|---------|-----|--------|-------------|
| POST | `/personnel` | ADMIN | Créer un compte médecin/personnel |
| GET | `/users` | ADMIN | Lister tous les comptes |
| GET | `/users/role/{role}` | ADMIN | Filtrer par rôle |
| PUT | `/users/{id}/toggle` | ADMIN | Activer/désactiver un compte |
| DELETE | `/users/{id}` | ADMIN | Supprimer un compte |

## 4.3 Flux de reset de mot de passe

```
1. POST /forgot-password { email: "dr.ali@hospital.ma" }
2. AuthService génère un UUID : "a1b2c3d4-e5f6-..."
3. Stocke resetToken + resetTokenExpiry (maintenant + 1h) dans UserAccount
4. EmailService envoie un email avec le lien :
   http://localhost:5173/reset-password?token=a1b2c3d4-e5f6-...

5. Utilisateur clique → Frontend affiche le formulaire
6. POST /reset-password { token: "a1b2...", newPassword: "nouveauMDP" }
7. AuthService vérifie que le token existe et n'est pas expiré
8. bcrypt.hash(nouveauMDP) → stocké en base
9. Efface resetToken et resetTokenExpiry
```

## 4.4 Hashage des mots de passe avec BCrypt

```java
// JAMAIS stocker le mot de passe en clair !
// BCrypt ajoute un "sel" aléatoire et applique 10 rounds de hachage
String hash = passwordEncoder.encode("monMotDePasse");
// Résultat: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

// Pour vérifier :
boolean ok = passwordEncoder.matches("monMotDePasse", hash);  // true
boolean ok2 = passwordEncoder.matches("mauvaisMDP", hash);    // false
```

**Pourquoi BCrypt ?** Il est intentionnellement lent (10 rounds = ~100ms), ce qui rend les attaques par force brute très coûteuses.

---

# PARTIE 5 — MS-PATIENT-PERSONNEL : Gestion médicale

## 5.1 Modèle de données complet

### Entité principale : `Patient`
```
Patient
├── id (Long, auto-increment)
├── nom (String, not null)
├── prenom (String, not null)
├── cin (String, unique, not null)       ← Identifiant national marocain
├── dateNaissance (LocalDate)
├── sexe (Enum: MASCULIN, FEMININ)
├── groupeSanguin (Enum: A_POSITIF, A_NEGATIF, B_POSITIF, B_NEGATIF,
│                        AB_POSITIF, AB_NEGATIF, O_POSITIF, O_NEGATIF)
├── telephone (String)
├── email (String)
├── adresse (String)
├── ville (String)
├── mutuelle (String)                    ← Assurance maladie
├── numeroCNSS (String)                  ← Numéro sécurité sociale
├── dossierMedical (DossierMedical)      ← OneToOne, CASCADE ALL
├── createdAt (LocalDateTime)
└── updatedAt (LocalDateTime)
```

### Entité centrale : `DossierMedical`
```
DossierMedical
├── id (Long, auto-increment)
├── numeroDossier (String, unique)       ← Auto-généré: "DM-2024-00001"
├── patient (Patient)                    ← OneToOne (back-link)
├── consultations []                     ← OneToMany, CASCADE ALL
├── antecedents []                       ← OneToMany, CASCADE ALL
├── ordonnances []                       ← OneToMany, CASCADE ALL
├── analyses []                          ← OneToMany, CASCADE ALL
├── radiologies []                       ← OneToMany, CASCADE ALL
├── hospitalisations []                  ← OneToMany, CASCADE ALL
├── certificats []                       ← OneToMany, CASCADE ALL
├── documents []                         ← OneToMany, CASCADE ALL
└── dateCreation (LocalDateTime)
```

**@PrePersist** génère automatiquement le numéro de dossier :
```java
@PrePersist
public void prePersist() {
    if (this.numeroDossier == null) {
        this.numeroDossier = "DM-" + LocalDate.now().getYear()
                            + "-" + String.format("%05d", this.id);
    }
}
```

### Diagramme des relations

```
Patient ──────────────── DossierMedical
  (1)                          (1)
                               │
              ┌────────────────┼───────────────────┐
              │                │                   │
         Consultation    Antecedent          Ordonnance
              │                                    │
         (lié à Medecin)                    LigneOrdonnance
              │
       AnalyseLaboratoire
       Radiologie
       Hospitalisation ─── (lié à Service et Medecin)
       CertificatMedical ─── (lié à Medecin)
       DocumentPatient
       MessagePatient
```

### Tous les types (Enums)

| Enum | Valeurs |
|------|---------|
| `Sexe` | MASCULIN, FEMININ |
| `GroupeSanguin` | A_POSITIF, A_NEGATIF, B_POSITIF, B_NEGATIF, AB_POSITIF, AB_NEGATIF, O_POSITIF, O_NEGATIF |
| `TypeAntecedent` | MEDICAL, CHIRURGICAL, FAMILIAL, ALLERGIQUE, GYNECOLOGIQUE, TOXICOLOGIQUE, VACCINAL |
| `NiveauSeverite` | FAIBLE, MODERE, SEVERE, CRITIQUE |
| `TypeOrdonnance` | SIMPLE, SECURISEE, BIZONE |
| `StatutAnalyse` | EN_ATTENTE, EN_COURS, TERMINE, ANNULE |
| `TypeExamen` (radio) | RADIOGRAPHIE, SCANNER, IRM, ECHOGRAPHIE, SCINTIGRAPHIE, PET_SCAN, MAMMOGRAPHIE |
| `TypeCertificat` | MEDICAL, APTITUDE, INAPTITUDE, INVALIDITE, DECES, HOSPITALISATION, REPOS |
| `TypeDocument` | ORDONNANCE, ANALYSE, RADIOLOGIE, CERTIFICAT, AUTRE |
| `ExpediteurMessage` | PATIENT, MEDECIN |

## 5.2 Endpoints disponibles

### PatientController `/api/v1/patients` (pour le personnel)

| Méthode | URL | Rôle | Description |
|---------|-----|------|-------------|
| POST | `/` | MEDECIN/ADMIN | Créer un patient |
| GET | `/` | MEDECIN/ADMIN | Liste paginée |
| GET | `/search?q=...` | MEDECIN/ADMIN | Recherche |
| GET | `/{id}` | MEDECIN/ADMIN | Détail patient |
| GET | `/{id}/dossier` | MEDECIN/ADMIN | Dossier médical complet |
| GET | `/cin/{cin}` | MEDECIN/ADMIN | Chercher par CIN |
| PUT | `/{id}` | MEDECIN/ADMIN | Modifier patient |
| DELETE | `/{id}` | ADMIN | Supprimer patient |
| GET | `/statistiques` | ADMIN/DIRECTEUR | Stats patients |

### PatientPortalController `/api/v1/patient` (pour les patients)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/me` | Mon profil |
| PATCH | `/me` | Modifier mon profil (tel, email, adresse...) |
| GET | `/me/dossier` | Mon dossier médical complet |
| GET | `/me/dossier/pdf` | Télécharger mon dossier en PDF |
| GET | `/me/qrcode` | Mon QR Code (PNG) |
| GET | `/me/notifications` | Nombre d'analyses en attente + messages non lus |
| POST | `/me/documents` | Uploader un document (multipart) |
| GET | `/me/documents` | Mes documents |
| GET | `/me/documents/{id}/fichier` | Télécharger un document |
| DELETE | `/me/documents/{id}` | Supprimer un document |
| GET | `/me/messages` | Ma messagerie |
| POST | `/me/messages` | Envoyer un message au médecin |
| PUT | `/me/messages/{id}/lu` | Marquer un message comme lu |
| GET | `/me/rdv` | Mes rendez-vous |
| PUT | `/me/rdv/{id}/annuler` | Annuler un rendez-vous |

### DirecteurController `/api/v1/directeur`

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/stats` | Toutes les statistiques de l'hôpital |
| GET | `/patients` | Liste complète des patients |
| GET | `/patients/{id}/dossier` | Dossier d'un patient |
| GET | `/patients/{id}/dossier/pdf` | Export PDF |
| GET | `/medecins` | Liste des médecins |
| GET | `/rdv` | Tous les rendez-vous |

## 5.3 Création d'un patient — logique métier

Quand un médecin crée un patient via `POST /api/v1/patients`, voici ce qui se passe dans `PatientService.createPatient()` :

```java
1. Vérifie que le CIN n'existe pas déjà (PatientAlreadyExistsException)
2. Crée l'objet Patient avec toutes les informations
3. Crée automatiquement un DossierMedical :
   - Génère le numéro de dossier
   - Traite les antécédents initiaux (si fournis)
   - Traite les ordonnances initiales (si fournies)
   - Traite les analyses initiales (si fournies)
4. Lie le DossierMedical au Patient (cascade)
5. Sauvegarde en base de données (JPA)
6. Retourne PatientResponseDTO
```

## 5.4 Upload de documents — sécurité

Le `DocumentService.uploadDocument()` applique plusieurs niveaux de validation :

```java
// Niveau 1 : Taille maximale
if (file.getSize() > 5 * 1024 * 1024)  // 5 MB max
    throw new IllegalArgumentException("Fichier trop volumineux");

// Niveau 2 : Type MIME
String contentType = file.getContentType();
if (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))
    throw new IllegalArgumentException("Type non autorisé");

// Niveau 3 : Extension whitelist
String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
if (!ext.matches("\\.(pdf|jpg|jpeg|png|gif|bmp|webp)"))
    return "";  // Pas d'extension → nom UUID uniquement

// Niveau 4 : Protection Path Traversal
Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
Path patientDir = uploadRoot.resolve(String.valueOf(patientId)).normalize();
if (!patientDir.startsWith(uploadRoot))  // Essaie de sortir du dossier ?
    throw new IllegalArgumentException("Chemin non autorisé");

// Sauvegarde : nom = UUID (jamais le nom original !)
String nomFichier = UUID.randomUUID().toString() + extension;
// Exemple : "a7f2c9d1-3b4e-4f8a-9c2d-1e5f6a7b8c9d.pdf"
```

## 5.5 Génération de PDF et QR Code

**QR Code** (bibliothèque ZXing) :
```java
// QrCodeService
QRCodeWriter writer = new QRCodeWriter();
BitMatrix bitMatrix = writer.encode(jsonData, BarcodeFormat.QR_CODE, 300, 300);
// Le QR code encode les infos du patient en JSON
// → le scanner en consultation révèle immédiatement les infos du patient
```

**PDF** (bibliothèque OpenPDF) :
```java
// PdfService
Document document = new Document();
PdfWriter.getInstance(document, outputStream);
// Crée un PDF avec : infos patient, dossier complet,
// toutes les consultations, ordonnances, analyses, radiologies
// Avec en-tête hôpital et pied de page avec nom du patient
```

---

# PARTIE 6 — FRONTEND WEB (medsys-web)

## 6.1 Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.2.0 | Framework UI composants |
| Vite | 5.0.0 | Build tool, serveur de développement |
| React Router DOM | 6.22.0 | Navigation entre pages (SPA) |
| Axios | 1.6.0 | Client HTTP pour appels API |
| CSS personnalisé | — | Styles (pas de Bootstrap/Tailwind) |
| Google Fonts | — | Syne (titres) + DM Sans (texte) |

## 6.2 Structure des fichiers

```
medsys-web/src/
├── main.jsx              → Point d'entrée React
├── App.jsx               → Routes et protection d'accès
├── index.css             → Design system complet (variables CSS)
├── api/
│   └── api.js            → Instances Axios + tous les appels API
├── context/
│   └── AuthContext.jsx   → État authentification global
└── pages/
    ├── LandingPage.jsx   → Page d'accueil avec choix rôle
    ├── PersonnelLoginPage.jsx  → Login personnel (split-panel)
    ├── PatientPortalPage.jsx   → Inscription/login patient (6 étapes)
    ├── ResetPasswordPage.jsx   → Réinitialisation mot de passe
    └── Dashboards.jsx    → 4 dashboards selon le rôle (1700 lignes)
```

## 6.3 Gestion de l'état — AuthContext

Le `AuthContext` est un **contexte React** qui partage l'état de connexion dans toute l'application :

```jsx
// context/AuthContext.jsx
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    // Stocké dans sessionStorage (perdu à fermeture du navigateur)
    sessionStorage.setItem('medsys_user', JSON.stringify(userData))
    sessionStorage.setItem('medsys_token', jwtToken)
  }

  const logout = () => {
    setUser(null); setToken(null)
    sessionStorage.clear()
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
    {children}
  </AuthContext.Provider>
}
```

**Utilisation dans les composants :**
```jsx
const { user, isAuthenticated, logout } = useAuth()
// user.nom, user.role, user.patientId...
```

## 6.4 Intercepteur Axios — Ajout automatique du token

```javascript
// api/api.js
const PATIENT_API = axios.create({ baseURL: '/api/v1' })

// Intercepteur : ajoute le JWT à CHAQUE requête automatiquement
PATIENT_API.interceptors.request.use(config => {
    const token = sessionStorage.getItem('medsys_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
```

Ainsi, le développeur n'a jamais à gérer le header manuellement — il appelle simplement `patientApi.getDocuments()` et le token est ajouté automatiquement.

## 6.5 Routes protégées

```jsx
// App.jsx
function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/" />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />

  return <Outlet />
}

// Utilisation :
<Route element={<ProtectedRoute allowedRoles={['MEDECIN', 'PERSONNEL']} />}>
  <Route path="/personnel/dashboard" element={<PersonnelDashboard />} />
</Route>
```

## 6.6 Inscription patient en 6 étapes (PatientPortalPage)

L'inscription est un **wizard multi-étapes** :

| Étape | Champs |
|-------|--------|
| 0 — Compte | Email, mot de passe, confirmation |
| 1 — Identité | Nom, prénom, CIN, date de naissance, sexe, téléphone, adresse, ville |
| 2 — Médical | Groupe sanguin, mutuelle, numéro CNSS |
| 3 — Antécédents | Liste dynamique (type, description, date, sévérité) |
| 4 — Ordonnances | Liste dynamique (type, médicaments, observations) |
| 5 — Analyses | Liste dynamique (type, date, résultats, statut) |

```jsx
// Indicateur de progression
function StepIndicator({ current }) {
  return STEPS.map((label, i) => (
    <div key={i}>
      <div style={{
        background: i < current ? '#059669' :  // Vert = étape passée
                   i === current ? '#2563eb' : // Bleu = étape actuelle
                   '#e5e7eb'                   // Gris = étape future
      }}>
        {i < current ? '✓' : i + 1}
      </div>
    </div>
  ))
}
```

## 6.7 Les 4 dashboards

### PatientDashboard
- Affiche le profil du patient
- Dossier médical avec onglets (antécédents, consultations, ordonnances, analyses, radiologies)
- Section documents (upload + liste + téléchargement)
- Messagerie avec le médecin
- Rendez-vous avec bouton d'annulation
- Export PDF + QR Code

### PersonnelDashboard
- Liste de tous les patients (avec recherche)
- Accès aux dossiers médicaux complets
- Consultation du dossier d'un patient sélectionné

### AdminDashboard
- Liste de tous les comptes utilisateurs
- Création de comptes médecin/personnel (avec envoi email)
- Activation/désactivation de comptes
- Suppression de comptes

### DirecteurDashboard
- Statistiques globales (total patients, nouveaux ce mois, médecins, analyses...)
- Répartitions : patients par ville, par groupe sanguin, par mois
- Liste complète des patients avec accès aux dossiers
- Liste des médecins et rendez-vous

## 6.8 Proxy Vite — Résolution du CORS en développement

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api/v1/patients': 'http://localhost:8081',
      '/api/v1/patient':  'http://localhost:8081',
      '/api/v1/directeur':'http://localhost:8081',
      '/api':             'http://localhost:8082',
    }
  }
}
```

En développement, toutes les requêtes partent de `localhost:5173`. Vite agit comme **proxy** et redirige vers les bons microservices. Le navigateur ne voit pas de CORS car tout semble venir du même domaine.

---

# PARTIE 7 — APPLICATION MOBILE (medsys-mobile)

## 7.1 Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| React Native | 0.74.1 | Framework mobile cross-platform |
| Expo | 51.0.0 | Toolchain + APIs natives simplifiées |
| React Navigation | 6.x | Navigation entre écrans |
| React Native Paper | 5.12.3 | Composants UI Material Design |
| AsyncStorage | — | Stockage persistant (remplace sessionStorage) |
| Expo Linear Gradient | — | Dégradés de couleur |

## 7.2 Navigation

```javascript
// AppNavigator.js
// Si non connecté → pile d'authentification
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
)

// Si connecté → onglets du bas
const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Accueil" component={HomeScreen} />
    <Tab.Screen name="Profil" component={ProfileScreen} />
  </Tab.Navigator>
)

// Sélection automatique selon isAuthenticated
export default function AppNavigator() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <MainTabs /> : <AuthStack />
}
```

## 7.3 Stockage persistant avec AsyncStorage

Contrairement au web (sessionStorage), le mobile utilise **AsyncStorage** qui persiste les données même après fermeture de l'application :

```javascript
// context/AuthContext.js
const login = async (userData, jwtToken) => {
    await AsyncStorage.setItem('medsys_token', jwtToken)
    await AsyncStorage.setItem('medsys_user', JSON.stringify(userData))
    setUser(userData); setToken(jwtToken)
}

// Au démarrage de l'app, on restaure la session
useEffect(() => {
    const restoreSession = async () => {
        const token = await AsyncStorage.getItem('medsys_token')
        const userStr = await AsyncStorage.getItem('medsys_user')
        if (token && userStr) {
            setToken(token); setUser(JSON.parse(userStr))
        }
    }
    restoreSession()
}, [])
```

## 7.4 URL des APIs (mobile)

```javascript
// api/api.js (mobile)
// En mobile, on ne peut pas utiliser localhost — il faut l'IP de la machine
const AUTH_API = axios.create({ baseURL: 'http://192.168.1.100:8082/api/v1' })
const PATIENT_API = axios.create({ baseURL: 'http://192.168.1.100:8081/api/v1' })
```

L'appareil mobile est sur le même réseau Wi-Fi que le serveur. `localhost` pointerait vers le téléphone lui-même, pas vers l'ordinateur qui fait tourner les microservices.

---

# PARTIE 8 — BASE DE DONNÉES

## 8.1 Deux bases de données séparées

Chaque microservice a **sa propre base de données** — c'est une règle fondamentale de l'architecture microservices :

| Microservice | Base de données | Tables principales |
|-------------|-----------------|-------------------|
| ms-auth | `ms_auth_db` | `user_accounts` |
| ms-patient-personnel | `ms_patient_db` | `patients`, `dossier_medicals`, `consultations`, `antecedents`, `ordonnances`, `lignes_ordonnances`, `analyses_laboratoire`, `radiologies`, `hospitalisations`, `certificats_medicaux`, `document_patients`, `message_patients`, `medecins`, `specialites`, `services` |

## 8.2 JPA / Hibernate — ORM

Spring Data JPA avec Hibernate permet de **manipuler des objets Java** au lieu d'écrire du SQL :

```java
// Sans JPA (SQL brut) :
String sql = "SELECT * FROM patients WHERE cin = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, cin);
ResultSet rs = ps.executeQuery();
// ... mapping manuel vers objet Patient

// Avec JPA (Spring Data) :
Optional<Patient> patient = patientRepository.findByCin(cin);
// JPA génère le SQL automatiquement !
```

**Configuration** dans `application.yml` :
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update    # Crée/modifie les tables automatiquement selon les entités
    show-sql: false        # Ne pas afficher le SQL généré en production
```

## 8.3 Relations JPA dans le code

```java
// Patient.java
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String cin;

    // Relation OneToOne : un patient a UN dossier médical
    // CascadeType.ALL : si on supprime le patient, le dossier est supprimé aussi
    // orphanRemoval : si on détache le dossier, il est supprimé
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "dossier_medical_id")
    private DossierMedical dossierMedical;
}

// DossierMedical.java
@Entity
public class DossierMedical {

    // Relation OneToMany : un dossier a PLUSIEURS consultations
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "dossier_medical_id")
    private List<Consultation> consultations = new ArrayList<>();
}
```

---

# PARTIE 9 — AMÉLIORATIONS APPORTÉES (Corrections & Sécurité)

## 9.1 Variables d'environnement (secrets)

**Problème** : Les secrets étaient directement dans le code source.
```yaml
# ❌ AVANT
jwt:
  secret: medsys-hospital-jwt-secret-key-2026-very-long-and-secure-string
spring:
  mail:
    password: votre-app-password
  datasource:
    username: root
    password: ""
```

**Solution** : On utilise des **variables d'environnement** avec une valeur par défaut pour le développement.
```yaml
# ✅ APRÈS
jwt:
  secret: ${JWT_SECRET:valeur-par-defaut-dev-non-securisee}
spring:
  mail:
    password: ${SMTP_PASSWORD:}
  datasource:
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}
```

En production, on définit `JWT_SECRET=uneVraieCleLongueEtAleatoire` dans l'environnement serveur. Le code source ne contient plus aucun secret.

**Fichier `.env.example`** créé pour documenter toutes les variables nécessaires.
**Fichier `.gitignore`** créé pour exclure `.env` du versionnement.

## 9.2 CORS — Origines autorisées

**Problème 1** : `@CrossOrigin("*")` sur les controllers annulait la configuration globale.
**Problème 2** : `allowedOriginPatterns("*")` autorisait n'importe quel site à appeler l'API.

```java
// ❌ AVANT
@CrossOrigin(origins = "*")
public class AuthController { ... }

config.setAllowedOriginPatterns(List.of("*"));
config.setAllowCredentials(false);
```

```java
// ✅ APRÈS
// Plus de @CrossOrigin sur les controllers
// Configuration centralisée avec origines explicites

@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
private String allowedOrigins;

config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
config.setAllowCredentials(true);
config.setMaxAge(3600L);  // Cache préflight 1 heure
```

## 9.3 Autorisation — Sécurisation des routes

**Problème** : `anyRequest().permitAll()` rendait toutes les routes non explicites publiques. La recherche de patients était accessible sans authentification.

```java
// ❌ AVANT
.requestMatchers("/api/v1/patients/**").permitAll()   // Recherche publique !
.anyRequest().permitAll()                              // Tout le reste public !

// ✅ APRÈS
.requestMatchers("/api/v1/patients/**").hasAnyRole("DIRECTEUR", "ADMIN", "MEDECIN")
.anyRequest().authenticated()  // Par défaut : authentification requise
```

## 9.4 Sécurisation des uploads

Voir Partie 5.4 pour les détails. En résumé : validation taille, type MIME, extension whitelist, protection path traversal.

## 9.5 Logging et gestion des erreurs

```java
// ❌ AVANT : erreurs silencieuses
} catch (Exception ignored) {}

// ✅ APRÈS : erreurs loggées
} catch (Exception e) {
    log.warn("JWT invalide sur {} {}: {}", request.getMethod(),
             request.getRequestURI(), e.getMessage());
}

// ❌ AVANT : message interne envoyé au client
.body(new ErrorResponse(500, "Erreur interne: " + e.getMessage()))
// Exemple : "Erreur interne: Connection refused to localhost:3306"

// ✅ APRÈS : message générique + log côté serveur
log.error("Erreur interne: {}", e.getMessage(), e);
.body(new ErrorResponse(500, "Une erreur interne s'est produite."))
```

## 9.6 URL frontend externalisée

```java
// ❌ AVANT : hardcodé
private static final String FRONTEND_URL = "http://localhost:5173";

// ✅ APRÈS : configurable
@Value("${app.frontend.url:http://localhost:5173}")
private String frontendUrl;
```

## 9.7 Construction d'URL sécurisée

```java
// ❌ AVANT : concaténation directe (risque injection)
String url = msRdvUrl + "/api/v1/rdv/" + rdvId + "/annuler?patientId=" + patientId;

// ✅ APRÈS : UriComponentsBuilder encode les paramètres automatiquement
String url = UriComponentsBuilder.fromHttpUrl(msRdvUrl)
    .path("/api/v1/rdv/{rdvId}/annuler")
    .queryParam("patientId", patientId)
    .buildAndExpand(rdvId)
    .toUriString();
```

## 9.8 Améliorations UI/UX

**index.css** étendu avec :
- Skeleton loading (shimmer animation pendant le chargement)
- Sidebar pour les dashboards
- Modals animées avec overlay
- Toast notifications
- Tables avec hover effects
- Tabs (pill et standard)
- Upload area drag & drop
- Empty states illustrés
- Stat cards avec icônes

**LandingPage** redesignée :
- Background décoratif (dégradé + grille + cercles lumineux)
- Hero avec titre dégradé animé
- Cards de rôle avec effets hover avancés (glow, élévation)
- Section statistiques + fonctionnalités

**PersonnelLoginPage** en split-panel :
- Panneau gauche : branding + liste des avantages
- Panneau droit : formulaire épuré
- Toggle pour voir/cacher le mot de passe
- Responsive (panneau gauche masqué sur mobile)

---

# PARTIE 10 — QUESTIONS POSSIBLES DU JURY

### Architecture & Design

**Q : Pourquoi avez-vous choisi une architecture microservices ?**
> *L'architecture microservices permet de séparer les responsabilités : ms-auth gère uniquement la sécurité, ms-patient gère uniquement les données médicales. Chaque service peut être déployé, scalé et mis à jour indépendamment. Si le service d'authentification tombe, les données médicales restent accessibles. C'est aussi plus facile à maintenir : une équipe peut travailler sur ms-auth sans toucher à ms-patient.*

**Q : Pourquoi deux bases de données séparées ?**
> *C'est une règle fondamentale des microservices : chaque service possède ses données. Cela évite le couplage entre services et permet à chaque service d'optimiser son schéma selon ses besoins. ms-auth n'a besoin que de UserAccount, ms-patient a besoin de toutes les entités médicales.*

**Q : Quelle est la différence entre les deux services d'authentification ?**
> *ms-auth gère l'authentification par email/password pour le personnel avec BCrypt. ms-patient gère une authentification simplifiée pour les patients par CIN + date de naissance — pas de mot de passe à retenir pour un patient qui vient rarement. Les deux génèrent des JWT mais avec des claims différents.*

### Sécurité

**Q : Pourquoi JWT et pas les sessions serveur ?**
> *JWT est stateless : le serveur n'a pas besoin de stocker les sessions en mémoire ou en base. C'est indispensable avec les microservices car chaque service peut valider le JWT localement sans appeler ms-auth. Avec les sessions, il faudrait un serveur centralisé de sessions partagé entre tous les microservices.*

**Q : Qu'est-ce que CORS et pourquoi est-ce important ?**
> *CORS (Cross-Origin Resource Sharing) est un mécanisme de sécurité des navigateurs. Un site sur `evil.com` ne peut pas faire de requêtes vers notre API sur `medsys.ma` sans que notre API l'autorise. En configurant des origines précises au lieu du wildcard `*`, on empêche des sites malveillants d'appeler notre API en utilisant le JWT d'un utilisateur connecté.*

**Q : Qu'est-ce qu'une attaque Path Traversal ?**
> *C'est une attaque où un attaquant manipule un chemin de fichier pour accéder à des fichiers hors du répertoire autorisé. Par exemple, si on construit `uploads/ + patientId + "/" + filename` sans vérification, un attaquant peut envoyer `../../etc/passwd` comme nom de fichier. Notre protection normalise le chemin et vérifie qu'il reste bien dans le dossier `uploads/`.*

**Q : Pourquoi BCrypt pour les mots de passe ?**
> *BCrypt est un algorithme de hashage conçu spécifiquement pour les mots de passe. Il est intentionnellement lent (100ms par hash) et inclut un sel aléatoire. Le sel signifie que deux utilisateurs avec le même mot de passe ont des hashes différents, ce qui empêche les attaques par tables arc-en-ciel. La lenteur rend les attaques brute force impraticables.*

### Frontend

**Q : Qu'est-ce qu'une SPA (Single Page Application) ?**
> *Une SPA est une application web qui charge une seule page HTML au départ, puis gère la navigation en JavaScript sans recharger la page. React Router intercepte les clics sur les liens et met à jour le contenu sans requête serveur. C'est plus rapide et offre une expérience proche d'une application native.*

**Q : Pourquoi stocker le JWT dans sessionStorage et pas localStorage ?**
> *sessionStorage est vidé à la fermeture de l'onglet, ce qui est plus sécurisé pour un système hospitalier. localStorage persiste indéfiniment, ce qui est un risque si quelqu'un laisse sa session ouverte. Pour le mobile, on utilise AsyncStorage qui persiste car c'est acceptable — l'utilisateur s'attend à rester connecté.*

**Q : Comment fonctionne le proxy Vite ?**
> *En développement, le frontend tourne sur localhost:5173 et les backends sur localhost:8081/8082. Sans proxy, le navigateur bloquerait les requêtes CORS. Vite permet de configurer un proxy : quand le frontend fait une requête `/api/v1/patients`, Vite la redirige vers `http://localhost:8081/api/v1/patients`. Le navigateur ne voit qu'une seule origine.*

### Mobile

**Q : Quelle est la différence entre React Native et React ?**
> *React est pour le web (produit du HTML/CSS). React Native est pour le mobile (produit des composants natifs iOS/Android). On utilise `View` au lieu de `div`, `Text` au lieu de `p`, `StyleSheet` au lieu de CSS. La logique JavaScript (état, props, hooks) est identique. Expo est une surcouche qui simplifie la configuration et donne accès aux APIs natives (caméra, position, etc.).*

### Base de données

**Q : Qu'est-ce que JPA / Hibernate ?**
> *JPA (Java Persistence API) est une spécification Java pour mapper des objets vers des tables relationnelles. Hibernate est l'implémentation. On définit nos entités avec des annotations (@Entity, @OneToMany, etc.) et Hibernate génère automatiquement le SQL, crée les tables, et fait la correspondance objet/ligne. Spring Data JPA ajoute des repositories qui génèrent les requêtes SELECT automatiquement.*

**Q : Qu'est-ce que CascadeType.ALL ?**
> *Cascade signifie que les opérations JPA (persist, merge, remove, etc.) sont propagées aux entités liées. CascadeType.ALL sur la relation Patient→DossierMedical signifie que quand on sauvegarde un Patient, le DossierMedical est automatiquement sauvegardé. Quand on supprime le Patient, le DossierMedical est automatiquement supprimé. Sans cascade, il faudrait gérer chaque entité séparément.*

---

# PARTIE 11 — TABLEAU RÉCAPITULATIF COMPLET

## Technologie utilisées

| Catégorie | Technologie | Justification |
|-----------|-------------|---------------|
| Backend | Spring Boot 3.2 | Framework Java enterprise, auto-configuration, écosystème riche |
| ORM | Spring Data JPA + Hibernate | Productivité, moins de SQL boilerplate |
| Sécurité | Spring Security + JWT | Sécurité robuste, stateless |
| SGBD | MySQL 8 | Relationnel, robuste pour données médicales |
| Frontend | React 18 | Composants réutilisables, état réactif |
| Build | Vite | Très rapide en développement, ESM natif |
| Mobile | React Native + Expo | Cross-platform iOS/Android avec code partagé |
| HTTP client | Axios | Intercepteurs, gestion d'erreurs, promises |
| PDF | OpenPDF | Génération de documents PDF |
| QR Code | ZXing | Génération de QR codes |
| Langage backend | Java 21 | LTS, records, pattern matching, virtual threads |
| Langage frontend | JavaScript (JSX) | Standard web, écosystème npm |

## Patterns et concepts appliqués

| Pattern | Où | Description |
|---------|-----|-------------|
| Microservices | Architecture | Services indépendants avec responsabilités séparées |
| Repository Pattern | Spring Data | Abstraction de l'accès aux données |
| DTO Pattern | Toutes les API | Sépare les entités JPA des objets transférés |
| Observer Pattern | React Context | État partagé avec re-rendu automatique |
| Proxy Pattern | RdvProxyService | Délégation des appels vers ms-rdv |
| Filter Chain | JwtAuthFilter | Intercepteur de requêtes HTTP |
| Builder Pattern | DTOs, Entités | Construction d'objets complexes (@Builder Lombok) |
| Facade Pattern | Services | Masque la complexité des repositories |
| Stateless Auth | JWT | Pas de session serveur |
| Fail-Safe Default | SecurityConfig | Tout est refusé par défaut, on ouvre ce qui est nécessaire |
