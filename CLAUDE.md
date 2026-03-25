# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedSys is a hospital management system built as independent microservices:

| Service | Tech | Port | Purpose |
|---|---|---|---|
| `ms-auth` | Java Spring Boot 3.2 + MySQL | 8082 | JWT auth, user accounts, password recovery |
| `ms-patient-personnel` | Java Spring Boot 3.2 + MySQL | 8081 | Patient records, medical dossiers, documents |
| `ms-personnel` | .NET 9 + MongoDB | 5130 | Staff scheduling, teams, absences |
| `medsys-web` | React 18 + Vite | 5173 | Web frontend (staff + patient portal) |
| `medsys-mobile` | React Native + Expo 51 | — | Mobile app for patients |
| `ms-personnel/PersonnelMS_FRONTEND_react` | React 19 + TypeScript + Tailwind | — | Personnel management frontend |

## Running the Project

**Prerequisites:** MySQL running on port 3307 (XAMPP), MongoDB on port 27017.

Start services in order:
1. `ms-patient-personnel` — open in IntelliJ and run. Swagger: http://localhost:8081/swagger-ui.html
2. `ms-auth` — open in IntelliJ and run. Swagger: http://localhost:8082/swagger-ui.html
3. Web frontend:
   ```bash
   cd medsys-web && npm install && npm run dev
   ```
4. Mobile app:
   ```bash
   cd medsys-mobile && npm install && npx expo start
   # Edit src/api/api.js line 5-6: replace 192.168.1.100 with your local IPv4
   ```
5. Personnel management frontend:
   ```bash
   cd ms-personnel/PersonnelMS_FRONTEND_react/PersonnelMSFE/personnelms-app
   npm install && npm run dev
   ```
6. PersonnelMS .NET backend:
   ```bash
   cd "ms-personnel/PersonnelMS - Backend_API_et_MongoDB/PersonnelMS - Copy (2)/PersonnelMS"
   dotnet run
   ```

## Build Commands

**Java (Maven) — ms-auth and ms-patient-personnel:**
```bash
./mvnw clean package          # build JAR
./mvnw test                   # run all tests
./mvnw test -Dtest=ClassName  # run single test class
```

**React frontends:**
```bash
npm run dev      # development server
npm run build    # production build
npm run lint     # lint (personnel frontend only)
npm run preview  # preview production build
```

**.NET (ms-personnel):**
```bash
dotnet build
dotnet test
dotnet run
```

## Architecture

### Authentication Flow
1. Client logs in via `ms-auth` → receives JWT (valid 24h) + refresh token (7 days)
2. JWT stored in browser `sessionStorage`
3. Every subsequent request includes `Authorization: Bearer <token>`
4. Each backend service validates the JWT independently using the shared secret in `application.yml`

There is no API gateway. The `medsys-web` Vite dev server proxies requests:
- `/api/v1/patients`, `/api/v1/patient`, `/api/v1/directeur` → http://localhost:8081
- `/api` (all other) → http://localhost:8082

### User Roles
`PATIENT`, `MEDECIN`, `PERSONNEL`, `ADMIN`, `DIRECTEUR` — defined in `ms-auth/src/main/java/.../Role.java`. Role is embedded in the JWT and checked via Spring Security annotations.

### Inter-Service Communication
- `ms-patient-personnel` optionally calls an `ms-rdv` service (appointment system) via `RdvProxyService.java`. Configure with `MS_RDV_URL` env var; gracefully degrades if unavailable.
- `ms-auth` syncs user data to `ms-patient-personnel` at `ms-patient.url: http://localhost:8081`.

### Databases
- MySQL databases (`ms_auth_db`, `ms_patient_db`) are auto-created by Hibernate (`ddl-auto: update`)
- Both MySQL services use port **3307** (not default 3306)
- MongoDB (`PersonnelDB`) must be created manually

### Key Backend Patterns (Java services)
- Spring Security filter chain with `JwtAuthFilter` on every request
- `ms-patient-personnel` handles file uploads (max 10MB) stored at `uploads/patients/`
- PDF export via OpenPDF, QR code generation via Google ZXing
- Services use `RestTemplate` for inter-service calls (no Feign/WebClient)

### medsys-web Structure
React SPA with role-based routing. Entry point: `src/main.jsx`. Routes split by role — patient portal vs. staff dashboard vs. admin/director views.

## Database Setup (first run)

Create admin account via Swagger at http://localhost:8082/swagger-ui.html:
```
POST /api/v1/auth/register-admin
```

Create doctors/staff (as admin):
```
POST /api/v1/admin/personnel
{ "email": "...", "password": "...", "nom": "...", "prenom": "...", "role": "MEDECIN" }
```

Patient self-registration: http://localhost:5173/patient → S'inscrire (6-step form)

## Email Configuration

For password recovery, configure SMTP in `ms-auth/src/main/resources/application.yml`:
```yaml
spring.mail.username: your@gmail.com
spring.mail.password: <Google App Password>
```
