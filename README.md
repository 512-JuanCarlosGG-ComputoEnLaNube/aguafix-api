# AguaFix API 💧

API desarrollada en **NestJS (v11)** con **TypeScript**, diseñada para que los ciudadanos reporten fugas de agua en la vía pública. Al crear un reporte, el sistema lo persiste en **PostgreSQL** mediante **TypeORM** con migraciones (`synchronize: false`) y despacha automáticamente una notificación por correo electrónico a la cuadrilla de mantenimiento con una plantilla HTML legible y estilizada construida con **Nodemailer**.

---

## 🚀 Tecnologías y Arquitectura

- **Framework:** [NestJS](https://nestjs.com/) v11 (TypeScript)
- **Base de Datos:** PostgreSQL 16 ejecutado mediante Docker Compose
- **ORM:** TypeORM con control estricto de migraciones (`synchronize: false`)
- **Variables de Entorno:** Tipado estricto y validación en tiempo de arranque mediante `env-var` + `dotenv` ([`src/config/envs.ts`](src/config/envs.ts))
- **Seguridad:** Hasheo y verificación de contraseñas con `bcryptjs`
- **Mailing:** `nodemailer` configurado mediante transporter con credenciales de entorno y plantilla HTML con estilos inline ([`src/reports/templates/report.template.ts`](src/reports/templates/report.template.ts))
- **Arquitectura Modular:** `Module -> Controller -> Service -> Repository` con `ValidationPipe` global y DTOs para cada endpoint.

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
| `isResolved` | BOOLEAN | Inicia en `false` |
| `createdAt` | TIMESTAMP | Fecha y hora del reporte (por defecto `now()`) |

---

## ⚙️ Requisitos Previos

- [Node.js](https://nodejs.org/) (v20 o superior)
- [Docker](https://www.docker.com/) y Docker Compose (para la base de datos PostgreSQL)

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/512-JuanCarlosGG-ComputoEnLaNube/aguafix-api.git
cd aguafix-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
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

# Servicio de Correo (Gmail / App Password o SMTP)
MAILER_SERVICE=Gmail
MAILER_USER=tu_correo@gmail.com
MAILER_PASSWORD=tu_contraseña_de_aplicacion
MAINTENANCE_EMAIL=cuadrilla_mantenimiento@aguafix.local
```

### 4. Levantar la base de datos con Docker
```bash
docker compose up -d
```

### 5. Ejecutar migraciones de TypeORM
```bash
npm run migration:run
```

### 6. Iniciar la aplicación
Modo desarrollo:
```bash
npm run start:dev
```
La API estará disponible en `http://localhost:3000`.

---

## 📬 Endpoints de la API

### Autenticación (`/auth`)

#### `POST /auth/register`
Registra un nuevo usuario en la tabla `SYSTEM_USER` cifrando la contraseña con `bcryptjs`.
- **Body (`CreateUserDto`):**
```json
{
  "name": "Juan Carlos Gallegos",
  "email": "carlos.gallegos@aguafix.local",
  "password": "Password123*",
  "isNotificationEnabled": true
}
```
- **Respuesta Exitosa (201 Created):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan Carlos Gallegos",
    "email": "carlos.gallegos@aguafix.local",
    "isNotificationEnabled": true
  }
}
```

#### `POST /auth/login`
Inicia sesión validando las credenciales contra la base de datos. Si las credenciales no coinciden, retorna un error claro `400 Bad Request`.
- **Body (`LoginDto`):**
```json
{
  "email": "carlos.gallegos@aguafix.local",
  "password": "Password123*"
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "name": "Juan Carlos Gallegos",
    "email": "carlos.gallegos@aguafix.local",
    "isNotificationEnabled": true
  }
}
```
- **Respuesta con Credenciales Inválidas (400 Bad Request):**
```json
{
  "message": "Credenciales inválidas: correo o contraseña incorrectos",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### Reportes de Fugas (`/reports`)

#### `POST /reports`
Crea un nuevo reporte en la tabla `WATER_REPORT` y **despacha automáticamente un correo electrónico** a la cuadrilla de mantenimiento con el template HTML estilizado.
- **Body (`CreateReportDto`):**
```json
{
  "address": "Av. Hidalgo esq. Calle 5 de Mayo #402, Zona Centro",
  "description": "Fuga de agua potable considerable en la banqueta, brota agua limpia con presión moderada.",
  "severity": "high",
  "reporterPhone": "4491234567"
}
```
- **Respuesta Exitosa (201 Created):**
```json
{
  "id": 1,
  "address": "Av. Hidalgo esq. Calle 5 de Mayo #402, Zona Centro",
  "description": "Fuga de agua potable considerable en la banqueta, brota agua limpia con presión moderada.",
  "severity": "high",
  "reporterPhone": "4491234567",
  "isResolved": false,
  "createdAt": "2026-03-09T21:50:00.000Z"
}
```

#### `GET /reports`
Retorna el listado completo de todos los reportes ordenados cronológicamente (más recientes primero).
- **Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": 1,
    "address": "Av. Hidalgo esq. Calle 5 de Mayo #402, Zona Centro",
    "description": "Fuga de agua potable considerable en la banqueta, brota agua limpia con presión moderada.",
    "severity": "high",
    "reporterPhone": "4491234567",
    "isResolved": false,
    "createdAt": "2026-03-09T21:50:00.000Z"
  }
]
```

---

## 🧪 Pruebas de los Endpoints

El repositorio incluye dos opciones listas para probar los endpoints:
1. **Archivo HTTP para VS Code:** Abre [`requests.http`](requests.http) y usa la extensión *REST Client* o *Thunder Client* para enviar las peticiones directamente.
2. **Colección de Postman:** Importa el archivo [`aguafix-api.postman_collection.json`](aguafix-api.postman_collection.json) en Postman.

---

## 📹 Guía / Checklist para el Video de Demostración

Para el entregable del video demostrativo de la API funcionando:
1. **Presentación:** Breve introducción mostrando la estructura de carpetas modular (`auth`, `users`, `reports`, `email`, `db`, `config`).
2. **Base de Datos y Migraciones:** Mostrar el contenedor de Docker corriendo (`docker ps`) y la ejecución de las migraciones (`npm run migration:run`).
3. **Arranque:** Ejecutar `npm run start:dev` y mostrar en consola que la aplicación levantó en el puerto configurado.
4. **Demostración de Endpoints (Postman / REST Client):**
   - Registrar un usuario (`POST /auth/register`).
   - Intentar iniciar sesión con contraseña incorrecta para verificar la `BadRequestException` (`400 Bad Request`).
   - Iniciar sesión correctamente (`POST /auth/login` con `200 OK`).
   - Crear un reporte de fuga de agua (`POST /reports`).
   - Mostrar en la consola del servidor el log de guardado y de envío del correo.
   - Mostrar el inbox del correo receptor con el template HTML renderizado (tabla estilizada, badge de severidad y datos de contacto).
   - Consultar la lista de reportes (`GET /reports`) para demostrar la persistencia en la tabla `WATER_REPORT`.
