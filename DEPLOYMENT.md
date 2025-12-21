# 🚀 Guía de Despliegue en GCP Cloud Run

Esta guía te ayudará a desplegar tu aplicación ticket-ace-portal en Google Cloud Platform usando Cloud Run.

## 📋 Prerrequisitos

1. **Cuenta de Google Cloud Platform**
   - Proyecto creado en GCP
   - Facturación habilitada

2. **Herramientas instaladas localmente**
   ```bash
   # Instalar Google Cloud CLI
   brew install --cask google-cloud-sdk  # macOS
   
   # O descarga desde: https://cloud.google.com/sdk/docs/install
   ```

3. **Docker instalado**
   ```bash
   docker --version
   ```

## 🔧 Configuración Inicial

### 1. Inicializar Google Cloud CLI

```bash
# Autenticarse con GCP
gcloud auth login

# Configurar proyecto
gcloud config set project YOUR_PROJECT_ID

# Habilitar APIs necesarias
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Configurar Secrets en GCP Secret Manager

```bash
# Crear secrets para variables sensibles
echo -n "tu-database-url" | gcloud secrets create DATABASE_URL --data-file=-
echo -n "tu-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "tu-session-secret" | gcloud secrets create SESSION_SECRET --data-file=-

# Dar permisos a Cloud Run para acceder a los secrets
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding SESSION_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 🏗️ Opción 1: Despliegue Manual

### Backend

```bash
# Navegar al directorio del Backend
cd Backend

# Construir la imagen Docker
docker build -t gcr.io/YOUR_PROJECT_ID/ticket-ace-backend:latest .

# Subir la imagen a Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/ticket-ace-backend:latest

# Desplegar en Cloud Run
gcloud run deploy ticket-ace-backend \
  --image gcr.io/YOUR_PROJECT_ID/ticket-ace-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,SESSION_SECRET=SESSION_SECRET:latest \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### Frontend

```bash
# Navegar al directorio del Frontend
cd Frontend

# Construir la imagen Docker
docker build -t gcr.io/YOUR_PROJECT_ID/ticket-ace-frontend:latest .

# Subir la imagen a Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/ticket-ace-frontend:latest

# Desplegar en Cloud Run
gcloud run deploy ticket-ace-frontend \
  --image gcr.io/YOUR_PROJECT_ID/ticket-ace-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --max-instances 10
```

## 🤖 Opción 2: Despliegue Automático con Cloud Build

### 1. Configurar Cloud Build Trigger

```bash
# Desde el directorio raíz del proyecto
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=us-central1
```

### 2. Configurar CI/CD con GitHub (Opcional)

```bash
# Conectar repositorio de GitHub
gcloud beta builds triggers create github \
  --repo-name=ticket-ace-portal-10225 \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --substitutions=_REGION=us-central1
```

## 🧪 Desarrollo Local con Docker

### Usando Docker Compose

```bash
# Crear archivo .env en la raíz del proyecto
cp .env.example .env

# Editar .env con tus variables de entorno
nano .env

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Construir y probar individualmente

```bash
# Backend
cd Backend
docker build -t ticket-ace-backend .
docker run -p 8080:8080 --env-file ../.env ticket-ace-backend

# Frontend
cd Frontend
docker build -t ticket-ace-frontend .
docker run -p 8081:8080 ticket-ace-frontend
```

## 🔍 Verificación del Despliegue

### Obtener URLs de los servicios

```bash
# URL del Backend
gcloud run services describe ticket-ace-backend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'

# URL del Frontend
gcloud run services describe ticket-ace-frontend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

### Probar endpoints

```bash
# Health check del backend
curl https://YOUR-BACKEND-URL/health

# Frontend
curl https://YOUR-FRONTEND-URL
```

## 📊 Monitoreo y Logs

```bash
# Ver logs del backend
gcloud run logs read ticket-ace-backend --region us-central1

# Ver logs del frontend
gcloud run logs read ticket-ace-frontend --region us-central1

# Ver en tiempo real
gcloud run logs tail ticket-ace-backend --region us-central1
```

## 🔄 Actualizar el Despliegue

```bash
# Reconstruir y redesplegar (método manual)
cd Backend
docker build -t gcr.io/YOUR_PROJECT_ID/ticket-ace-backend:latest .
docker push gcr.io/YOUR_PROJECT_ID/ticket-ace-backend:latest
gcloud run deploy ticket-ace-backend \
  --image gcr.io/YOUR_PROJECT_ID/ticket-ace-backend:latest \
  --region us-central1

# O usar Cloud Build
gcloud builds submit --config=cloudbuild.yaml
```

## 🛠️ Solución de Problemas

### Verificar que las imágenes se construyen correctamente

```bash
# Probar build local
cd Backend
docker build -t test-backend .

cd ../Frontend
docker build -t test-frontend .
```

### Revisar configuración de secrets

```bash
# Listar secrets
gcloud secrets list

# Ver versiones de un secret
gcloud secrets versions list DATABASE_URL
```

### Verificar permisos de IAM

```bash
# Ver permisos del service account
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

## 💰 Estimación de Costos

Cloud Run cobra por:
- **CPU**: Solo cuando se ejecutan requests
- **Memoria**: Solo cuando se ejecutan requests
- **Requests**: Primeros 2 millones/mes gratis

Con la configuración actual (512Mi backend, 256Mi frontend):
- Costo estimado: $5-20/mes para tráfico bajo-medio
- Escala automáticamente a 0 cuando no hay tráfico

## 📚 Recursos Adicionales

- [Documentación de Cloud Run](https://cloud.google.com/run/docs)
- [Mejores prácticas de Cloud Run](https://cloud.google.com/run/docs/best-practices)
- [Precios de Cloud Run](https://cloud.google.com/run/pricing)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

## 🔐 Seguridad

### Variables de Entorno en Build Time (Frontend)

Para configurar variables de entorno de Vite en el frontend durante el build:

```bash
# Opción 1: Build args en el Dockerfile
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_ANON_KEY=your_key \
  -t gcr.io/YOUR_PROJECT_ID/ticket-ace-frontend:latest \
  Frontend/

# Opción 2: Crear archivo .env.production en Frontend/ antes del build
```

### Configurar CORS en el Backend

Asegúrate de que el backend permita requests desde el dominio del frontend de Cloud Run.

## ✅ Checklist de Despliegue

- [ ] Cuenta de GCP configurada
- [ ] Google Cloud CLI instalado y autenticado
- [ ] APIs habilitadas (Cloud Run, Cloud Build, Container Registry, Secret Manager)
- [ ] Secrets creados en Secret Manager
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL accesible (Cloud SQL o externa)
- [ ] Dockerfiles probados localmente
- [ ] Imágenes construidas y subidas a GCR
- [ ] Servicios desplegados en Cloud Run
- [ ] URLs verificadas y funcionando
- [ ] Monitoreo configurado

---

¿Necesitas ayuda? Revisa los logs con `gcloud run logs read` o contacta al equipo de desarrollo.
