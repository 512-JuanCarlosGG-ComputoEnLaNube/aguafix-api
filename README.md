# AguaFix API 💧

API desarrollada en **NestJS (v11)** con **TypeScript**, diseñada para que los ciudadanos reporten fugas de agua en la vía pública adjuntando evidencia fotográfica. Al crear un reporte, el sistema sube la fotografía a un bucket de **Amazon S3** (`reports/`), persiste el reporte con su `photoUrl` en **PostgreSQL** mediante **TypeORM** con migraciones (`synchronize: false`) y despacha automáticamente una notificación por correo electrónico a la cuadrilla de mantenimiento con una plantilla HTML que incluye la fotografía embebida (`<img>`).

La API está empaquetada como una imagen de **Docker** (`node:22-alpine`) publicada automáticamente en **Docker Hub** mediante **GitHub Actions** en cada `push` a la rama `main`.

---

## 🚀 Tecnologías y Arquitectura

- **Framework:** [NestJS](https://nestjs.com/) v11 (TypeScript)
- **Almacenamiento en la Nube:** Amazon S3 mediante `@aws-sdk/client-s3` (`StorageModule` y `StorageService`)
- **Base de Datos:** PostgreSQL 16 ejecutado mediante Docker Compose
- **ORM:** TypeORM con control estricto de migraciones (`synchronize: false`)
- **Variables de Entorno:** Tipado estricto y validación en tiempo de arranque mediante `env-var` + `dotenv` ([`src/config/envs.ts`](src/config/envs.ts))
- **Seguridad:** Hasheo y verificación de contraseñas con `bcryptjs`
- **Mailing:** `nodemailer` con plantilla HTML estilizada e imagen de la fuga embebida ([`src/reports/templates/report.template.ts`](src/reports/templates/report.template.ts))
- **Contenedores y CI/CD:** Multi-stage `Dockerfile` (`node:22-alpine`), `.dockerignore`, `compose.yaml` y pipeline de publicación continua con GitHub Actions ([`.github/workflows/build-and-push.yml`](.github/workflows/build-and-push.yml))

---

## 🗄️ Modelo de Base de Datos

### 1. Tabla `SYSTEM_USER` (Entidad `User`)
| Campo | Tipo | Restricción / Comentario |
|---|---|---|
| `id` | SERIAL | Primary Key autogenerado |
| `name` | VARCHAR | Nombre completo del usuario |
| `email` | VARCHAR | Único, correo electrónico |
| `password` | VARCHAR | Contraseña cifrada con `bcryptjs` |
| `isNotificationEnabled` | BOOLEAN | Por defecto `true` |

### 2. Tabla `WATER_REPORT` (Entidad `Report`)
| Campo | Tipo | Restricción / Comentario |
|---|---|---|
| `id` | SERIAL | Primary Key autogenerado |
| `address` | VARCHAR | Dirección o referencia de la fuga |
| `description` | TEXT | Detalle de lo observado |
| `severity` | VARCHAR | Severidad: `low`, `medium`, `high` |
| `reporterPhone` | VARCHAR | Teléfono de contacto del ciudadano |
| `photoUrl` | VARCHAR | URL pública en S3 de la foto de la fuga (`reports/...`) |
| `isResolved` | BOOLEAN | Inicia en `false` |
| `createdAt` | TIMESTAMP | Fecha y hora del reporte (por defecto `now()`) |

---

## 🛠️ Configuración de Variables de Entorno

Crea tu archivo `.env` tomando como base el archivo `.env.template`:
```bash
cp .env.template .env
```

Configura tus variables en `.env`:
```env
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aguafixdb
DB_USER=postgres
DB_PASSWORD=secret123
DB_TYPE=postgres
DB_MIGRATIONS_RUN=false

# Servicio de Correo (Gmail / App Password o SMTP)
MAILER_SERVICE=Gmail
MAILER_USER=tu_correo@gmail.com
MAILER_PASSWORD=tu_contraseña_de_aplicacion
MAINTENANCE_EMAIL=cuadrilla_mantenimiento@aguafix.local

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_S3_BUCKET=nombre_de_tu_bucket
```

---

## 🐳 Ejecución con Docker Compose (Imagen en Docker Hub)

El archivo [`compose.yaml`](compose.yaml) levanta tanto la base de datos PostgreSQL como la API de AguaFix utilizando la imagen publicada en Docker Hub (`carlosgallegosgtz/512-aguafix-api:latest`) y ejecuta automáticamente las migraciones de TypeORM al iniciar (`DB_MIGRATIONS_RUN=true`):

```bash
docker compose pull
docker compose up -d
```

Para desarrollo local fuera de Docker (solo levantando PostgreSQL en contenedor):
```bash
docker compose up -d postgres
npm install
npm run migration:run
npm run start:dev
```

---

## 🔄 CI/CD con GitHub Actions

El workflow [`.github/workflows/build-and-push.yml`](.github/workflows/build-and-push.yml) se ejecuta en cada `push` a la rama `main`:
1. Clona el repositorio.
2. Inicia sesión en Docker Hub utilizando `secrets.DOCKER_USER` y `secrets.DOCKER_PASSWORD`.
3. Construye la imagen a partir del [`Dockerfile`](Dockerfile) (`node:22-alpine`).
4. Publica la imagen con el tag `latest` en Docker Hub (`carlosgallegosgtz/512-aguafix-api:latest`).

---

## 📬 Endpoints de la API

### Autenticación (`/auth`)

- **`POST /auth/register`**: Registra un nuevo usuario en `SYSTEM_USER` cifrando la contraseña con `bcryptjs`.
- **`POST /auth/login`**: Valida credenciales y retorna `200 OK` o `400 Bad Request` (`BadRequestException`).

### Reportes de Fugas (`/reports`)

#### `POST /reports` (`multipart/form-data`)
Crea un nuevo reporte de fuga subiendo la fotografía a la carpeta `reports/` del bucket de S3, guarda el reporte con `photoUrl` en `WATER_REPORT` y envía el correo a la cuadrilla con la foto embebida (`<img>`). Si no se adjunta el archivo `"photo"`, lanza `BadRequestException` (`400 Bad Request`).

- **Campos (`multipart/form-data`):**
  - `address` (Text): `"Av. Hidalgo esq. Calle 5 de Mayo #402, Zona Centro"`
  - `description` (Text): `"Fuga de agua potable considerable en la banqueta, brota agua limpia con presión moderada."`
  - `severity` (Text): `"high"` (`low` | `medium` | `high`)
  - `reporterPhone` (Text): `"4491234567"`
  - `photo` (File - **obligatorio**): Archivo de imagen de la fuga.

- **Respuesta Exitosa (201 Created):**
```json
{
  "id": 1,
  "address": "Av. Hidalgo esq. Calle 5 de Mayo #402, Zona Centro",
  "description": "Fuga de agua potable considerable en la banqueta, brota agua limpia con presión moderada.",
  "severity": "high",
  "reporterPhone": "4491234567",
  "photoUrl": "https://mi-bucket.s3.us-east-1.amazonaws.com/reports/uuid-fuga.jpg",
  "isResolved": false,
  "createdAt": "2026-10-22T20:00:00.000Z"
}
```

#### `GET /reports`
Retorna el listado completo de todos los reportes ordenados cronológicamente (incluyendo `photoUrl`).
