# 📘 Guía Paso a Paso - Docker & GCP Cloud Run

Esta guía te mostrará **exactamente** qué comandos ejecutar en la terminal para desplegar tu aplicación. Sigue cada paso en orden.

---

## 🎯 PARTE 1: PRUEBA LOCAL CON DOCKER

Esta parte te permite probar la aplicación en tu computadora antes de subirla a la nube.

### Paso 1.1: Verificar que Docker está instalado

```bash
docker --version
```

**Qué esperar:** Deberías ver algo como `Docker version 24.0.x`

**Si no tienes Docker:** Instálalo desde https://docs.docker.com/get-docker/

---

### Paso 1.2: Navegar al directorio del proyecto

```bash
cd /Users/ian.hdzzz/ticket-ace-portal-10225
```

**Qué hace:** Te mueve al directorio del proyecto donde están todos los archivos Docker.

---

### Paso 1.3: Crear archivo de variables de entorno

```bash
cp .env.example .env
```

**Qué hace:** Copia el archivo de ejemplo para crear tu archivo `.env` con las variables de entorno.

**Ahora edita el archivo `.env`:**

```bash
nano .env
```

O ábrelo con VS Code:

```bash
code .env
```

**Debes configurar al menos estas variables:**
- `DATABASE_URL` - URL de tu base de datos PostgreSQL
- `JWT_SECRET` - Un string secreto (ej: `mi-secreto-super-seguro-123`)
- `SESSION_SECRET` - Otro string secreto diferente

Guarda y cierra el archivo (en nano: `Ctrl+X`, luego `Y`, luego `Enter`)

---

### Paso 1.4: Construir la imagen del Backend

```bash
cd Backend
docker build -t ticket-ace-backend:local .
```

**Qué hace:** 
- `docker build` - Construye una imagen Docker
- `-t ticket-ace-backend:local` - Le pone el nombre "ticket-ace-backend:local"
- `.` - Usa el Dockerfile en el directorio actual

**Cuánto tarda:** 2-5 minutos la primera vez

**Qué esperar:** Verás muchas líneas descargando dependencias y construyendo. Al final debe decir algo como:
```
Successfully built abc123def456
Successfully tagged ticket-ace-backend:local
```

---

### Paso 1.5: Construir la imagen del Frontend

```bash
cd ../Frontend
docker build -t ticket-ace-frontend:local .
```

**Qué hace:** Lo mismo que el paso anterior pero para el frontend.

**Cuánto tarda:** 3-7 minutos (tiene que compilar React + Vite)

---

### Paso 1.6: Verificar que las imágenes se crearon

```bash
docker images
```

**Qué esperar:** Deberías ver algo como:

```
REPOSITORY              TAG       IMAGE ID       CREATED         SIZE
ticket-ace-frontend     local     abc123def      2 minutes ago   50MB
ticket-ace-backend      local     xyz789ghi      5 minutes ago   200MB
```

---

### Paso 1.7: Ejecutar el Backend

```bash
cd ..
docker run -d \
  --name backend \
  -p 8080:8080 \
  --env-file .env \
  ticket-ace-backend:local
```

**Qué hace:**
- `-d` - Ejecuta en segundo plano (detached)
- `--name backend` - Le pone nombre "backend" al contenedor
- `-p 8080:8080` - Mapea el puerto 8080 del contenedor al puerto 8080 de tu computadora
- `--env-file .env` - Usa las variables del archivo .env
- `ticket-ace-backend:local` - Usa la imagen que construiste

**Qué esperar:** Verás un ID largo (el ID del contenedor)

---

### Paso 1.8: Verificar que el Backend está corriendo

```bash
docker ps
```

**Qué esperar:** Deberías ver tu contenedor corriendo:

```
CONTAINER ID   IMAGE                        STATUS         PORTS
abc123def      ticket-ace-backend:local     Up 10 seconds  0.0.0.0:8080->8080/tcp
```

