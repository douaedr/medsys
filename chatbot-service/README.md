# Chatbot Service - Systeme Hospitalier

Microservice Spring Boot fournissant un assistant virtuel (chatbot) pour les patients
du systeme hospitalier. Utilise **Google Gemini** comme moteur LLM (gratuit).

## Architecture

```
+----------------+       +-------------------+       +------------------+
| patient-service|<------| chatbot-service   |------>| Gemini API       |
| (port 8081)    |       | (port 8083)       |       | (Google AI)      |
+----------------+       +-------------------+       +------------------+
                                  |
                                  v
                         +-------------------+
                         | appointment-service|
                         | (port 8082)       |
                         +-------------------+
```

Le chatbot implemente le pattern **RAG (Retrieval-Augmented Generation)** :
1. Il recoit une question d'un patient
2. Il recupere les donnees reelles du patient via les autres microservices
3. Il enrichit le prompt avec ce contexte
4. Il appelle Gemini pour generer une reponse pertinente et factuelle

## Technologies

- Java 21
- Spring Boot 3.3
- Maven
- RestTemplate (communication HTTP)
- Lombok
- Google Gemini API (gemini-2.0-flash)

## Prerequis

1. **Java 21** installe
2. **Maven 3.8+** installe
3. **Une cle API Gemini** (gratuite)

## Installation

### 1. Obtenir une cle API Gemini (GRATUIT)

1. Aller sur https://aistudio.google.com/app/apikey
2. Se connecter avec un compte Google
3. Cliquer sur "Create API key" -> "Create API key in new project"
4. Copier la cle generee (format : AIzaSy...)

### 2. Configurer la cle

**Option A : Variable d'environnement (RECOMMANDE)**

Dans IntelliJ :
- Run > Edit Configurations
- Dans "Environment variables", ajouter : `GEMINI_API_KEY=AIzaSy...ta_cle...`

**Option B : Directement dans application.properties**

Editer `src/main/resources/application.properties` et remplacer `TA_CLE_API_ICI`
par ta cle. ATTENTION : ne committe jamais ce fichier sur Git avec ta cle !

### 3. Demarrer les autres microservices

```bash
# Dans le dossier patient-service
mvn spring-boot:run

# Dans le dossier appointment-service (si demarre)
mvn spring-boot:run
```

### 4. Demarrer le chatbot-service

```bash
mvn spring-boot:run
```

Le service demarre sur `http://localhost:8083`.

## Endpoints

### POST /api/chatbot/ask

Pose une question au chatbot.

**Body :**
```json
{
  "patientId": 1,
  "question": "Quand est mon prochain rendez-vous ?"
}
```

**Reponse :**
```json
{
  "reponse": "Votre prochain rendez-vous est prevu le 15 mai 2026 a 14h avec le Dr Martin...",
  "timestamp": "2026-04-25T15:30:00",
  "patientId": 1
}
```

### GET /api/chatbot/health

Verifie que le service est demarre.

## Tests

Utilise le fichier `src/test/resources/chatbot-tests.http` avec le client HTTP
integre d'IntelliJ pour tester rapidement les endpoints.

## Configuration des autres microservices

Dans `application.properties` :

```properties
services.patient.url=http://localhost:8081
services.appointment.url=http://localhost:8082
```

Adapte ces URLs si tes microservices tournent sur d'autres ports.

## Endpoints attendus dans les autres services

Le chatbot appelle ces endpoints. Verifie qu'ils existent ou adapte les clients :

**patient-service :**
- `GET /api/patients/{id}` -> infos du patient
- `GET /api/patients/{id}/dossier` -> dossier medical

**appointment-service :**
- `GET /api/rendezvous/patient/{patientId}` -> liste des rendez-vous

## Quotas Gemini (Tier gratuit)

- 15 requetes par minute
- 1500 requetes par jour
- Largement suffisant pour une demonstration ou un PFA

## Troubleshooting

**"La cle API Gemini n'est pas configuree"**
-> Verifier que GEMINI_API_KEY est bien defini ou que la cle est dans application.properties

**"Pas de RDV pour patient X"**
-> Normal si appointment-service n'est pas demarre ou si le patient n'a pas de RDV

**"Connection refused"**
-> Verifier que les autres microservices tournent sur les bons ports

## Auteur

Douae - PFA Systeme de Gestion Hospitaliere
