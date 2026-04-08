# ms-patient-personnel — Tests des endpoints

> Pré-requis :
> - ms-auth (port 8082) ET ms-patient-personnel (port 8081) en cours d'exécution
> - Avoir obtenu un TOKEN via le login (voir ms-auth/TEST_ENDPOINTS.md)

```bash
TOKEN="eyJ..."   # <-- token obtenu après login dans ms-auth
```

---

## 1. Health check

```bash
curl -s http://localhost:8081/actuator/health | python3 -m json.tool
```

---

## 2. Profil patient connecté (GET /patient/me)

```bash
curl -s http://localhost:8081/api/v1/patient/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Réponse attendue (200) :**
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "patient.test@gmail.com",
  "cin": "BE123456",
  "telephone": "0612345678",
  "dateNaissance": "1990-01-15"
}
```

---

## 3. Dossier médical du patient connecté

```bash
curl -s http://localhost:8081/api/v1/patient/me/dossier \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 4. Notifications du patient

```bash
curl -s http://localhost:8081/api/v1/patient/me/notifications \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 5. Mise à jour du profil (PATCH)

```bash
curl -s -X PATCH http://localhost:8081/api/v1/patient/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "0699887766",
    "ville": "Rabat"
  }' | python3 -m json.tool
```

---

## 6. Liste de tous les patients (rôle MEDECIN/ADMIN/DIRECTEUR requis)

```bash
curl -s http://localhost:8081/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 7. Statistiques directeur

```bash
curl -s http://localhost:8081/api/v1/directeur/stats \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 8. Export PDF du dossier (télécharge un fichier)

```bash
curl -s http://localhost:8081/api/v1/patient/me/dossier/pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output dossier_patient.pdf
echo "PDF sauvegardé : dossier_patient.pdf"
```

---

## 9. Messages du patient

```bash
curl -s http://localhost:8081/api/v1/patient/me/messages \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 10. Rendez-vous du patient

```bash
curl -s http://localhost:8081/api/v1/patient/me/rdv \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```