**Probar el Backend:**

```bash
curl http://localhost:8080
```

Deberías ver: `Servidor funcionando`

---

### Paso 1.9: Ver los logs del Backend

```bash
docker logs backend
```

**Qué hace:** Muestra lo que el backend está imprimiendo en la consola.

**Para ver logs en tiempo real:**

```bash
docker logs -f backend
```

(Presiona `Ctrl+C` para salir)

---

### Paso 1.10: Ejecutar el Frontend

```bash
docker run -d \
  --name frontend \
  -p 8081:8080 \
  ticket-ace-frontend:local
```

**Nota:** Usamos puerto `8081` en tu computadora para no conflictuar con el backend.

---

### Paso 1.11: Probar el Frontend

Abre tu navegador y ve a: http://localhost:8081

**Qué esperar:** Deberías ver tu aplicación React corriendo.

---

### Paso 1.12: Detener los contenedores (cuando termines de probar)

```bash
docker stop backend frontend
```

**Para eliminarlos completamente:**

```bash
docker rm backend frontend
```

---

## ☁️ PARTE 2: DESPLEGAR EN GCP CLOUD RUN

Esta parte sube tu aplicación a la nube de Google.

### Paso 2.1: Verificar que tienes Google Cloud CLI instalado

```bash
gcloud --version
```

**Si no lo tienes instalado:**

```bash
brew install --cask google-cloud-sdk
```

---

### Paso 2.2: Autenticarte con Google Cloud

```bash
gcloud auth login
```

**Qué hace:** Abre tu navegador para que inicies sesión con tu cuenta de Google.

**Luego ejecuta:**

```bash
gcloud auth application-default login
```

**Qué hace:** Configura credenciales para que Docker pueda subir imágenes.

---

### Paso 2.3: Configurar tu proyecto de GCP

**Primero, obtén tu PROJECT_ID:**

```bash
gcloud projects list
```

**Copia tu PROJECT_ID y configúralo:**

```bash
gcloud config set project TU_PROJECT_ID
```

Reemplaza `TU_PROJECT_ID` con el ID real de tu proyecto.

---

### Paso 2.4: Habilitar las APIs necesarias

```bash
gcloud services enable cloudbuild.googleapis.com
```

```bash
gcloud services enable run.googleapis.com
```

```bash
gcloud services enable containerregistry.googleapis.com
```

```bash
gcloud services enable secretmanager.googleapis.com
```

**Qué hace:** Activa los servicios de Google Cloud que necesitas.

**Cuánto tarda:** 30-60 segundos por cada uno.

---

### Paso 2.5: Crear secrets en Secret Manager

**Secret 1: DATABASE_URL**

```bash
echo -n "tu-url-de-base-de-datos-aqui" | gcloud secrets create DATABASE_URL --data-file=-
```

Reemplaza `tu-url-de-base-de-datos-aqui` con tu URL real.

**Secret 2: JWT_SECRET**

```bash
echo -n "tu-jwt-secret-seguro-123" | gcloud secrets create JWT_SECRET --data-file=-
```

**Secret 3: SESSION_SECRET**

```bash
echo -n "tu-session-secret-456" | gcloud secrets create SESSION_SECRET --data-file=-
```

**Verificar que se crearon:**

```bash
gcloud secrets list
```

---

### Paso 2.6: Dar permisos a Cloud Run para usar los secrets

**Primero obtén el número de tu proyecto:**

```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
echo $PROJECT_NUMBER
```

**Luego da permisos:**

```bash
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

```bash
gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

