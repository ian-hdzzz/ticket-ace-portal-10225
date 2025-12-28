#!/bin/bash
# ============================================
# Quick Setup Script for Cloud Build Secrets
# Project: clever-obelisk-277705
# ============================================
set -e

PROJECT_ID="clever-obelisk-277705"
echo "🔐 Setting up secrets for project: $PROJECT_ID"

gcloud config set project $PROJECT_ID

# Note: Secret Manager API is already enabled
echo "✅ Secret Manager API already enabled"

# Function to create or update a secret
create_secret() {
  local secret_name=$1
  local secret_value=$2
  
  if gcloud secrets describe $secret_name --project=$PROJECT_ID &>/dev/null 2>&1; then
    echo "  ↻ Updating $secret_name..."
    echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=- --project=$PROJECT_ID
  else
    echo "  ✚ Creating $secret_name..."
    echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=- --project=$PROJECT_ID
  fi
}

echo ""
echo "🔧 Creating Backend Secrets..."

# Backend runtime secrets
create_secret "DATABASE_URL" "postgresql://prisma.uxlwihcwgwrwrmnfefds:server123@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
create_secret "DIRECT_URL" "postgresql://postgres.uxlwihcwgwrwrmnfefds:XgH1lLMMfQRMfllK@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
create_secret "JWT_ACCESS_SECRET" "applesauce"
create_secret "JWT_REFRESH_SECRET" "marmelade"
create_secret "OPENAI_API_KEY" "your-openai-api-key-here"
create_secret "SUPABASE_URL" "https://uxlwihcwgwrwrmnfefds.supabase.co"
create_secret "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bHdpaGN3Z3dyd3JtbmZlZmRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcyMDYzNCwiZXhwIjoyMDcxMjk2NjM0fQ.lwJ3NSa_irQQei-C4N575SARuLjKZ_wbenF__TroZxA"
create_secret "RESEND_API_KEY" "re_TyjkPw4w_NGVowLV2Z6Tqnr1sguM31ihE"
create_secret "DEV_EMAIL" "ianhdez2020@gmail.com"
create_secret "FRONTEND_URL" "https://ticket-ace-frontend-WILL_UPDATE.run.app"

echo ""
echo "🎨 Creating Frontend/CEA Secrets..."

create_secret "VITE_SUPABASE_URL" "https://uxlwihcwgwrwrmnfefds.supabase.co"
create_secret "VITE_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bHdpaGN3Z3dyd3JtbmZlZmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjA2MzQsImV4cCI6MjA3MTI5NjYzNH0.oN5ILML0PqrltAxIW2IHJ0n-F7ZeF6FhuEnA71DGeS8"
create_secret "VITE_CEA_REST_URL" "/ceadevws/"
create_secret "VITE_CEA_SOAP_CONTRACT_URL" "/aquacis-cea/services/InterfazGenericaContratacionWS"
create_secret "VITE_CEA_SOAP_WORKORDER_URL" "/aquacis-cea/services/InterfazGenericaOrdenesServicioWS"
create_secret "VITE_CEA_SOAP_METER_URL" "/aquacis-cea/services/InterfazGenericaContadoresWS"
create_secret "VITE_CEA_SOAP_DEBT_URL" "/aquacis-cea/services/InterfazGenericaGestionDeudaWS"
create_secret "VITE_CEA_SOAP_READINGS_URL" "/aquacis-cea/services/InterfazOficinaVirtualClientesWS"
create_secret "VITE_CEA_SOAP_RECEIPT_URL" "/aquacis-cea/services/InterfazOficinaVirtualClientesWS"
create_secret "VITE_CEA_API_USERNAME" "WSGESTIONDEUDA"
create_secret "VITE_CEA_API_PASSWORD" "WSGESTIONDEUDA"
create_secret "VITE_CEA_WSS_PASSWORD_TYPE" "PasswordText"

echo ""
echo "🔑 Granting IAM permissions..."

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Grant Cloud Build access to secrets
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

# Grant Cloud Build permission to deploy to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin" \
  --condition=None

# Grant Cloud Build permission to act as compute service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

# Grant Cloud Run service account access to secrets
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next step - run Cloud Build:"
echo "   cd /Users/enayala/Developer/ceaAgent/ticket-ace-portal-10225"
echo "   gcloud builds submit --config cloudbuild.yaml --project=$PROJECT_ID"
