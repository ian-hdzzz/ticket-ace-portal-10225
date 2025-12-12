# Guía Rápida: Crear Reportes Personalizados

## 🚀 Inicio Rápido

### Paso 1: Acceder al Módulo
1. Abre el sidebar
2. Haz clic en **"Reportes"** (ícono de gráficas)
3. Llegarás a la vista de Crear Reportes

### Paso 2: Configurar Filtros
```
📅 Fecha Inicio: 01/12/2025
📅 Fecha Fin: 11/12/2025
📊 Estado: Todos
⚡ Prioridad: Todos
```

### Paso 3: Agregar Primera Gráfica
1. Clic en **"Agregar Gráfica"**
2. Selecciona **Campo**: Estado
3. Selecciona **Tipo**: Gráfico de Pastel
4. Título (opcional): "Distribución por Estado"
5. Clic en **"Agregar Gráfica"**

### Paso 4: Agregar Más Gráficas
Repite el paso 3 con diferentes configuraciones:
- Prioridad (Barras)
- Canal (Pastel)
- Asignado a (Barras)

### Paso 5: Descargar Reporte
1. Clic en **"Descargar PDF"**
2. El reporte se descargará automáticamente

---

## 📊 Plantillas de Reportes Recomendadas

### 1. Reporte Semanal de Performance

**Objetivo**: Ver el rendimiento del equipo en la última semana

**Filtros**:
- Fecha: Últimos 7 días
- Estado: Todos
- Prioridad: Todos

**Gráficas**:
1. **Estado** (Pastel): Proporción de tickets abiertos, en proceso, resueltos
2. **Prioridad** (Barras): Urgencia de los tickets
3. **Asignado a** (Barras): Carga de trabajo por agente
4. **Canal** (Pastel): Canales más utilizados

**Frecuencia**: Generar cada lunes

---

### 2. Reporte Mensual Ejecutivo

**Objetivo**: Presentación para gerencia

**Filtros**:
- Fecha: Mes completo
- Estado: Todos
- Prioridad: Todos

**Gráficas**:
1. **Estado** (Pastel): Resumen general
2. **Prioridad** (Pastel): Distribución de urgencias
3. **Grupo Asignación** (Barras): Departamentos más activos
4. **Canal** (Barras): Análisis de canales de contacto

**Frecuencia**: Primer día del mes siguiente

---

### 3. Reporte de Tickets Urgentes

**Objetivo**: Monitorear tickets críticos

**Filtros**:
- Fecha: Últimos 30 días
- Estado: Abierto, En Proceso, Escalado
- Prioridad: Alta, Urgente

**Gráficas**:
1. **Estado** (Barras): Estado de tickets urgentes
2. **Asignado a** (Barras): Quién maneja los urgentes
3. **Grupo Asignación** (Pastel): Qué área tiene más urgentes
4. **Canal** (Pastel): De dónde vienen los urgentes

**Frecuencia**: Diario

---

### 4. Reporte de Satisfacción del Cliente

**Objetivo**: Analizar experiencia del cliente

**Filtros**:
- Fecha: Último mes
- Estado: Resuelto, Cerrado
- Prioridad: Todos

**Gráficas**:
1. **Nombre Cliente** (Barras): Top 10 clientes con más tickets
2. **Canal** (Pastel): Canal preferido
3. **Grupo Asignación** (Barras): Qué departamento atiende más
4. **Estado** (Pastel): Proporción de resueltos vs cerrados

**Frecuencia**: Mensual

---

### 5. Reporte de Análisis de Canales

**Objetivo**: Optimizar recursos por canal

**Filtros**:
- Fecha: Últimos 90 días
- Estado: Todos
- Prioridad: Todos

**Gráficas**:
1. **Canal** (Pastel): Distribución total
2. **Canal + Estado** (Barras): Estado por canal
3. **Canal + Prioridad** (Barras): Urgencia por canal
4. **Canal + Grupo** (Barras): Asignación por canal

**Frecuencia**: Trimestral

---

## 💡 Tips y Mejores Prácticas

### Selección de Tipo de Gráfico

**Usa Gráficos de Pastel cuando**:
- ✅ Quieres ver proporciones del total
- ✅ Tienes 2-7 categorías
- ✅ Necesitas ver distribución porcentual
- ✅ Ejemplo: Estado, Prioridad, Canal

