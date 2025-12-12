# Sistema de Reportes Personalizados

## Descripción

El módulo de **Crear Reportes** permite a los usuarios generar reportes visuales personalizados con múltiples gráficas de barras y pastel, con filtros avanzados para analizar los tickets del sistema.

## Ubicación

- **Ruta**: `/dashboard/crear-reportes`
- **Sidebar**: Nuevo ítem "Reportes" con ícono de gráficas
- **Archivo**: `src/pages/CrearReportes.tsx`

## Características Principales

### 1. **Filtros de Datos**
Los usuarios pueden filtrar los datos que se mostrarán en todas las gráficas:

- **Rango de Fechas**: Inicio y fin del período a analizar
- **Estado**: Filtrar por estado específico de tickets
- **Prioridad**: Filtrar por nivel de prioridad
- **Visualización**: Muestra el total de tickets filtrados vs tickets totales

#### Acciones de Filtros:
- **Limpiar Filtros**: Restaura los filtros a valores por defecto
- **Actualizar Datos**: Recarga los tickets desde la base de datos

### 2. **Gráficas Personalizadas**

#### Agregar Gráficas
Los usuarios pueden agregar múltiples gráficas configurando:

1. **Campo a Analizar**: Selecciona qué campo del ticket visualizar
   - Número de Ticket
   - Estado
   - Prioridad
   - Canal
   - Grupo de Asignación
   - Asignado a
   - Nombre del Cliente
   - Número de Contrato
   - Y más...

2. **Tipo de Gráfico**: 
   - 📊 Gráfico de Barras
   - 🥧 Gráfico de Pastel

3. **Título Personalizado**: Opcionalmente nombra tu gráfica

#### Características de cada Gráfica:
- **Visualización Interactiva**: Tooltips con información detallada
- **Código de Colores**: Colores distintivos para cada categoría
- **Tabla de Resumen**: Debajo de cada gráfica se muestra:
  - Nombre de la categoría
  - Cantidad de tickets
  - Porcentaje del total
- **Eliminar**: Botón para remover la gráfica

### 3. **Vista de Cuadrícula**

Las gráficas se organizan en una cuadrícula responsiva:
- **Desktop**: 2 columnas
- **Tablet/Mobile**: 1 columna
- **Altura fija**: 300px por gráfica + tabla resumen
- **Scroll**: Vista desplazable para múltiples gráficas

### 4. **Compartir y Exportar**

#### Compartir Reporte
El botón de **Compartir** ofrece múltiples opciones:

1. **Copiar Enlace**:
   - Genera un enlace con la configuración del reporte
   - Incluye las gráficas y filtros aplicados
   - Permite recrear el reporte exacto

2. **Compartir por Email**:
   - Abre el cliente de correo predeterminado
   - Pre-rellena el asunto y cuerpo con información del reporte
   - Incluye resumen de tickets y gráficas

3. **Exportar a PDF y Compartir**:
   - Descarga el PDF y abre opciones para compartir el archivo

#### Exportación a PDF
Genera un reporte completo en PDF con:
- **Portada** con información general:
  - Fecha de generación
  - Período analizado
  - Total de tickets
  - Filtros aplicados
- **Todas las gráficas** capturadas en alta calidad
- **Múltiples páginas**: Una página por gráfica si es necesario

## Flujo de Uso

```
1. Usuario accede a "Reportes" desde el sidebar
2. Configura filtros de fecha, estado y prioridad
3. Hace clic en "Agregar Gráfica"
4. Selecciona campo, tipo de gráfico y título
5. La gráfica aparece en la cuadrícula
6. Repite pasos 3-5 para agregar más gráficas
7. Comparte el reporte o lo exporta como PDF
   - Compartir: Genera enlace, email o descarga
   - Exportar PDF: Descarga documento completo
```

## Casos de Uso

### Análisis de Performance
```
Gráficas sugeridas:
- Estado (Pastel): Ver distribución de tickets por estado
- Prioridad (Barras): Analizar urgencia de tickets
- Asignado a (Barras): Carga de trabajo por agente
```

### Análisis de Canales
```
Gráficas sugeridas:
- Canal (Pastel): De dónde vienen los tickets
- Grupo Asignación (Barras): Qué departamentos reciben más tickets
```

