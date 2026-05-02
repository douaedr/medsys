# 🏥 appointment-service

Microservice Spring Boot de gestion des rendez-vous médicaux,
**migré depuis le projet .NET `MedicalAppointments`** vers Java/Spring Boot
pour s'intégrer à l'architecture microservices PFA.

---

## 📦 Stack technique

| Composant | Choix |
|-----------|-------|
| Langage   | Java 21 |
| Framework | Spring Boot 3.3.4 |
| Base de données | MySQL (XAMPP, port **3307**, base `medical_appointments`) |
| Auth      | Spring Security + JWT (jjwt) |
| WebSocket | Spring WebSocket + STOMP (équivalent SignalR) |
| Mail      | spring-boot-starter-mail (équivalent MailKit) |
| Doc API   | Swagger UI : `http://localhost:8082/swagger` |
| Build     | Maven |

---

## 🚀 Démarrage rapide

### 1. Prérequis
- ☑️ JDK 21
- ☑️ Maven 3.9+
- ☑️ XAMPP avec **MySQL démarré sur le port 3307**
- ☑️ La base `medical_appointments` existe déjà (créée par le projet .NET) — ou crée-la dans phpMyAdmin

### 2. Vérifier la config dans `application.properties`
```
spring.datasource.url=jdbc:mysql://127.0.0.1:3307/medical_appointments
spring.datasource.username=root
spring.datasource.password=
```
Adapte si ton MySQL XAMPP a un mot de passe.

### 3. Lancer
```bash
mvn spring-boot:run
```
ou via IntelliJ : ouvrir le projet, lancer `AppointmentServiceApplication`.

### 4. Tester
- Swagger : `http://localhost:8082/swagger`
- Fichier de tests : `src/test/resources/appointment-tests.http` (clic sur ▶️ à côté de chaque requête dans IntelliJ)

---

## 🔗 Architecture microservices

```
┌──────────────────────┐       ┌──────────────────────┐
│  patient-service     │       │  appointment-service │
│  port 8081           │◄──────│  port 8082 (CE PROJET│
│  PostgreSQL          │       │  MySQL XAMPP 3307    │
└──────────────────────┘       └────────┬─────────────┘
                                        │
                                        ▼
                               ┌──────────────────────┐
                               │  chatbot-service     │
                               │  port 8083           │
                               └──────────────────────┘
```

Le `chatbot-service` interroge le bridge interne (`/api/internal/*`)
pour répondre aux questions du type *"Quand est mon prochain rendez-vous ?"*.

---

## 📚 Tableau de migration .NET → Spring Boot

