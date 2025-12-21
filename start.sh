#!/bin/bash

# 🚀 Script de Inicio Rápido para Docker + GCP
# Este script te guiará paso a paso en el proceso

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}║      🚀 TICKET ACE - CONFIGURACIÓN DOCKER & GCP       ║${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para pausar
pause() {
    echo ""
    read -p "Presiona Enter para continuar..."
    echo ""
}

# Función para preguntar
ask() {
    local question=$1
    local default=$2
    read -p "$question [$default]: " answer
    echo "${answer:-$default}"
}

echo -e "${BLUE}¿Qué quieres hacer?${NC}"
echo ""
echo "  1) 🧪 Probar Docker localmente (recomendado para empezar)"
echo "  2) ☁️  Desplegar en GCP Cloud Run"
echo "  3) 📊 Ver documentación"
echo "  4) ❌ Salir"
echo ""

read -p "Selecciona una opción [1-4]: " option

case $option in
    1)
        echo ""
        echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
        echo -e "${CYAN}  OPCIÓN 1: PRUEBA LOCAL CON DOCKER${NC}"
        echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
        echo ""
        
        # Verificar Docker
        echo -e "${BLUE}📦 Verificando Docker...${NC}"
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker no está instalado${NC}"
            echo "Instálalo desde: https://docs.docker.com/get-docker/"
            exit 1
        fi
        echo -e "${GREEN}✅ Docker está instalado${NC}"
        
        pause
        
        # Verificar .env
        echo -e "${BLUE}🔐 Verificando variables de entorno...${NC}"
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}⚠️  No se encontró archivo .env${NC}"
            echo "Creando desde .env.example..."
            cp .env.example .env
            echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con tus valores reales${NC}"
            echo ""
            read -p "¿Quieres editar .env ahora? [y/N]: " edit_env
            if [[ $edit_env =~ ^[Yy]$ ]]; then
                ${EDITOR:-nano} .env
            fi
        else
            echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
        fi
        
        pause
        
        # Preguntar método
        echo -e "${BLUE}¿Qué método prefieres?${NC}"
        echo "  1) Docker Compose (más fácil - ambos servicios a la vez)"
        echo "  2) Construir imágenes individuales"
        echo ""
        read -p "Selecciona [1-2]: " method
        
        if [ "$method" = "1" ]; then
            echo ""
            echo -e "${BLUE}🐳 Iniciando con Docker Compose...${NC}"
            docker-compose up -d
            
            echo ""
            echo -e "${GREEN}✅ Servicios iniciados!${NC}"
            echo ""
            echo -e "${CYAN}Accede a:${NC}"
            echo -e "  🌐 Frontend: ${GREEN}http://localhost:8080${NC}"
            echo -e "  🔌 Backend:  ${GREEN}http://localhost:3000${NC}"
            echo ""
            echo -e "${YELLOW}Para ver logs:${NC} docker-compose logs -f"
            echo -e "${YELLOW}Para detener:${NC} docker-compose down"
            
        else
            echo ""
            echo -e "${BLUE}🔨 Construyendo imágenes...${NC}"
            ./scripts/build-local.sh
            
            echo ""
            echo -e "${GREEN}✅ Imágenes construidas!${NC}"
            echo ""
            echo -e "${YELLOW}Para ejecutar Backend:${NC}"
            echo "  docker run -p 8080:8080 --env-file .env ticket-ace-backend:local"
            echo ""
            echo -e "${YELLOW}Para ejecutar Frontend:${NC}"
            echo "  docker run -p 8081:8080 ticket-ace-frontend:local"
        fi
        ;;
        
    2)
        echo ""
        echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
        echo -e "${CYAN}  OPCIÓN 2: DESPLEGAR EN GCP CLOUD RUN${NC}"
        echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
        echo ""
        
        # Verificar gcloud
        echo -e "${BLUE}☁️  Verificando Google Cloud CLI...${NC}"
        if ! command -v gcloud &> /dev/null; then
            echo -e "${RED}❌ Google Cloud CLI no está instalado${NC}"
            echo ""
            echo "Instálalo con:"
            echo "  brew install --cask google-cloud-sdk"
            echo ""
            echo "O descarga desde: https://cloud.google.com/sdk/docs/install"
            exit 1
        fi
        echo -e "${GREEN}✅ Google Cloud CLI está instalado${NC}"
        
        pause
        
        # Obtener PROJECT_ID
        echo -e "${BLUE}📋 Configuración del proyecto${NC}"
        echo ""
        CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
        PROJECT_ID=$(ask "ID del proyecto de GCP" "$CURRENT_PROJECT")
        
        if [ -z "$PROJECT_ID" ]; then
            echo -e "${RED}❌ PROJECT_ID es requerido${NC}"
            exit 1
        fi
        
        REGION=$(ask "Región de GCP" "us-central1")
        
        pause
        
        # Verificar autenticación
        echo -e "${BLUE}🔐 Verificando autenticación...${NC}"
        if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
            echo -e "${YELLOW}⚠️  No estás autenticado${NC}"
            echo "Ejecutando: gcloud auth login"
            gcloud auth login
        fi
        echo -e "${GREEN}✅ Autenticado correctamente${NC}"
        
        pause
        
        # Configurar secrets
        echo -e "${BLUE}🔐 ¿Quieres configurar los secrets ahora?${NC}"
        read -p "Configurar secrets en GCP Secret Manager? [y/N]: " setup_secrets
        
        if [[ $setup_secrets =~ ^[Yy]$ ]]; then
            ./scripts/setup-secrets.sh "$PROJECT_ID"
            pause
        fi
        
        # Confirmar despliegue
        echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}RESUMEN:${NC}"
        echo -e "${YELLOW}  Proyecto: ${PROJECT_ID}${NC}"
        echo -e "${YELLOW}  Región:   ${REGION}${NC}"
        echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
        echo ""
        read -p "¿Confirmas el despliegue? [y/N]: " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${BLUE}🚀 Iniciando despliegue...${NC}"
            ./scripts/deploy-gcp.sh "$PROJECT_ID" "$REGION"
        else
            echo -e "${YELLOW}Despliegue cancelado${NC}"
        fi
        ;;
        
    3)
        echo ""
        echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
        echo -e "${CYAN}  DOCUMENTACIÓN${NC}"
        echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${BLUE}📚 Archivos de documentación disponibles:${NC}"
        echo ""
        echo -e "  📄 ${GREEN}README.md${NC} - Visión general del proyecto"
        echo -e "  📄 ${GREEN}DEPLOYMENT.md${NC} - Guía detallada de despliegue"
        echo ""
        echo -e "${YELLOW}Abre estos archivos en tu editor de código para más información${NC}"
        ;;
        
    4)
        echo ""
        echo -e "${CYAN}👋 ¡Hasta luego!${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ PROCESO COMPLETADO${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
