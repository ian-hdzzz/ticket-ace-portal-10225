# 🎯 GUÍA RÁPIDA - Primeros Pasos

## 🚀 Opción Más Fácil: Script Interactivo

Ejecuta el script de inicio que te guiará paso a paso:

```bash
./start.sh
```

Este script te permite:
- ✅ Probar Docker localmente
- ✅ Desplegar en GCP Cloud Run
- ✅ Ver documentación

---

## 📋 Opción Manual: Paso a Paso

### 1️⃣ Prueba Local (Desarrollo)

#### Con Docker Compose (Recomendado):

```bash
# 1. Crear archivo de variables de entorno
cp .env.example .env

# 2. Editar .env con tus valores
nano .env

# 3. Iniciar todos los servicios
docker-compose up -d

# Acceder a:
# Frontend: http://localhost:8080
# Backend:  http://localhost:3000

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

#### Construir Imágenes Individuales:

```bash
# Construir
./scripts/build-local.sh

# Ejecutar Backend
docker run -p 8080:8080 --env-file .env ticket-ace-backend:local

# Ejecutar Frontend (en otra terminal)
docker run -p 8081:8080 ticket-ace-frontend:local
```

---

### 2️⃣ Desplegar en GCP Cloud Run

#### Requisitos Previos:

```bash
# 1. Instalar Google Cloud CLI (si no lo tienes)
brew install --cask google-cloud-sdk

# 2. Autenticarte
gcloud auth login

# 3. Verificar que estás autenticado
gcloud auth list
```

#### Configurar Secrets:

```bash
# Ejecutar script de configuración de secrets
./scripts/setup-secrets.sh YOUR_PROJECT_ID

# O manualmente:
echo -n "tu-database-url" | gcloud secrets create DATABASE_URL --data-file=-
echo -n "tu-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "tu-session-secret" | gcloud secrets create SESSION_SECRET --data-file=-
```

#### Desplegar:

```bash
# Opción 1: Usando el script (Recomendado)
./scripts/deploy-gcp.sh YOUR_PROJECT_ID us-central1

# Opción 2: Manual con gcloud
gcloud builds submit --config=cloudbuild.yaml --substitutions=_REGION=us-central1
```

---

## 🔍 Comandos Útiles

### Ver logs de Cloud Run:
```bash
./scripts/logs.sh backend YOUR_PROJECT_ID
./scripts/logs.sh frontend YOUR_PROJECT_ID
```

### Ver URLs desplegadas:
```bash
gcloud run services list --platform managed --region us-central1
```

### Obtener URL específica:
```bash
# Backend
gcloud run services describe ticket-ace-backend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'

# Frontend
gcloud run services describe ticket-ace-frontend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## 📁 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `start.sh` | 🎯 **Script interactivo para comenzar** |
| `README.md` | Documentación completa del proyecto |
| `DEPLOYMENT.md` | Guía detallada de despliegue en GCP |
| `.env.example` | Ejemplo de variables de entorno |
| `docker-compose.yml` | Configuración para desarrollo local |
| `cloudbuild.yaml` | CI/CD para GCP Cloud Build |

---

## ⚡ Comandos Rápidos

```bash
# 🎯 Empezar (interactivo)
./start.sh

# 🧪 Probar localmente
docker-compose up -d

# ☁️ Desplegar en GCP
./scripts/deploy-gcp.sh YOUR_PROJECT_ID

# 📊 Ver logs
./scripts/logs.sh backend YOUR_PROJECT_ID

# 🛑 Detener local
docker-compose down

# 🔄 Reconstruir local
docker-compose up -d --build
```

---

## 🆘 ¿Problemas?

1. **Error "Permission Denied"**:
   ```bash
   chmod +x scripts/*.sh start.sh
   ```

2. **Docker no responde**:
   ```bash
   docker system prune -a
   docker-compose down -v
   docker-compose up -d --build
   ```

3. **GCP Authentication Error**:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

4. **Más ayuda**: Consulta `DEPLOYMENT.md` para guía detallada

---

## 📞 Próximos Pasos

1. ✅ Prueba local con `./start.sh` o `docker-compose up`
2. ✅ Verifica que todo funciona
3. ✅ Configura secrets en GCP
4. ✅ Despliega con `./scripts/deploy-gcp.sh`
5. ✅ Monitorea con logs y métricas de GCP

**¡Listo para empezar! 🚀**
