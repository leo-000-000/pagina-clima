# 🌤️ ClimaBA — Sistema Web de Clima

Web de pronóstico meteorológico con panel de administración. Los administradores cargan pronósticos, imágenes y datos históricos; los usuarios los visualizan en tiempo real.

## Stack

- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Vercel Postgres en producción)
- **Auth:** Sessions con `express-session` + `connect-pg-simple`
- **Frontend:** HTML5 + CSS3 + JavaScript vanilla + Chart.js

## Estructura

```
├── server.js              ← Servidor Express principal
├── config/database.js     ← Conexión y setup de PostgreSQL
├── middleware/            ← Auth + uploads
├── models/weatherModel.js ← Queries a la DB
├── routes/                ← API pública, admin y auth
└── public/                ← Frontend estático
    ├── index.html         ← Sitio público
    ├── login.html         ← Login admin
    ├── admin.html         ← Panel de administración
    ├── css/
    └── js/
```

## Desarrollo local

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/pagina-clima.git
cd pagina-clima
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá `.env` con tu conexión PostgreSQL local:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/clima_db
SESSION_SECRET=secreto_largo_y_seguro
NODE_ENV=development
```

### 3. Crear la base de datos local

```bash
createdb clima_db   # si usás psql
```

### 4. Iniciar

```bash
npm run dev   # con nodemon
# o
npm start
```

Accedé a **http://localhost:3000**  
Panel admin: **http://localhost:3000/admin**  
Credenciales por defecto: `admin` / `admin123`

---

## Deploy en Vercel

### 1. Crear base de datos

En el dashboard de Vercel:  
**Storage → Create Database → Postgres** → nombre: `clima-db`

Las variables `POSTGRES_URL`, `POSTGRES_USER`, etc. se agregan automáticamente al proyecto.

### 2. Agregar variables de entorno adicionales

En **Settings → Environment Variables**:

```
SESSION_SECRET = (cadena larga y aleatoria)
NODE_ENV       = production
LOCATION_NAME  = Buenos Aires
```

### 3. Deploy

```bash
vercel --prod
# o conectar el repo en vercel.com → Import Project
```

La base de datos se inicializa automáticamente en el primer arranque.

---

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin123` |

> ⚠️ **Cambiá la contraseña** después del primer login desde el panel de usuarios.

## API pública

```
GET /api/weather/current     → Pronóstico actual
GET /api/weather/upcoming    → Próximos días (?days=5)
GET /api/weather/history     → Últimos 30 días históricos
```
