# ms-auth — Tests des endpoints

> Pré-requis : ms-auth en cours d'exécution sur http://localhost:8082

---

## 1. Register (création compte patient)

```bash
curl -s -X POST http://localhost:8082/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient.test@gmail.com",
    "password": "Test1234!",
    "nom": "Dupont",
    "prenom": "Jean",
    "cin": "BE123456",
    "telephone": "0612345678",
    "dateNaissance": "1990-01-15",
    "sexe": "MASCULIN",
    "adresse": "12 Rue des Roses",
    "ville": "Casablanca",
    "groupeSanguin": "A_PLUS"
  }' | python3 -m json.tool
```

**Réponse attendue (201) :**
```json
{
  "token": "eyJ...",
  "role": "PATIENT",
  "email": "patient.test@gmail.com",
  "nom": "Dupont",
  "prenom": "Jean"
}
```

---

## 2. Login

```bash
curl -s -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient.test@gmail.com",
    "password": "Test1234!"
  }' | python3 -m json.tool
```

**Réponse attendue (200) :**
```json
{
  "token": "eyJ...",
  "refreshToken": "eyJ...",
  "role": "PATIENT",
  "email": "patient.test@gmail.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "patientId": 1
}
```

> Copiez la valeur de `token` et utilisez-la dans la variable TOKEN ci-dessous.

---

## 3. Get profile (/me)

```bash
TOKEN="eyJ..."   # <-- coller le token obtenu au login

curl -s http://localhost:8082/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Réponse attendue (200) :**
```json
{
  "email": "patient.test@gmail.com",
  "authorities": [{"authority": "ROLE_PATIENT"}]
}
```

---

## 4. Forgot password

```bash
curl -s -X POST http://localhost:8082/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "patient.test@gmail.com"}' | python3 -m json.tool
```

**Réponse attendue (200) :**
```json
{
  "message": "Email de réinitialisation envoyé si le compte existe."
}
```

---

## 5. Health check

```bash
curl -s http://localhost:8082/actuator/health | python3 -m json.tool
```

**Réponse attendue :**
```json
{"status": "UP"}
```

---

## 6. Vérifier un token JWT

```bash
curl -s "http://localhost:8082/api/v1/auth/verify?token=$TOKEN" | python3 -m json.tool
```
