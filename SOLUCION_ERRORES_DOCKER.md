# 🔧 Solución de Problemas Comunes - Docker Build

## ❌ Error: "input/output error" durante `npm ci`

Este error ocurre cuando Docker BuildKit tiene problemas con su cache o almacenamiento.

### Solución 1: Limpiar el cache de Docker (Recomendado)

```bash
# Detener todos los contenedores
docker stop $(docker ps -aq) 2>/dev/null || true

# Limpiar todo el sistema de Docker
docker system prune -a --volumes -f

# Reiniciar Docker Desktop
# En macOS: Click en el icono de Docker en la barra de menú > Restart
```

Después de reiniciar Docker, intenta construir de nuevo:

```bash
cd /Users/ian.hdzzz/ticket-ace-portal-10225/Frontend
docker build -t ticket-ace-frontend:local .
```

### Solución 2: Construir sin BuildKit

Si la Solución 1 no funciona, desactiva BuildKit temporalmente:

```bash
cd /Users/ian.hdzzz/ticket-ace-portal-10225/Frontend
DOCKER_BUILDKIT=0 docker build -t ticket-ace-frontend:local .
```

### Solución 3: Construir sin cache

```bash
cd /Users/ian.hdzzz/ticket-ace-portal-10225/Frontend
docker build --no-cache -t ticket-ace-frontend:local .
```

### Solución 4: Aumentar recursos de Docker Desktop

1. Abre Docker Desktop
2. Ve a Settings (⚙️) > Resources
3. Aumenta:
   - **Memory**: Al menos 4GB (recomendado 6GB)
   - **Disk image size**: Al menos 60GB
4. Click en "Apply & Restart"

Luego intenta construir de nuevo.

### Solución 5: Usar package-lock.json en lugar de npm ci

Si el problema persiste con `npm ci`, puedes modificar temporalmente el Dockerfile:

```bash
cd /Users/ian.hdzzz/ticket-ace-portal-10225/Frontend
```

Edita el `dockerfile` y cambia `RUN npm ci` por `RUN npm install`:

```bash
# Abre el archivo
code dockerfile

# O con nano
nano dockerfile
```

Cambia la línea 12 de:
```dockerfile
RUN npm ci
```

A:
```dockerfile
RUN npm install --legacy-peer-deps
```

Guarda y construye de nuevo:

```bash
docker build -t ticket-ace-frontend:local .
```

---

## 🔄 Proceso Completo de Limpieza

Si ninguna solución funciona, haz una limpieza profunda:

```bash
# 1. Detener todos los contenedores
docker stop $(docker ps -aq) 2>/dev/null || true

# 2. Eliminar todos los contenedores
docker rm $(docker ps -aq) 2>/dev/null || true

# 3. Eliminar todas las imágenes
docker rmi $(docker images -q) 2>/dev/null || true

# 4. Limpiar volúmenes
docker volume prune -f

# 5. Limpiar networks
docker network prune -f

# 6. Limpiar build cache
docker builder prune -a -f

# 7. Reiniciar Docker Desktop
# Click en el icono de Docker > Restart

# 8. Intentar construir de nuevo
cd /Users/ian.hdzzz/ticket-ace-portal-10225/Frontend
docker build -t ticket-ace-frontend:local .
```

---

## ✅ Verificar que Docker está funcionando bien

Antes de construir tu imagen, verifica que Docker está saludable:

```bash
# Ver información del sistema
docker system df

# Verificar que Docker responde
docker run --rm hello-world

# Ver recursos disponibles
docker system info | grep -E "CPUs|Total Memory|Docker Root Dir"
```

---

## 🐛 Otros Errores Comunes

### Error: "npm WARN using --force"

No es un error, solo un warning. Puedes ignorarlo.

### Error: "ENOSPC: no space left on device"

Tu disco está lleno. Libera espacio:

```bash
# Ver uso de espacio de Docker
docker system df -v

# Limpiar imágenes no usadas
docker image prune -a
```

### Error: "Cannot connect to the Docker daemon"

Docker Desktop no está corriendo. Ábrelo desde Aplicaciones.

### Error: "manifest for node:20-alpine not found"

Problema de red. Verifica tu conexión a internet.

---

## 📝 Comando Actual Recomendado

Basándome en tu error, ejecuta esto:

```bash
# 1. Limpia Docker
docker system prune -a -f
docker builder prune -a -f

# 2. Reinicia Docker Desktop manualmente
# (Click en icono de Docker > Restart)

# 3. Espera 30 segundos después del reinicio

# 4. Construye de nuevo
cd /Users/ian.hdzzz/ticket-ace-portal-10225/Frontend
docker build -t ticket-ace-frontend:local .
```

Si sigue fallando, usa este comando alternativo:

```bash
cd /Users/ian.hdzzz/ticket-ace-portal-10225/Frontend
DOCKER_BUILDKIT=0 docker build --no-cache -t ticket-ace-frontend:local .
```

---

## 💡 Consejo

El error "input/output error" generalmente se soluciona reiniciando Docker Desktop. Es el método más confiable.