```bash
gcloud secrets add-iam-policy-binding SESSION_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### Paso 2.7: Construir y subir la imagen del Backend a GCP

```bash
cd Backend
```

```bash
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-backend
```

**Qué hace:** 
- Construye tu imagen Docker en la nube de Google
- La sube al Google Container Registry

**Cuánto tarda:** 3-10 minutos

**Qué esperar:** Al final verás algo como:
```
DONE
ID                                    CREATE_TIME                STATUS
abc-123-def-456                       2025-12-17...              SUCCESS
```

---

### Paso 2.8: Desplegar el Backend en Cloud Run

```bash
gcloud run deploy ticket-ace-backend \
  --image gcr.io/$(gcloud config get-value project)/ticket-ace-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,SESSION_SECRET=SESSION_SECRET:latest \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0
```

**Qué hace cada parámetro:**
- `--image` - Qué imagen usar
- `--region us-central1` - Dónde desplegar (cambia si prefieres otra región)
- `--allow-unauthenticated` - Permite acceso público
- `--port 8080` - Puerto que usa tu app
- `--set-secrets` - Conecta los secrets que creaste
- `--memory 512Mi` - Memoria RAM asignada
- `--max-instances 10` - Máximo 10 instancias corriendo
- `--min-instances 0` - Escala a 0 cuando no hay tráfico (ahorra dinero)

**Qué esperar:** Te preguntará confirmaciones, escribe `y` y presiona Enter.

Al final verás:
```
Service [ticket-ace-backend] revision [ticket-ace-backend-00001] has been deployed and is serving 100 percent of traffic.
Service URL: https://ticket-ace-backend-xxxxx-uc.a.run.app
```

**¡GUARDA ESA URL!** Es la URL pública de tu backend.

---

### Paso 2.9: Probar el Backend en la nube

```bash
BACKEND_URL=$(gcloud run services describe ticket-ace-backend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)')

curl $BACKEND_URL
```

Deberías ver: `Servidor funcionando`

---

### Paso 2.10: Construir y subir la imagen del Frontend

```bash
cd ../Frontend
```

```bash
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-frontend
```

**Cuánto tarda:** 5-12 minutos (React + Vite toma más tiempo)

---

### Paso 2.11: Desplegar el Frontend en Cloud Run

```bash
gcloud run deploy ticket-ace-frontend \
  --image gcr.io/$(gcloud config get-value project)/ticket-ace-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0
```

**Qué esperar:** Similar al backend, obtendrás una URL como:
```
Service URL: https://ticket-ace-frontend-xxxxx-uc.a.run.app
```

---

### Paso 2.12: Obtener las URLs de tus servicios

```bash
cd ..
echo "Backend URL:"
gcloud run services describe ticket-ace-backend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'

echo ""
echo "Frontend URL:"
gcloud run services describe ticket-ace-frontend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

**¡Listo!** Abre la URL del Frontend en tu navegador.

---

## 📊 COMANDOS ÚTILES PARA MONITOREO

### Ver logs del Backend en tiempo real

```bash
gcloud run logs tail ticket-ace-backend --region us-central1
```

### Ver logs del Frontend

```bash
gcloud run logs tail ticket-ace-frontend --region us-central1
```

### Ver últimas 50 líneas de logs

```bash
gcloud run logs read ticket-ace-backend --region us-central1 --limit 50
```

### Ver servicios desplegados

```bash
gcloud run services list --region us-central1
```

### Ver detalles de un servicio

```bash
gcloud run services describe ticket-ace-backend --region us-central1
```

### Ver revisiones (versiones) de un servicio

```bash
gcloud run revisions list --service ticket-ace-backend --region us-central1
```

---

## 🔄 ACTUALIZAR EL DESPLIEGUE

Cuando hagas cambios en tu código y quieras actualizar:

### Actualizar Backend

```bash
cd Backend
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-backend
gcloud run deploy ticket-ace-backend \
  --image gcr.io/$(gcloud config get-value project)/ticket-ace-backend \
  --region us-central1
```

### Actualizar Frontend

```bash
cd Frontend
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-frontend
gcloud run deploy ticket-ace-frontend \
  --image gcr.io/$(gcloud config get-value project)/ticket-ace-frontend \
  --region us-central1
```

---