**Usa Gráficos de Barras cuando**:
- ✅ Quieres comparar cantidades
- ✅ Tienes más de 7 categorías
- ✅ Necesitas ver valores exactos
- ✅ Ejemplo: Asignado a, Cliente, Contrato

### Combinaciones Recomendadas

```
📊 + 🥧 = Análisis Completo
```

**Buena Combinación**:
- Estado (Pastel) + Prioridad (Barras)
- Canal (Pastel) + Grupo Asignación (Barras)
- Asignado a (Barras) + Estado (Pastel)

**Evitar**:
- Demasiadas gráficas de pastel (difícil comparar)
- Solo gráficas de barras de categorías similares

### Optimización de Filtros

**Para Análisis Rápido**:
```
Fecha: Última semana
Estado: Todos
Prioridad: Todos
→ 2-3 gráficas máximo
```

**Para Análisis Profundo**:
```
Fecha: Último mes o más
Estado: Específico (ej: Abierto)
Prioridad: Específico (ej: Alta)
→ 4-6 gráficas
```

### Nomenclatura de Títulos

**❌ Títulos Genéricos**:
- "Gráfico 1"
- "Análisis"
- "Estado"

**✅ Títulos Descriptivos**:
- "Estado de Tickets - Diciembre 2025"
- "Carga de Trabajo por Agente"
- "Tickets Urgentes por Departamento"

---

## 🎨 Interpretación de Gráficas

### Gráfico de Estado (Pastel)

```
🟦 Abierto (40%)      → Tickets nuevos sin atender
🟨 En Proceso (30%)   → Tickets siendo trabajados
🟩 Resuelto (20%)     → Tickets solucionados
⚪ Cerrado (10%)      → Tickets finalizados
```

**Análisis**:
- Alto % de Abierto → Necesita más recursos
- Alto % En Proceso → Equipo activo
- Alto % Resuelto → Buen desempeño
- Bajo % Cerrado → Revisar proceso de cierre

### Gráfico de Prioridad (Barras)

```
🟢 Baja   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 60
🟡 Media  ▓▓▓▓▓▓▓▓▓▓▓▓ 30
🟠 Alta   ▓▓▓▓▓ 15
🔴 Urgente ▓▓ 5
```

**Análisis**:
- Mayoría Baja/Media → Operación normal
- Alto número Urgente → Crisis o mal triaje
- Aumentando Alta/Urgente → Problemas sistémicos

### Gráfico de Asignado a (Barras)

```
Juan    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 45
María   ▓▓▓▓▓▓▓▓▓▓▓▓ 35
Pedro   ▓▓▓▓▓▓▓ 20
```

**Análisis**:
- Distribución uniforme → Buena carga
- Un agente mucho más → Sobrecarga o especialización
- Un agente mucho menos → Subutilización o nuevo

---

## 🐛 Solución de Problemas

### Problema: "No se cargan los tickets"
**Solución**:
1. Verifica tu conexión a internet
2. Haz clic en "Actualizar Datos"
3. Recarga la página (F5)

### Problema: "Gráfica vacía"
**Solución**:
1. Revisa los filtros (puede que no haya datos para esos criterios)
2. Amplía el rango de fechas
3. Cambia el estado/prioridad a "Todos"

### Problema: "PDF no se descarga"
**Solución**:
1. Verifica que tengas al menos 1 gráfica agregada
2. Desactiva bloqueadores de pop-ups
3. Intenta con un navegador diferente

### Problema: "Gráfica muy pequeña en PDF"
**Solución**:
- Esto es normal, el PDF optimiza el espacio
- Cada gráfica incluye una tabla con datos exactos

---

## ⌨️ Atajos de Teclado (Próximamente)

```
Ctrl + N    → Nueva gráfica
Ctrl + D    → Descargar PDF
Ctrl + R    → Actualizar datos
Esc         → Cerrar diálogo
Delete      → Eliminar gráfica seleccionada
```

---

## 📱 Versión Móvil

En dispositivos móviles:
- Las gráficas se muestran en 1 columna
- Los filtros son colapsables
- Puedes hacer zoom en las gráficas
- El PDF se genera igual

---

## 🎓 Recursos Adicionales

- 📄 Documentación completa: `/docs/REPORTES_PERSONALIZADOS.md`
- 🎥 Video tutorial: (próximamente)
- 💬 Soporte: Contacta al administrador del sistema

---

**¿Necesitas ayuda?** Pregunta al equipo de soporte o consulta la documentación técnica.
