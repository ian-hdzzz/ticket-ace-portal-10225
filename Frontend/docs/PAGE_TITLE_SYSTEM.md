# Sistema de Títulos Dinámicos en el Header

## Descripción

El sistema de títulos dinámicos permite que cada página del dashboard muestre automáticamente su título y descripción en el header principal, ubicado en la parte superior derecha del layout.

## Arquitectura

### Componentes Principales

1. **PageContext** (`src/contexts/PageContext.tsx`)
   - Contexto de React que gestiona el título y descripción global
   - Provee funciones para actualizar estos valores

2. **usePageTitle Hook** (`src/hooks/usePageTitle.ts`)
   - Hook personalizado que simplifica el uso del contexto
   - Actualiza automáticamente el título cuando el componente se monta

3. **DashboardLayout** (`src/components/layout/DashboardLayout.tsx`)
   - Layout principal que consume el contexto
   - Muestra el título y descripción en el header

## Uso

### En cualquier página del dashboard:

```tsx
import { usePageTitle } from "@/hooks/usePageTitle";

export default function MiPagina() {
  // Establecer título y descripción
  usePageTitle("Título de la Página", "Descripción de la página");
  
  return (
    <div>
      {/* Tu contenido sin necesidad de repetir el título */}
    </div>
  );
}
```

### Para títulos dinámicos (basados en datos):

```tsx
import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function DetalleItem() {
  const [pageTitle, setPageTitle] = useState("Cargando...");
  
  // Hook que se actualiza cuando cambia pageTitle
  usePageTitle(pageTitle, "Información detallada");
  
  useEffect(() => {
    // Cuando cargan los datos, actualizar el título
    fetchData().then(data => {
      setPageTitle(`Item: ${data.nombre}`);
    });
  }, []);
  
  return <div>{/* Contenido */}</div>;
}
```

## Páginas Actualizadas

Las siguientes páginas ya están utilizando este sistema:

- ✅ **Tickets** - "Tickets" / "Gestiona todos los tickets del sistema"
- ✅ **Dashboard** - "Dashboard" / "Resumen general del sistema de tickets"
- ✅ **Agentes IA** - "Agentes IA" / "Configura y administra los agentes de IA"
- ✅ **Configuración** - "Configuración" / "Administra las preferencias de tu cuenta"
- ✅ **Administración** - "Administración" / "Gestión de usuarios del sistema"
- ✅ **Crear Ticket** - "Crear Ticket" / "Registra un nuevo ticket en el sistema"
- ✅ **Detalles del Ticket** - "Ticket {folio}" / "Información completa del ticket" (dinámico)

## Diseño del Header

El header tiene el siguiente diseño:

```
┌─────────────────────────────────────────────────────────────┐
│  [☰] ¡Bienvenido {Nombre}!              Título de la Página │
│       Rol: {rol}                        Descripción breve    │
└─────────────────────────────────────────────────────────────┘
```

- **Izquierda**: Botón del sidebar, nombre de usuario y rol
- **Derecha**: Título y descripción de la sección actual

## Beneficios

1. **Consistencia**: Todos los títulos se muestran en el mismo lugar
2. **Menos Duplicación**: No es necesario repetir títulos en cada página
3. **Flexibilidad**: Fácil de actualizar dinámicamente
4. **Mejor UX**: El usuario siempre sabe dónde está en la aplicación

## Estilos

El título en el header utiliza:
- Font size: `text-2xl`
- Font weight: `font-bold`
- Color: `text-primary`
- Alineación: `text-right`

La descripción utiliza:
- Font size: `text-sm`
- Color: `text-muted-foreground`
- Margen superior: `mt-0.5`