### Análisis de Clientes
```
Gráficas sugeridas:
- Nombre Cliente (Barras): Top clientes con más tickets
- Número Contrato (Barras): Contratos con más incidencias
```

### Reporte Ejecutivo
```
Configuración:
- Filtro: Último mes
- Gráficas:
  1. Estado (Pastel)
  2. Prioridad (Barras)
  3. Canal (Pastel)
  4. Grupo Asignación (Barras)
- Exportar a PDF para presentación
```

## Interfaz

### Sección de Filtros
```
┌─────────────────────────────────────────────┐
│ 🔍 Filtros de Datos                         │
├─────────────────────────────────────────────┤
│ Fecha Inicio: [________] Fecha Fin: [______]│
│ Estado: [Todos ▼]  Prioridad: [Todos ▼]    │
│                                              │
│ Mostrando 45 de 120 tickets                 │
│ [Limpiar Filtros] [Actualizar Datos]       │
└─────────────────────────────────────────────┘
```

### Encabezado de Gráficas
```
┌─────────────────────────────────────────────┐
│ Gráficas Personalizadas                     │
│ 3 gráficas agregadas                        │
│                                              │
│   [🔗 Compartir] [📥 Exportar PDF] [➕ Agregar]  │
└─────────────────────────────────────────────┘
```

### Cuadrícula de Gráficas
```
┌──────────────────┐ ┌──────────────────┐
│ 📊 Estado        │ │ 🥧 Prioridad     │
│ [Gráfico]        │ │ [Gráfico]        │
│ [Tabla]      [🗑]│ │ [Tabla]      [🗑]│
└──────────────────┘ └──────────────────┘
┌──────────────────┐ ┌──────────────────┐
│ 📊 Canal         │ │ 📊 Asignado a    │
│ [Gráfico]        │ │ [Gráfico]        │
│ [Tabla]      [🗑]│ │ [Tabla]      [🗑]│
└──────────────────┘ └──────────────────┘
```

## Ventajas

✅ **Flexibilidad**: Crea los reportes que necesites, cuando los necesites
✅ **Múltiples Vistas**: Compara diferentes métricas simultáneamente
✅ **Filtros Dinámicos**: Los datos se actualizan automáticamente al cambiar filtros
✅ **Compartir Fácil**: Enlace directo, email o PDF para compartir
✅ **Exportación Profesional**: PDFs listos para presentar
✅ **Sin Límites**: Agrega tantas gráficas como necesites
✅ **Interactivo**: Tooltips y tablas para análisis detallado
✅ **Responsive**: Funciona en desktop, tablet y móvil

## Diferencias con las Gráficas de Tickets

| Característica | Gráficas en Tickets | Crear Reportes |
|----------------|---------------------|----------------|
| Cantidad de gráficas | 1 a la vez | Múltiples simultáneas |
| Persistencia | Temporal (modal) | Permanente en vista |
| Comparación | No disponible | Sí, lado a lado |
| Filtros | Por gráfica | Globales para todas |
| Compartir | No | Sí, enlace y email |
| Exportación | Una gráfica | Todas juntas en PDF |
| Personalización | Limitada | Completa |

## Tecnologías Utilizadas

- **React**: Componente funcional con hooks
- **Recharts**: Librería de gráficos
- **jsPDF**: Generación de PDFs
- **html2canvas**: Captura de gráficos
- **Supabase**: Base de datos
- **Shadcn/ui**: Componentes de UI

## Mejoras Futuras

- [ ] Guardar configuraciones de reportes
- [ ] Plantillas predefinidas de reportes
- [ ] Programar generación automática de reportes
- [ ] Compartir reportes por email
- [ ] Exportar a Excel/CSV
- [ ] Gráficos de líneas para tendencias temporales
- [ ] Comparación entre períodos
- [ ] Anotaciones personalizadas en gráficas
- [ ] Drag & drop para reordenar gráficas
- [ ] Zoom y pan en gráficas

## Permisos Requeridos

- `ver_tickets` o `view_tickets`: Para acceder a la vista de reportes

## Soporte

Para consultas sobre el uso del módulo de reportes, contacta al equipo de desarrollo o consulta la documentación técnica en `/docs`.
