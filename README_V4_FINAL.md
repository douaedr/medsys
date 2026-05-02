# 🛠️ MedSys Fixes V4-FINAL — Tout en un seul zip

## 🎯 Ce que contient ce zip

### V4-A — Bugs critiques (déjà inclus)
- ✅ Page blanche après inscription patient
- ✅ Recherche patients backend (debounce 400ms)
- ✅ Modifier mot de passe (page profil)
- ✅ Modifier email (avec endpoint backend)
- ✅ Modifier infos perso (téléphone, adresse, ville, mutuelle, CNSS)
- ✅ Sélecteur médecin par nom (dropdown au lieu d'email)
- ✅ Messages s'envoient (format JSON corrigé)
- ✅ Endpoint `/api/v1/medecins` accessible aux patients
- ✅ Onglets fonctionnels dans tous les dashboards
- ✅ Rôle SECRETARY ajouté partout
- ✅ Chatbot : salutations rapides + retry + meilleur prompt

### V4-B — Notifications temps réel + Documents
- ✅ **WebSocket + STOMP** : notifications poussées en temps réel
- ✅ **RabbitMQ déjà en place** : on a juste créé le pont vers WebSocket
- ✅ **Cloche de notifications** dans le Topbar avec badge + dropdown
- ✅ **Notifications navigateur** (avec permission)
- ✅ **Onglet "Mes documents"** : upload PDF/images + liste + télécharger + supprimer

### V4-C — Diagrammes UML
- ✅ 5 diagrammes PlantUML (architecture, séquence RAG, séquence WebSocket, classes, use cases)
- ➡️ À convertir en PNG avec [PlantUML online](http://www.plantuml.com/plantuml/uml) ou IntelliJ plugin PlantUML

---

## ⚠️ PRÉ-REQUIS AVANT INSTALLATION

### 1. RabbitMQ doit tourner

⚠️ **NOUVELLE EXIGENCE** : tu as dit que RabbitMQ est installé. Il doit être **démarré** avant les microservices.

Vérifier :
```powershell
# Méthode 1 - Via le service Windows
sc query RabbitMQ

# Méthode 2 - Vérifier que le port 5672 répond
netstat -ano | findstr :5672
```

Si pas démarré :
```powershell
# Démarrer comme administrateur
sc start RabbitMQ
```

Ou via le menu Start → "RabbitMQ Service - start".

L'interface admin (optionnelle) : http://localhost:15672 (login: guest / guest)

### 2. MySQL XAMPP démarré (port 3307)

### 3. npm install pour les nouvelles dépendances

⚠️ **OBLIGATOIRE** : 2 nouvelles libs React (`@stomp/stompjs` + `sockjs-client`).

---

## 🚀 Application en 6 étapes

### Étape 1 — Décompresser et copier (2 min)

```powershell
cd C:\Users\douae\Desktop\PFA
Expand-Archive -Path "medsys-fixes-v4-final.zip" -DestinationPath "medsys-fixes-v4-final" -Force
Copy-Item -Path "medsys-fixes-v4-final\modified-files\*" -Destination "medsys-fixed" -Recurse -Force
```

### Étape 2 — Vérifier la copie (30 sec)

```powershell
# Backend WebSocket
ls medsys-fixed\ms-patient-personnel\src\main\java\com\hospital\patient\config\WebSocketConfig.java
ls medsys-fixed\ms-patient-personnel\src\main\java\com\hospital\patient\websocket\WebSocketNotificationListener.java

# Frontend
ls medsys-fixed\medsys-web\src\hooks\useNotifications.js
ls medsys-fixed\medsys-web\src\components\shared\NotificationBell.jsx

# Diagrammes
ls medsys-fixed\diagrammes\
```

✅ Tout doit exister.

### Étape 3 — Installer les nouvelles dépendances frontend (3 min)

⚠️ **OBLIGATOIRE** : sans ça, le hook useNotifications va planter.

```powershell
cd medsys-fixed\medsys-web
npm install
```

⏳ Attends que ça finisse (peut prendre 1-2 min).

Tu dois voir dans la console quelque chose comme :
```
added 4 packages, audited 250 packages in 30s
```

### Étape 4 — Démarrer RabbitMQ (1 min)

⚠️ **CRITIQUE** : le ms-patient-personnel ne démarrera plus si RabbitMQ n'est pas accessible (on a réactivé le health check).

```powershell
# En tant qu'administrateur
sc start RabbitMQ
```

Vérifier que ça tourne :
```powershell
netstat -ano | findstr :5672
```

Doit afficher quelque chose comme :
```
TCP    0.0.0.0:5672    0.0.0.0:0    LISTENING    1234
```

Si tu as l'interface admin activée : http://localhost:15672 (guest/guest)

### Étape 5 — Redémarrer les microservices Spring Boot (5 min)

⚠️ Plusieurs microservices ont changé. Dans IntelliJ, **arrête puis redémarre** :

1. **ms-auth** (8082) — change-email ajouté
2. **ms-patient-personnel** (8081) — WebSocket + nouveaux endpoints
3. **chatbot-service** (8083) — chatbot amélioré

⚠️ **NE PAS toucher** appointment-service (pas modifié).

⚠️ **IMPORTANT** : pour ms-patient-personnel, vérifie dans la console au démarrage :
```
... Started MsPatientPersonnelApplication in X seconds
```

Si tu vois une erreur RabbitMQ → retour étape 4.

### Étape 6 — Redémarrer le frontend (2 min)

```powershell
# Dans le terminal où npm run dev tourne
# Appuie Ctrl + C pour arrêter

# Puis relance
cd C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web
npm run dev
```

✅ Frontend prêt.

---

## 🧪 Tests à faire (20 min)

### Test 1 — Login + onglets sidebar fonctionnels
1. Login patient (`patient@medsys.ma` / `Patient1234!`)
2. ✅ Tu vois la sidebar avec **6 onglets** : Tableau de bord / Mon dossier / Mes RDV / Messagerie / **Mes documents** / Mon profil
3. Clique chaque onglet → contenu différent à chaque fois ✓

### Test 2 — Cloche notifications (en haut à droite)
1. Sur le dashboard patient, regarde le Topbar
2. ✅ Tu dois voir une **cloche** 🔔 en haut à droite
3. Petit indicateur :
   - 🟢 vert = WebSocket connecté
   - ⚪ gris = WebSocket déconnecté
4. Si déconnecté → vérifier console navigateur (F12) pour le message d'erreur

### Test 3 — Upload de document
1. Patient → onglet **Mes documents**
2. Sélectionne type "Ordonnance"
3. Description : "Test"
4. Choisis un PDF ou une image (< 5 MB)
5. Clique **Uploader**
6. ✅ Message vert "Document uploadé avec succès"
7. ✅ Le document apparaît dans la liste en dessous
8. Clique l'icône Download → ✅ il s'ouvre/télécharge
9. Clique l'icône Trash → ✅ il disparaît

### Test 4 — Modif mot de passe
1. Patient → **Mon profil** → carte "Modifier mon mot de passe"
2. Ancien : `Patient1234!`
3. Nouveau : `Test1234!` × 2
4. ✅ Message vert "Modifié avec succès"
5. Déconnecte-toi, reconnecte avec `Test1234!` ✓

### Test 5 — Modif email
1. Patient → **Mon profil** → carte "Modifier mon email"
2. Nouvel email : `nouveau@test.ma`
3. Mot de passe : (le tien actuel)
4. ✅ Message vert + déconnexion auto après 3 sec
5. Reconnecte avec `nouveau@test.ma` ✓

### Test 6 — Recherche patients (médecin)
1. Login `medecin@medsys.ma` / `Medecin1234!`
2. Onglet **Patients**
3. Tape un nom dans la barre de recherche → liste filtrée après 400ms ✓

### Test 7 — Notifications WebSocket TEMPS RÉEL ⭐ (le test ultime)

**Setup** :
- Ouvre **2 onglets de navigateur** :
  - Onglet 1 : Login patient (`patient@medsys.ma`) → reste sur dashboard
  - Onglet 2 : Login médecin ou secrétaire

**Action** :
- Dans onglet 2 (médecin/secrétaire), crée un RDV pour le patient connecté dans onglet 1
  (ou modifie un RDV existant pour déclencher un event)

**Résultat attendu** :
- Onglet 1 : la cloche se met à jour **automatiquement** (badge +1)
- Notification du navigateur peut apparaître (si tu as autorisé)
- Cliquer la cloche → la notif apparaît dans le dropdown

⚠️ **Si ça ne marche pas** :
- Vérifie console navigateur (F12) → cherche `[WS] Connected` et `[WS] Subscribed`
- Vérifie console IntelliJ ms-patient-personnel → cherche `[WS] Pushing notification`
- Vérifie que RabbitMQ tourne
- Vérifie qu'appointment-service publie bien dans la queue (logs)

### Test 8 — Chatbot
1. Patient → ChatBot bas-droite
2. Tape "bonjour" → ✅ réponse instantanée (sans Gemini)
3. Tape "Quel est mon groupe sanguin ?" → Gemini répond avec les vraies données

---

## 🆘 Troubleshooting

### "ms-patient-personnel ne démarre pas"
- **Cause** : RabbitMQ pas démarré
- **Solution** : `sc start RabbitMQ` ou désactiver health check dans `application.yml` :
  ```yaml
  management:
    health:
      rabbit:
        enabled: false
  ```

### "Erreur Cannot find module '@stomp/stompjs'"
- **Cause** : npm install pas fait
- **Solution** : `cd medsys-web && npm install`

### "WebSocket ne se connecte pas (cloche grise)"
- **Cause 1** : ms-patient-personnel pas démarré → vérifier port 8081
- **Cause 2** : CORS bloque → vérifier que `setAllowedOriginPatterns` est dans SecurityConfig
- **Cause 3** : SockJS endpoint /ws bloqué → vérifier que `/ws/**` est dans permitAll

### "Le RDV créé ne déclenche pas de notif"
- **Cause** : appointment-service ne publie pas dans la queue, OU les exchanges/queues ne sont pas créés
- **Solution 1** : Vérifier dans http://localhost:15672 (admin RabbitMQ) que les exchanges existent
- **Solution 2** : Tester en publiant manuellement un message dans `patient.notification.queue` via l'interface admin RabbitMQ

### "Upload document : 401 Unauthorized"
- **Cause** : token JWT expiré
- **Solution** : déconnecter/reconnecter le patient

### "Page blanche complète après login"
- **Cause** : erreur JavaScript dans une page modifiée
- **Solution** : F12 → Console → copier l'erreur → me la donner

---

## 📊 Diagrammes (V4-C)

Dans `diagrammes/` tu trouveras 5 fichiers `.puml` :

1. **01-architecture-microservices.puml** — Vue d'ensemble (parfait pour intro du rapport)
2. **02-sequence-rag-chatbot.puml** — Séquence RAG (parfait pour partie chatbot)
3. **03-sequence-websocket-notifications.puml** — Séquence WebSocket (parfait pour partie temps réel)
4. **04-class-diagram.puml** — Classes principales (parfait pour partie conception)
5. **05-use-cases.puml** — Cas d'utilisation (parfait pour partie analyse)

### Comment les générer en PNG/SVG ?

**Option A — En ligne (le plus simple)** :
1. Va sur http://www.plantuml.com/plantuml/uml/
2. Copie-colle le contenu d'un .puml
3. Télécharge en PNG/SVG

**Option B — Plugin IntelliJ** :
1. Settings → Plugins → installer "PlantUML Integration"
2. Ouvre un .puml dans IntelliJ
3. Aperçu auto + export PNG

**Option C — VS Code** :
1. Installer extension "PlantUML"
2. Ouvre un .puml + Alt+D pour preview
3. Clic droit → Export

### Pour ton rapport LaTeX

Insère les images générées :
```latex
\begin{figure}[h]
  \centering
  \includegraphics[width=\textwidth]{images/01-architecture-microservices.png}
  \caption{Architecture microservices de MedSys}
  \label{fig:archi}
\end{figure}
```

---

## 📝 Pour la soutenance

Tes **3 différenciateurs** à mettre en avant :

1. ⭐ **Architecture microservices propre** (4 services + RabbitMQ + WebSocket)
2. ⭐ **Chatbot IA avec RAG** (récupération de contexte médical en temps réel + Gemini)
3. ⭐ **Notifications temps réel** (RabbitMQ → WebSocket → Frontend)

Ces 3 points montrent une **compréhension des architectures modernes** (vs un simple CRUD).

🚀 **Bonne chance Douae !** Le plus dur est derrière toi.
