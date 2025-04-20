# Repositorio Académico

**Proyecto**: Backend de un sistema de repositorio académico híbrido  
**Stack**: Node.js, Express.js, MySQL (mysql2), MongoDB (Mongoose)  
**Logging**: Winston, Morgan  
**Validación**: express-validator  
**Autenticación**: JWT (jsonwebtoken)  
**Entorno**: dotenv, nodemon  

---

## 📘 Descripción

Este proyecto ofrece una **API REST** para gestionar recursos académicos (tesis, proyectos, documentos) en un repositorio híbrido.  
- **MySQL** almacena la información relacional: usuarios, roles, recursos, categorías, carreras y asesores.  
- **MongoDB** almacena archivos (PDF, imágenes, videos) y su historial de versiones.

---

## 🚀 Instalación

1. **Clonar el repositorio**  
   ```bash
   git clone <url-del-repo>
   cd RepoBackend
   ```

2. **Instalar dependencias**  
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**  
   Crea un archivo `.env` en la raíz:
   ```ini
   NODE_ENV=development
   PORT=3000

   # Backend
   PORT_FRONT=3001
   JWT_SECRET=supersecreto

   # MySQL (URI completo o detalles)
   DATABASE_URL=mysql://user:pass@host:3306/database
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=Chris123$
   MYSQL_DATABASE=repository
   MYSQL_PORT=3306

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/repository
   ```

4. **Arrancar en desarrollo**  
   ```bash
   npm run dev
   ```
   - Usa `nodemon` para recarga en caliente y `dotenv` para variables de entorno.

5. **Arrancar en producción**  
   ```bash
   npm start
   ```

---

## 📂 Estructura de carpetas

```
RepoBackend/
├── config/
│   ├── databases/       # Configuración de MySQL y MongoDB
│   │   ├── mysql.js
│   │   └── mongo.js
│   ├── env/
│   │   ├── development.js
│   │   └── production.js
│   └── config.js        # Selección de entorno y centralización
├── logs/                # Archivos de log (combined.log, error.log)
├── src/
│   ├── controllers/     # Controladores (lógica de endpoints)
│   ├── middlewares/     # CORS, seguridad, logging, rate limiting...
│   ├── models/          # Esquemas de Mongoose
│   ├── routes/          # Definición de rutas (Express Router)
│   ├── utils/           # Error handler y logger centralizado
│   ├── server.js        # Configuración de Express y arranque
│   └── index.js         # Punto de inicio: conecta BD y escucha
├── uploads/             # Archivos subidos (gestión con Multer)
├── .env                 # Variables de entorno (no versionar)
├── .gitignore
└── package.json
```

---

## 🔍 Endpoints principales

> Todos los endpoints están prefijados con `/api`

### Salud del servicio
- `GET /api/health`  
  Responde `200 OK` (sin consultar DB) para health check.

### Autenticación
- `POST /api/auth/login`  
  - Body: `{ email, password }`  
  - Respuesta: `{ token, user }`

### Usuarios
- `GET /api/users`  
- `POST /api/users`  
- `GET /api/users/:id`  
- `PUT /api/users/:id`  
- `DELETE /api/users/:id`

### Recursos
- `GET /api/resources`  
- `POST /api/resources`  
- `GET /api/resources/:id`  
- `PUT /api/resources/:id`  
- `DELETE /api/resources/:id`

*(y rutas anidadas para versiones, archivos, etc.)*

---

## 🛠️ Middlewares utilizados

- `corsMiddleware` (CORS configurado)  
- `securityMiddleware` (Helmet para cabeceras seguras)  
- `rateLimiter` (Límite de peticiones)  
- `compressionMiddleware` (GZIP)  
- `requestIdMiddleware` (Identificador único de petición)  
- `morganMiddleware` (Logging HTTP unificado)  
- `errorHandler` & `notFoundHandler` (Manejo central de errores)

---

## 📈 Monitorización y logs

- **Logs de petición**: `logs/combined.log`  
- **Errores críticos**: `logs/error.log`  
- **Health check**: `/api/health`

---

## 🔒 Buenas prácticas

- Nunca exponer stacks en producción.  
- Validar y sanitizar inputs.  
- Rotación de logs y limpieza periódica (p. ej. job de cron).

---

## 📄 Términos de Licencia

```
© 2025 Christian Vicente. Todos los derechos reservados.

Este software y su documentación asociada son propiedad exclusiva de Christian Vicente.
Queda prohibida cualquier reproducción, distribución, comunicación pública o transformación
no autorizada por escrito por el autor. Para obtener permisos de uso, contacte a:
christian.vicente@example.com.
```