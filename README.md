# Academic Migration API (MVP)

API backend (MVP) orientada a **procesos de migración y estructuración de datos académicos** hacia una base de datos **NoSQL (MongoDB)**.  
Incluye modelado con **Mongoose**, validación de payloads con **Zod** y ejemplos listos para usar en `docs/examples`.

> **Estado:** ✅ MVP funcional (en progreso)  
> **Próximos pasos:** bulk import (carga masiva con validación por fila), Swagger/OpenAPI y tests.

---

## Contenido
- [Qué incluye hoy](#qué-incluye-hoy)
- [Stack](#stack)
- [Requisitos](#requisitos)
- [Configuración](#configuración)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Endpoints](#endpoints)
- [Ejemplos](#ejemplos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roadmap](#roadmap)
- [Licencia](#licencia)
- [Autor](#autor)

---

## Qué incluye hoy
- API REST con Express.
- Persistencia en **MongoDB Atlas** con **Mongoose**.
- Validación de payloads con **Zod** (request validation middleware).
- Endpoints de `applications`: crear, listar, detalle y cambio de estado.
- Ejemplos de request/response en `docs/examples`.

---

## Stack
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Zod (validación)
- Nodemon (desarrollo)
- Helmet, CORS, Morgan (middlewares)
- Git/GitHub

---

## Requisitos
- Node.js + npm
- Acceso a MongoDB Atlas (o MongoDB local)
- (Opcional) MongoDB Compass / Postman

---

## Configuración

### Variables de entorno
Crea un archivo `.env` en la raíz del proyecto (no se sube a GitHub):

```env
PORT=3000
MONGO_URI=mongodb+srv://api_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/academic_migration?retryWrites=true&w=majority
NODE_ENV=development

- En el repo se incluye .env.example como referencia.

Atlas: IP Access List (importante)

Si la API no conecta y aparece un error de IP no autorizada, agrega tu IP en:
Atlas → Security → Network Access → Add IP Address (Add Current IP)

---

## Instalación y Ejecución

npm install
npm run dev

Servidor: http://localhost:3000

Health check: GET http://localhost:3000/api/health


Scripts

npm run dev → desarrollo (nodemon)

npm start → producción local (node)

Endpoints

Base URL: http://localhost:3000

Health

GET /api/health

Applications

POST /api/applications → Crear application (validado con Zod)

GET /api/applications → Listar (paginación + filtros)

GET /api/applications/:id → Obtener detalle por id

PATCH /api/applications/:id/status → Cambiar estado (validado con Zod)

Query params soportados en list

page (default: 1)

limit (default: 10, max: 50)

status (DRAFT, SUBMITTED, IN_REVIEW, APPROVED, REJECTED)

q (búsqueda simple por applicantName, email, originInstitution, targetInstitution)

Ejemplos:

GET /api/applications?page=1&limit=10&status=DRAFT

GET /api/applications?q=jose

Ejemplos JSON:

docs/examples/create-application.request.json

docs/examples/create-application.response.json

docs/examples/list-applications.response.json


Estructura del proyecto

academic-migration-api/
├─ src/
│  ├─ config/
│  │  └─ db.js
│  ├─ middlewares/
│  │  ├─ errorHandler.js
│  │  └─ validateRequest.js
│  ├─ modules/
│  │  └─ applications/
│  │     ├─ application.model.js
│  │     ├─ application.controller.js
│  │     ├─ application.routes.js
│  │     └─ application.validation.js
│  ├─ routes/
│  │  └─ health.routes.js
│  ├─ app.js
│  └─ server.js
├─ docs/
│  ├─ examples/
│  └─ screenshots/
├─ .env.example
├─ .gitignore
├─ package.json
└─ package-lock.json


Roadmap (In Progress)
Migración / Carga masiva

 POST /api/applications/bulk (bulk insert con validación por fila y reporte de errores)

 Normalización (trim, email en minúsculas, mapping de columnas tipo planilla)

 Manejo de payloads grandes (límite y/o chunking)

Calidad y documentación

 Swagger / OpenAPI (/api/docs)

 Tests con Jest + Supertest (health + applications + bulk)

 Estandarizar errores (códigos y estructura consistente)

DevOps

 Docker (API + Mongo) con docker compose

 GitHub Actions (lint + tests)
 
 
  Licencia: MIT

## Autor
Jose Correa  
- GitHub: https://github.com/josecorrea01  
- LinkedIn: https://www.linkedin.com/in/jose-carlos-correa-herrera-314687399/  
- Email: josecorrea.electricidad@gmail.com

