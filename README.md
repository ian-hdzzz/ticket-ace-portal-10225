# 🎯 Ticket Ace Portal - Docker & GCP Cloud Run

Este proyecto está configurado para desplegarse en **Google Cloud Platform (GCP) Cloud Run** usando Docker.

## 📁 Estructura del Proyecto

```
ticket-ace-portal-10225/
├── Backend/                 # API backend (Node.js + TypeScript + Prisma)
│   ├── Dockerfile          # Configuración Docker para backend
│   └── ...
├── Frontend/               # Aplicación frontend (React + Vite + TypeScript)
│   ├── dockerfile          # Configuración Docker para frontend
│   └── ...
├── scripts/                # Scripts de ayuda para despliegue
│   ├── build-local.sh     # Construir imágenes localmente
│   ├── deploy-gcp.sh      # Desplegar en GCP Cloud Run
│   ├── setup-secrets.sh   # Configurar secrets en GCP
│   └── logs.sh            # Ver logs de Cloud Run
├── docker-compose.yml      # Desarrollo local con Docker
├── cloudbuild.yaml         # CI/CD automático en GCP
├── .env.example           # Variables de entorno de ejemplo
├── .gcloudignore          # Archivos ignorados en GCP
└── DEPLOYMENT.md          # Guía detallada de despliegue
```

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local con Docker Compose

```bash
# 1. Clonar el repositorio y navegar al directorio
cd ticket-ace-portal-10225

# 2. Crear archivo .env con tus variables
cp .env.example .env
# Edita .env con tus valores

# 3. Iniciar servicios con Docker Compose
docker-compose up -d

# 4. Acceder a las aplicaciones
# Frontend: http://localhost:8080
# Backend:  http://localhost:3000
```

### Opción 2: Prueba Local Individual

```bash
# Construir imágenes localmente
./scripts/build-local.sh

# Ejecutar backend
docker run -p 8080:8080 --env-file .env ticket-ace-backend:local

# Ejecutar frontend (en otra terminal)
docker run -p 8081:8080 ticket-ace-frontend:local
```

### Opción 3: Desplegar en GCP Cloud Run

```bash
# 1. Instalar Google Cloud CLI (si no lo tienes)
# macOS:
brew install --cask google-cloud-sdk

# 2. Autenticarte con GCP
gcloud auth login

# 3. Configurar secrets
./scripts/setup-secrets.sh YOUR_PROJECT_ID

# 4. Desplegar
./scripts/deploy-gcp.sh YOUR_PROJECT_ID us-central1

# 5. Ver logs (opcional)
./scripts/logs.sh backend YOUR_PROJECT_ID us-central1
```

## 📚 Documentación Completa

Para una guía detallada de despliegue, consulta **[DEPLOYMENT.md](./DEPLOYMENT.md)**

La guía incluye:
- ✅ Configuración inicial de GCP
- ✅ Configuración de secrets y variables de entorno
- ✅ Despliegue manual paso a paso
- ✅ CI/CD automático con Cloud Build
- ✅ Solución de problemas
- ✅ Monitoreo y logs
- ✅ Estimación de costos

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `scripts/build-local.sh` | Construye las imágenes Docker localmente |
| `scripts/deploy-gcp.sh PROJECT_ID [REGION]` | Despliega en Cloud Run |
| `scripts/setup-secrets.sh PROJECT_ID` | Configura secrets en GCP Secret Manager |
| `scripts/logs.sh [backend\|frontend] PROJECT_ID [REGION]` | Muestra logs en tiempo real |

## 🌐 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────┐
│            Google Cloud Platform                │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │   Cloud Run      │  │   Cloud Run      │   │
│  │   (Frontend)     │  │   (Backend)      │   │
│  │   Nginx + SPA    │  │   Node.js API    │   │
│  │   Port: 8080     │  │   Port: 8080     │   │
│  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │              │
│           │                     │              │
│  ┌────────┴─────────────────────┴─────────┐   │
│  │      Secret Manager                    │   │
│  │  (DATABASE_URL, JWT_SECRET, etc.)      │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │    Container Registry (GCR)            │   │
│  │    - ticket-ace-frontend:latest        │   │
│  │    - ticket-ace-backend:latest         │   │
│  └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
           │
           │ SQL Connection
           ▼
┌─────────────────────┐
│   PostgreSQL DB     │
│  (Cloud SQL o ext.) │
└─────────────────────┘
```

## 🔐 Variables de Entorno

### Backend
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `JWT_SECRET` - Secret para tokens JWT
- `SESSION_SECRET` - Secret para sesiones
- `PORT` - Puerto (8080 para Cloud Run)
- `NODE_ENV` - Ambiente (production)

### Frontend (Build Time)
- `VITE_SUPABASE_URL` - URL de Supabase
- `VITE_SUPABASE_ANON_KEY` - Key anónima de Supabase
- `VITE_CEA_*` - Configuración de APIs CEA

## 💰 Costos Estimados

Con Cloud Run pagas solo por lo que usas:
- **Nivel gratuito**: 2 millones de requests/mes
- **Costo estimado**: $5-20/mes para tráfico bajo-medio
- **Escala a 0**: No pagas cuando no hay tráfico

## 🛠️ Requisitos

### Para Desarrollo Local
- Docker Desktop
- Node.js 20+ (opcional, si no usas Docker)
- PostgreSQL (o usar Cloud SQL)

### Para Despliegue en GCP
- Cuenta de Google Cloud Platform
- Google Cloud CLI (`gcloud`)
- Proyecto de GCP con facturación habilitada

## 📊 Monitoreo

```bash
# Ver logs en tiempo real
./scripts/logs.sh backend YOUR_PROJECT_ID

# Ver métricas en GCP Console
https://console.cloud.google.com/run?project=YOUR_PROJECT_ID

# Ver costos
https://console.cloud.google.com/billing
```

## 🔄 Flujo de CI/CD

1. **Push a GitHub** → Trigger automático en Cloud Build
2. **Cloud Build** → Construye imágenes Docker
3. **Container Registry** → Almacena imágenes
4. **Cloud Run** → Despliega nuevas versiones
5. **Traffic Split** → 100% a nueva versión automáticamente

## 🆘 Solución de Problemas

### "Permission Denied" al ejecutar scripts
```bash
chmod +x scripts/*.sh
```

### Error de autenticación en GCP
```bash
gcloud auth login
gcloud auth application-default login
```

### Error de build de Docker
```bash
# Limpiar cache de Docker
docker system prune -a

# Reconstruir sin cache
docker build --no-cache -t test .
```

### Ver logs detallados
```bash
./scripts/logs.sh backend YOUR_PROJECT_ID
```

## 📝 Notas Importantes

1. **Cloud Run requiere puerto 8080** - Ambos servicios están configurados para usar este puerto
2. **Secrets en Secret Manager** - Las variables sensibles se almacenan en GCP Secret Manager
3. **Build multi-stage** - Los Dockerfiles usan builds multi-stage para optimizar el tamaño de las imágenes
4. **Health checks** - El backend incluye un endpoint `/health` para verificación de salud

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 🔗 Enlaces Útiles

- [Documentación de Cloud Run](https://cloud.google.com/run/docs)
- [Documentación de Docker](https://docs.docker.com/)
- [Guía de Prisma](https://www.prisma.io/docs/)
- [Documentación de Vite](https://vitejs.dev/)

---

**¿Necesitas ayuda?** Consulta [DEPLOYMENT.md](./DEPLOYMENT.md) o contacta al equipo de desarrollo.
