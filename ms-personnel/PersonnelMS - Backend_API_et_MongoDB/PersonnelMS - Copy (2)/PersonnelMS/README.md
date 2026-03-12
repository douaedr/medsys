# PersonnelMS – API de gestion du personnel hospitalier

API REST de gestion du personnel, des équipes, plannings, créneaux, absences et demandes de modification. Projet .NET 9 avec MongoDB.

## Prérequis

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [MongoDB](https://www.mongodb.com/try/download/community) (local ou distant)

## Configuration

### Variables d'environnement (recommandé en production)

La chaîne de connexion MongoDB peut être surchargée via la configuration :

- `MongoDB__ConnectionURI` : URI de connexion (ex. `mongodb://localhost:27017`)
- `MongoDB__DatabaseName` : Nom de la base (ex. `PersonnelDB`)

Sous Windows (PowerShell) :

```powershell
$env:MongoDB__ConnectionURI = "mongodb://localhost:27017"
$env:MongoDB__DatabaseName = "PersonnelDB"
```

Sous Linux/macOS :

```bash
export MongoDB__ConnectionURI="mongodb://localhost:27017"
export MongoDB__DatabaseName="PersonnelDB"
```

### Fichier de configuration

Les valeurs par défaut sont dans `appsettings.json` (section `MongoDB`). En développement, `appsettings.Development.json` peut les surcharger.

## Lancement

```bash
dotnet run
```

L’API écoute sur `https://localhost:5xxx` (ou le port configuré). Swagger est disponible en développement à `/swagger`.

## Utilisation de l’API

### Pagination et tri (listes)

Les endpoints de liste supportent la pagination et le tri :

- `page` : numéro de page (défaut : 1)
- `taillePage` : nombre d’éléments par page (défaut : 20, max : 100)
- `trierPar` : propriété de tri (dépend du contrôleur)
- `ordreTri` : `asc` ou `desc`

Exemple : `GET /api/Personnel?page=1&taillePage=10&trierPar=nom&ordreTri=asc`

La réponse est de la forme :

```json
{
  "items": [ ... ],
  "page": 1,
  "taillePage": 10,
  "total": 42,
  "totalPages": 5
}
```

### Rapports

- `GET /api/rapports/effectif-par-service` : effectif par service (équipes gérées par un chef de service)
- `GET /api/rapports/absences-par-mois?annee=2025` : absences par mois et par type
- `GET /api/rapports/taux-occupation?equipeId=...&dateDebut=...&dateFin=...` : taux d’occupation des créneaux
- `GET /api/rapports/repartition-statut` : répartition des personnels par statut
- `GET /api/rapports/demandes-en-attente?chefServiceId=...` : demandes (absences et modifications) en attente

### Principaux endpoints

- **Personnel** : `GET/POST /api/Personnel`, `GET/PUT/DELETE /api/Personnel/{id}`
- **Équipes** : `GET/POST /api/Equipes`, `GET/PUT/DELETE /api/Equipes/{id}`
- **Plannings** : `GET/POST /api/Plannings`, transitions : `POST .../en-validation`, `.../valider`, `.../publier`, `.../archiver`
- **Créneaux** : `GET/POST /api/Creneaux`, affectation : `POST /api/Creneaux/{id}/affecter`, FSM : `.../confirmer`, `.../commencer`, `.../terminer`, `.../annuler`
- **Absences** : `GET/POST /api/absences`, `POST .../approuver`, `.../refuser`, `.../annuler`
- **Demandes de modification** : `GET/POST /api/demandes-modification`, `POST .../approuver`, `.../rejeter`
- **Disponibilités** : `GET/POST /api/disponibilites`

Les actions sensibles (validation, publication, affectation, etc.) exigent un corps de requête contenant l’identifiant de l’utilisateur effectuant l’action (simulation d’authentification).

## Journalisation

Les logs sont écrits dans la console et dans des fichiers tournants sous `logs/` (préfixe `hospital-`, un fichier par jour). Les erreurs et les actions importantes sont tracées avec des propriétés structurées.

## Déploiement

1. Publier l’application : `dotnet publish -c Release -o ./publish`
2. Configurer les variables d’environnement (connexion MongoDB, etc.).
3. Exécuter : `./publish/PersonnelMS` (ou via un conteneur / hébergeur).

Pour un déploiement en conteneur, un `Dockerfile` peut être ajouté pour construire une image à partir du projet .NET et exposer le port HTTP configuré.

## Codes HTTP et erreurs

L’API renvoie des réponses au format Problem Details (RFC 7807) en cas d’erreur :

- **400** : Requête invalide (règle métier, transition non autorisée)
- **403** : Accès interdit (habilitation)
- **404** : Ressource introuvable
- **409** : Conflit (ex. chevauchement, couverture insuffisante)
- **500** : Erreur interne

## Licence

Projet à usage interne / formation.
