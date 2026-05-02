# 🛠️ Fixes MedSys — Guide d'application

Ce zip contient **tous les fichiers à remplacer** dans ton projet MedSys pour corriger les 5 bugs critiques détectés.

---

## ⚠️ AVANT DE COMMENCER

1. **Fais une sauvegarde** de ton projet actuel (au cas où) :
   ```powershell
   # Dans PowerShell
   Compress-Archive -Path "C:\Users\douae\Desktop\PFA\medsys-fixed" -DestinationPath "C:\Users\douae\Desktop\PFA\backup-medsys-$(Get-Date -Format 'yyyyMMdd-HHmm').zip"
   ```

2. **Arrête tous tes microservices** dans IntelliJ avant de remplacer les fichiers.

3. **Garde ce README ouvert** pour suivre l'ordre des étapes.

---

## 📋 Liste des fichiers modifiés (10 fichiers)

| # | Fichier original | Modification |
|---|---|---|
| 1 | `appointment-service/src/main/resources/application.properties` | Port 8082 → **8085** + secret JWT aligné |
| 2 | `chatbot-service/src/main/resources/application.properties` | URL appointment-service → **8085** |
| 3 | `chatbot-service/src/main/java/com/hospital/chatbot/controller/ChatbotController.java` | Préfixe `/api/chatbot` → `/api/v1/chatbot` |
| 4 | `ms-patient-personnel/src/main/resources/application.yml` | `ms-rdv.url` configuré sur 8085 |
| 5 | `medsys-web/vite.config.js` | Proxies ajoutés pour chatbot et appointment-service |
| 6 | `medsys-web/src/api/api.js` | Ajout de `chatbotApi` |
| 7 | `medsys-web/src/pages/PersonnelLoginPage.jsx` | Fix du format de réponse (objet plat) |
| 8 | `medsys-web/src/pages/patient/PatientDashboard.jsx` | Intégration du composant `<ChatBot />` |
| 9 | `medsys-web/src/components/shared/ChatBot.jsx` | **NOUVEAU** composant chatbot flottant |
| 10 | `.gitignore` (racine) | Ignore les fichiers de config avec clés |

---

## 🚀 Application étape par étape

### Étape 1 — Remplacer les fichiers (5 min)

Dans le dossier `modified-files/`, tu trouveras la même arborescence que ton projet. Il suffit de **copier-coller chaque fichier** par-dessus l'ancien.

**Commande PowerShell rapide** (à adapter à ton chemin) :
```powershell
# Définir les chemins
$src = "C:\chemin\vers\medsys-fixes\modified-files"
$dst = "C:\Users\douae\Desktop\PFA\medsys-fixed"

# Copier en écrasant
Copy-Item -Path "$src\*" -Destination $dst -Recurse -Force
```

**Ou manuellement** : ouvre les deux dossiers côte à côte dans l'explorateur Windows et glisse-dépose chaque fichier.

⚠️ **Le `.gitignore` racine** : si tu as déjà un `.gitignore`, copie son contenu actuel et ajoute le contenu du nouveau dedans (ne pas écraser sans lire).

⚠️ **ChatBot.jsx est NOUVEAU** — il sera créé, pas remplacé. Vérifie que le dossier `medsys-web/src/components/shared/` existe.

---

### Étape 2 — Récréer la base ms_appointment_db (5 min)

Comme on a changé le secret JWT de l'appointment-service, **les anciens utilisateurs (créés avec l'ancien secret) ne fonctionneront plus**.

**Option A** (simple) — Supprimer la BDD et la laisser se recréer vide :
```sql
-- Dans phpMyAdmin ou Antares
DROP DATABASE IF EXISTS ms_appointment_db;
```
Hibernate la recréera automatiquement au prochain démarrage de appointment-service.

**Option B** — Garder les RDV mais re-créer les utilisateurs côté ms-auth (les utilisateurs sont gérés par ms-auth maintenant, pas par appointment-service en théorie).

---

### Étape 3 — Démarrer les microservices dans le BON ordre (10 min)

```
1. MySQL XAMPP (port 3307) → start
2. ms-auth (port 8082) → IntelliJ ▶️
3. ms-patient-personnel (port 8081) → IntelliJ ▶️
4. appointment-service (port 8085) → IntelliJ ▶️
5. chatbot-service (port 8083) → IntelliJ ▶️
6. Frontend : cd medsys-web && npm run dev (port 5173)
```

⚠️ **Ne PAS démarrer** : ms-personnel (.NET), ms-document-ai (Python), ms-notify, api-gateway pour la démo de base.

---

### Étape 4 — Tester chaque microservice individuellement (15 min)

**ms-auth** : http://localhost:8082/swagger-ui.html → tu devrais voir Swagger
**ms-patient-personnel** : http://localhost:8081/swagger-ui.html
**appointment-service** : http://localhost:8085/swagger
**chatbot-service** : http://localhost:8083/api/v1/chatbot/health → doit renvoyer "Chatbot service is running OK"

Si l'un ne démarre pas, regarde les logs IntelliJ et envoie-moi l'erreur.

---

### Étape 5 — Tester le frontend (15 min)

1. Ouvre http://localhost:5173
2. Va sur la page Patient ou Personnel
3. Crée un compte ou connecte-toi avec un compte existant
4. Le dashboard doit s'afficher
5. **Test du chatbot** : en bas à droite, tu vois un bouton bleu/violet flottant. Clique dessus, pose la question "Quel est mon groupe sanguin ?"

---

## 🔐 Sécurité avant push GitHub (IMPORTANT — à faire avant `git push`)

### A) Crée tes vrais fichiers application.properties depuis les templates

Les templates de sécurité sont dans `security-templates/`. Pour chaque microservice :

```powershell
# Exemple pour chatbot-service
cd chatbot-service\src\main\resources
copy application.properties application.properties.example
notepad application.properties.example
# → Remplace ta vraie clé Gemini par "YOUR_GEMINI_API_KEY_HERE"
```

### B) Vérifie que le .gitignore exclut bien les vrais fichiers
```bash
cd C:\Users\douae\Desktop\PFA\medsys-fixed
git check-ignore -v ms-auth/src/main/resources/application.yml
# Doit afficher: .gitignore:5:**/src/main/resources/application.yml
```

### C) Si tu as DÉJÀ commit ta clé Gemini
Tu dois **révoquer la clé** sur https://aistudio.google.com/app/apikey ET nettoyer l'historique Git :
```bash
# Solution simple : supprimer le fichier du dépôt mais garder localement
git rm --cached chatbot-service/src/main/resources/application.properties
git commit -m "chore: remove application.properties (now in .gitignore)"
git push
```
Puis crée une nouvelle clé Gemini et mets-la dans ton fichier local.

---

## 🆘 En cas de problème

Si après les fixes ça ne marche toujours pas, donne-moi :
1. **Quel microservice plante** (lequel ne démarre pas / quelle erreur dans la console)
2. **Quel test échoue** (login ? dashboard ? chatbot ?)
3. **Le message d'erreur exact** (capture d'écran ou copier-coller)

Et on debug ensemble ✊

---

## ✅ Checklist finale

- [ ] Sauvegarde du projet faite
- [ ] Tous les microservices arrêtés avant remplacement
- [ ] Les 10 fichiers copiés
- [ ] BDD ms_appointment_db supprimée (Option A)
- [ ] Tous les microservices critiques redémarrés
- [ ] Login Patient OK
- [ ] Login Personnel OK
- [ ] Chatbot répond correctement
- [ ] (Avant push GitHub) clés sécurisées + .gitignore actif

Bonne chance ! Tu touches au but 💪🚀
