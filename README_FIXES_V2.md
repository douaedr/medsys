# 🛠️ Fixes MedSys V2 — Onglets fonctionnels + SECRETARY

Ce zip corrige **2 nouveaux problèmes critiques** :

1. **Le rôle SECRETARY n'était dans aucune route autorisée** → la secrétaire était redirigée vers l'accueil
2. **Les onglets de la sidebar (Utilisateurs, Personnel, Patients, etc.) n'étaient pas fonctionnels** → les clics ne faisaient rien

---

## 📋 Fichiers à remplacer (7 fichiers)

| # | Fichier | Modification |
|---|---|---|
| 1 | `medsys-web/src/App.jsx` | Ajout de `SECRETARY` dans `allowedRoles` |
| 2 | `medsys-web/src/pages/PersonnelLoginPage.jsx` | Redirection SECRETARY ajoutée |
| 3 | `medsys-web/src/lib/useTab.js` | **NOUVEAU** — hook pour gérer les onglets via URL |
| 4 | `medsys-web/src/pages/admin/AdminDashboard.jsx` | 4 onglets fonctionnels (Tableau de bord / Utilisateurs / Personnel / Paramètres) |
| 5 | `medsys-web/src/pages/directeur/DirecteurDashboard.jsx` | 5 onglets (Tableau de bord / Statistiques / Patients / Médecins / Rapports) |
| 6 | `medsys-web/src/pages/personnel/PersonnelDashboard.jsx` | 4 onglets + bouton "Nouveau patient" fonctionnel + bouton "Voir" patient avec modal |
| 7 | `medsys-web/src/pages/patient/PatientDashboard.jsx` | 4 onglets (Tableau de bord / Mon dossier / Mes RDV / Messagerie) + chatbot |

---

## 🚀 Application des fixes (3 minutes)

### Étape 1 — Décompresser

Dans **PowerShell** :
```powershell
cd C:\Users\douae\Desktop\PFA
Expand-Archive -Path "medsys-fixes-v2.zip" -DestinationPath "medsys-fixes-v2" -Force
```

### Étape 2 — Copier les fichiers

```powershell
Copy-Item -Path "medsys-fixes-v2\modified-files\*" -Destination "medsys-fixed" -Recurse -Force
```

### Étape 3 — Vérifier

Ces commandes doivent toutes renvoyer un fichier ou son contenu :
```powershell
ls medsys-fixed\medsys-web\src\lib\useTab.js
ls medsys-fixed\medsys-web\src\pages\admin\AdminDashboard.jsx
```

### Étape 4 — Redémarrer le frontend

Si `npm run dev` tourne dans un terminal, **arrête-le** (Ctrl+C) et relance :
```powershell
cd medsys-fixed\medsys-web
npm run dev
```

⚠️ **Pas besoin de redémarrer les microservices Spring Boot** — seul le frontend a changé.

---

## ✅ Tests à faire après application

### Test 1 — Login Secrétaire
1. http://localhost:5173 → Personnel
2. `secretaire@medsys.ma` / `Secretaire1234!`
3. ✅ Tu dois arriver sur le dashboard personnel (pas l'accueil)

### Test 2 — Onglets Admin
1. Connecte-toi en admin
2. Clique sur **Utilisateurs** → ✅ tu vois la liste de tous les utilisateurs
3. Clique sur **Personnel** → ✅ tu vois seulement les médecins/personnel/secrétaires
4. Clique sur **Paramètres** → ✅ tu vois les infos système
5. Clique sur **Tableau de bord** → ✅ retour au dashboard avec stats

### Test 3 — Onglets Directeur
1. Connecte-toi en directeur (`directeur@medsys.ma` / `Directeur1234!`)
2. Tous les onglets doivent fonctionner :
   - Tableau de bord (graphiques)
   - Statistiques (pie chart + ligne)
   - Patients (liste avec recherche)
   - Médecins (cards)
   - Rapports (génération PDF — placeholder)

### Test 4 — Onglets Personnel/Médecin
1. Connecte-toi en médecin (`medecin@medsys.ma` / `Medecin1234!`)
2. Onglet **Patients** → clique **Nouveau patient** → ✅ formulaire s'affiche
3. Remplis et soumets → ✅ patient créé
4. Clique sur l'icône 👁️ d'un patient → ✅ modal avec son dossier s'ouvre
5. Onglet **Consultations**, **Rendez-vous** → ✅ pages s'affichent

### Test 5 — Onglets Patient
1. Connecte-toi en patient (`patient@medsys.ma` / `Patient1234!`)
2. Tous les onglets doivent fonctionner :
   - Tableau de bord
   - Mon dossier (informations + antécédents + consultations + ordonnances)
   - Mes rendez-vous (avec bouton annuler)
   - Messagerie (envoyer/recevoir)
3. Le **chatbot** doit toujours être visible en bas à droite ✨

---

## 🆘 En cas de problème

Si après les fixes ça plante :

1. **Erreur "Cannot find module '../../lib/useTab'"** → le fichier `useTab.js` n'a pas été copié
2. **Page blanche** → ouvre la console du navigateur (F12) et copie-moi l'erreur
3. **Navigation vers accueil au lieu du dashboard** → vérifie que `App.jsx` a bien été remplacé (cherche la ligne `allowedRoles={['MEDECIN', 'PERSONNEL', 'SECRETARY']}`)

---

## 📝 Notes

- Les onglets utilisent maintenant le **paramètre `?tab=...` de l'URL**, ce qui permet :
  - De partager des liens directs (ex: `/admin?tab=users`)
  - D'utiliser les **flèches du navigateur** (back/forward)
  - De **rafraîchir la page** sans perdre l'onglet actif

- Les sections **Consultations** et **Rapports** affichent des placeholders pour l'instant. Tu peux les améliorer plus tard si tu as le temps.

🚀 **Bon courage Douae !**
