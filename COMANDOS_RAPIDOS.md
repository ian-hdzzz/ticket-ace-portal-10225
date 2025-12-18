# 🚀 Comandos Rápidos - Referencia

## 🧪 PRUEBA LOCAL

```bash
# 1. Ir al proyecto
cd /Users/ian.hdzzz/ticket-ace-portal-10225

# 2. Crear .env
cp .env.example .env
code .env  # Edita las variables

# 3. Construir Backend
cd Backend
docker build -t ticket-ace-backend:local .

# 4. Construir Frontend
cd ../Frontend
docker build -t ticket-ace-frontend:local .

# 5. Ejecutar Backend
cd ..
docker run -d --name backend -p 8080:8080 --env-file .env ticket-ace-backend:local

# 6. Ejecutar Frontend
docker run -d --name frontend -p 8081:8080 ticket-ace-frontend:local

# 7. Ver logs
docker logs -f backend
docker logs -f frontend

# 8. Detener
docker stop backend frontend
docker rm backend frontend
```

## ☁️ DESPLEGAR EN GCP

```bash
# 1. Autenticarse
gcloud auth login
gcloud auth application-default login

# 2. Configurar proyecto
gcloud config set project TU_PROJECT_ID

# 3. Habilitar APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com

# 4. Crear secrets
echo -n "tu-database-url" | gcloud secrets create DATABASE_URL --data-file=-
echo -n "tu-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "tu-session-secret" | gcloud secrets create SESSION_SECRET --data-file=-

# 5. Dar permisos
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
for secret in DATABASE_URL JWT_SECRET SESSION_SECRET; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done

# 6. Desplegar Backend
cd Backend
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-backend
gcloud run deploy ticket-ace-backend \
  --image gcr.io/$(gcloud config get-value project)/ticket-ace-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,SESSION_SECRET=SESSION_SECRET:latest \
  --memory 512Mi \
  --max-instances 10 \
  --min-instances 0

# 7. Desplegar Frontend
cd ../Frontend
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-frontend
gcloud run deploy ticket-ace-frontend \
  --image gcr.io/$(gcloud config get-value project)/ticket-ace-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --max-instances 10 \
  --min-instances 0
```

## 📊 MONITOREO

```bash
# Ver URLs
gcloud run services describe ticket-ace-backend --region us-central1 --format 'value(status.url)'
gcloud run services describe ticket-ace-frontend --region us-central1 --format 'value(status.url)'

# Logs en tiempo real
gcloud run logs tail ticket-ace-backend --region us-central1
gcloud run logs tail ticket-ace-frontend --region us-central1

# Ver servicios
gcloud run services list
```

## 🔄 ACTUALIZAR

```bash
# Backend
cd Backend
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-backend
gcloud run deploy ticket-ace-backend --image gcr.io/$(gcloud config get-value project)/ticket-ace-backend --region us-central1

# Frontend
cd Frontend
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/ticket-ace-frontend
gcloud run deploy ticket-ace-frontend --image gcr.io/$(gcloud config get-value project)/ticket-ace-frontend --region us-central1
```