## 🛑 ELIMINAR SERVICIOS (si quieres limpiar)

### Eliminar servicios de Cloud Run

```bash
gcloud run services delete ticket-ace-backend --region us-central1
gcloud run services delete ticket-ace-frontend --region us-central1
```

### Eliminar imágenes del Container Registry

```bash
gcloud container images delete gcr.io/$(gcloud config get-value project)/ticket-ace-backend
gcloud container images delete gcr.io/$(gcloud config get-value project)/ticket-ace-frontend
```

### Eliminar secrets

```bash
gcloud secrets delete DATABASE_URL
gcloud secrets delete JWT_SECRET
gcloud secrets delete SESSION_SECRET
```

---

## 💡 TIPS Y NOTAS IMPORTANTES

### 1. **Entender los costos**
- Cloud Run cobra por uso (tiempo de CPU + requests)
- Con `--min-instances 0` no pagas cuando no hay tráfico
- Costo estimado: $5-20/mes para tráfico bajo-medio

### 2. **Regiones disponibles**
Puedes cambiar `us-central1` por:
- `us-east1` (Carolina del Sur)
- `us-west1` (Oregón)
- `europe-west1` (Bélgica)
- `asia-northeast1` (Tokio)

Lista completa: `gcloud run regions list`

### 3. **Ver errores comunes**
Si algo falla, los logs son tu mejor amigo:
```bash
gcloud run logs read ticket-ace-backend --region us-central1 --limit 100
```

### 4. **Base de datos**
Tu base de datos PostgreSQL debe ser accesible desde internet o usa Cloud SQL.

Para Cloud SQL:
```bash
gcloud sql instances create mi-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

### 5. **Variables de entorno del Frontend**
Las variables `VITE_*` se configuran en **tiempo de build**, no de ejecución.

Para cambiarlas:
1. Edita `Frontend/.env` o crea `Frontend/.env.production`
2. Reconstruye la imagen

---

## ✅ CHECKLIST

Marca cada paso conforme lo completes:

### Prueba Local
- [ ] Docker instalado y funcionando
- [ ] Archivo `.env` creado y configurado
- [ ] Imagen del Backend construida
- [ ] Imagen del Frontend construida
- [ ] Backend corriendo en http://localhost:8080
- [ ] Frontend corriendo en http://localhost:8081

### Despliegue en GCP
- [ ] Google Cloud CLI instalado
- [ ] Autenticado con `gcloud auth login`
- [ ] Proyecto configurado
- [ ] APIs habilitadas
- [ ] Secrets creados en Secret Manager
- [ ] Permisos de IAM configurados
- [ ] Backend desplegado en Cloud Run
- [ ] Frontend desplegado en Cloud Run
- [ ] URLs funcionando correctamente

---

## 🆘 TROUBLESHOOTING

### Error: "permission denied"

```bash
# Verifica que estás autenticado
gcloud auth list

# Re-autentica si es necesario
gcloud auth login
gcloud auth application-default login
```

### Error: "API not enabled"

```bash
# Habilita todas las APIs necesarias
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com
```

### Error: "Image not found"

```bash
# Lista las imágenes disponibles
gcloud container images list

# Verifica que la imagen existe
gcloud container images list-tags gcr.io/$(gcloud config get-value project)/ticket-ace-backend
```

### Error de build de Docker

```bash
# Limpia el cache de Docker
docker system prune -a

# Construye sin cache
docker build --no-cache -t test .
```

### El servicio no responde

```bash
# Verifica que esté corriendo
gcloud run services list --region us-central1

# Ve los logs para encontrar el error
gcloud run logs read ticket-ace-backend --region us-central1 --limit 100
```

---

¿Tienes preguntas? Consulta la documentación oficial:
- Docker: https://docs.docker.com/
- Cloud Run: https://cloud.google.com/run/docs
- gcloud CLI: https://cloud.google.com/sdk/gcloud/reference