| .NET (C#)                        | Spring Boot (Java)                      |
|----------------------------------|------------------------------------------|
| `[ApiController]` + `[Route]`    | `@RestController` + `@RequestMapping`    |
| `[HttpGet/Post/Put/Delete]`      | `@GetMapping` / `@PostMapping` / etc.    |
| `[Authorize(Roles="...")]`       | `@PreAuthorize("hasRole('...')")`        |
| `[FromBody]` / `[FromQuery]`     | `@RequestBody` / `@RequestParam`         |
| `IActionResult` / `OkResult`     | `ResponseEntity<?>`                      |
| `DbContext` + `DbSet<T>`         | `JpaRepository<T, ID>`                   |
| EF Core `[Key]` `[Required]`     | JPA `@Id` / `@Column(nullable=false)`    |
| LINQ `.Where(...)`               | Spring Data Method Names ou `@Query`     |
| `BCrypt.Net.BCrypt`              | `BCryptPasswordEncoder`                  |
| `JwtBearer` / `IConfiguration`   | `OncePerRequestFilter` + `@Value`        |
| `IHubContext<SlotHub>` SignalR   | `SimpleMessagingTemplate` + STOMP        |
| `MailKit`                        | `JavaMailSender`                         |
| `KeyNotFoundException`           | `NotFoundException` (custom) → 404       |
| `UnauthorizedAccessException`    | `UnauthorizedException` (custom) → 403   |
| `ExceptionMiddleware`            | `@RestControllerAdvice`                  |
| `appsettings.json`               | `application.properties`                 |
| `.csproj` / NuGet                | `pom.xml` / Maven                        |

---

## 🗂️ Endpoints conservés à l'identique

Toutes les URL .NET sont **conservées telles quelles** : le frontend
React (`medsys-web`) fonctionne sans modification. Pointe-le simplement
vers `http://localhost:8082` au lieu du backend .NET.

| Endpoint                                       | Méthode | Auth        |
|------------------------------------------------|---------|-------------|
| `/api/auth/register`                           | POST    | public      |
| `/api/auth/login`                              | POST    | public      |
| `/api/auth/staff`                              | POST    | Secretary   |
| `/api/services`                                | GET     | public      |
| `/api/services/{id}/doctors`                   | GET     | public      |
| `/api/services` `/api/services/{id}` `/assign` | POST/DELETE | Secretary |
| `/api/slots`                                   | POST    | Doctor      |
| `/api/slots/bulk`                              | POST    | Doctor      |
| `/api/slots/{id}/block` `/unblock`             | PATCH   | Doctor      |
| `/api/slots/doctor/{id}/week`                  | GET     | public      |
| `/api/slots/hospital/{id}/week`                | GET     | public      |
| `/api/appointments`                            | POST    | public      |
| `/api/appointments`                            | DELETE  | public+token |
| `/api/appointments`                            | PUT     | auth        |
| `/api/appointments/me`                         | GET     | auth        |
| `/api/waiting-list`                            | POST    | public      |
| `/api/internal/*`                              | GET     | bridge      |
| `/hubs/slots`  (WebSocket / STOMP)             | WS      | public      |

---

## 🧠 Règles métier conservées

1. **Réservation anonyme** : un patient sans compte fournit nom + email + téléphone et reçoit un `anonymousToken` (UUID) à usage unique pour pouvoir annuler.
2. **Pénalité** : 3 annulations cumulées → blocage 7 jours + email automatique.
3. **Liste d'attente** : à chaque libération de créneau, tous les patients inscrits sur la liste d'attente du médecin pour cette semaine sont notifiés par email (une seule fois).
4. **Créneaux hospitaliers** : `DoctorId = NULL` + `ServiceId` rempli (Analyses, Radiologie, Scanner).
5. **Audit** : toutes les actions importantes (réservation, annulation, modification) sont tracées dans `AuditLogs`.

---

## ⚙️ À faire après l'import dans IntelliJ

1. **File → Open** et sélectionner le dossier `appointment-service`.
2. Attendre que Maven télécharge les dépendances.
3. Activer **Lombok** : `Settings → Plugins → Lombok` (devrait déjà être installé).
4. Activer l'**Annotation Processing** : `Settings → Build → Compiler → Annotation Processors → Enable`.
5. Vérifier que Java 21 est utilisé : `Project Structure → Project SDK → 21`.
6. Démarrer XAMPP (Apache n'est pas requis, MySQL suffit) sur le port 3307.
7. Lancer la classe `AppointmentServiceApplication`.
8. Hibernate va créer/mettre à jour les tables automatiquement (`ddl-auto=update`).

---

## 🔐 Sécurité — points d'attention

- ⚠️ Le bridge interne `/api/internal/*` est **sans auth** pour permettre l'appel inter-services. En production, ajouter une clé API ou restreindre au réseau privé.
- ⚠️ Le secret JWT dans `application.properties` doit être **identique** côté .NET (s'ils cohabitent). Sinon, les tokens .NET ne seront pas reconnus.
- ⚠️ Les mots de passe sont stockés en **BCrypt**, compatible avec ceux générés par `BCrypt.Net.BCrypt` côté .NET → les utilisateurs existants peuvent se reconnecter sans réinitialiser.

---

## 🧪 Frontend React

Le frontend `medsys-web` n'a besoin que d'**une seule modification** :
remplacer l'URL de l'API .NET par `http://localhost:8082`.
Cherche `axios.create({ baseURL: ... })` ou la variable d'environnement `VITE_API_URL`.

---

## 📞 Support

Pour toute question sur la migration, consulter le fichier .NET d'origine
dans `medsys-fixed/MedicalAppointments_FINAL/project/ProjectFinal/backend/`
et son équivalent ici.
