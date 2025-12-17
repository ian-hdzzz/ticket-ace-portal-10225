# Sistema de Tabs para la Gestión de Tickets

## Descripción

Se ha implementado un sistema de tabs (pestañas) que permite al usuario abrir múltiples tickets, crear nuevos tickets y navegar entre ellos sin perder el contexto. Esto mejora significativamente la experiencia del usuario al permitir trabajar con múltiples tickets simultáneamente.

## Características

### 1. **Navegación por Tabs**
- Los usuarios pueden abrir múltiples tickets en tabs separados
- Cada tab mantiene su propio estado independiente
- Fácil cambio entre tabs con un solo clic

### 2. **Tipos de Tabs**
- **Lista de Tickets** (principal): Siempre visible, no se puede cerrar
- **Detalle de Ticket**: Se abre al hacer clic en un ticket de la lista
- **Nuevo Ticket**: Se abre al hacer clic en "Nuevo Ticket"

### 3. **Gestión de Tabs**
- Cierre de tabs individual (excepto la lista principal)
- Indicador visual del tab activo
- Iconos distintivos para cada tipo de tab
- Títulos descriptivos (número de ticket o "Nuevo Ticket")

## Arquitectura

### Componentes Principales

#### 1. `TabContext` (`src/contexts/TabContext.tsx`)
Contexto de React que maneja el estado global de los tabs:
```typescript
- tabs: Tab[] - Lista de todos los tabs abiertos
- activeTabId: string - ID del tab actualmente activo
- addTab(tab: Tab) - Agrega un nuevo tab o activa uno existente
- removeTab(tabId: string) - Cierra un tab
- setActiveTab(tabId: string) - Cambia al tab especificado
- updateTab(tabId: string, updates) - Actualiza propiedades de un tab
```

#### 2. `TabBar` (`src/components/TabBar.tsx`)
Componente visual que muestra la barra de tabs:
- Renderiza todos los tabs disponibles
- Maneja la interacción del usuario (clic, cerrar)
- Muestra iconos y títulos
- Indicador visual del tab activo

#### 3. `TicketsWithTabs` (`src/components/TicketsWithTabs.tsx`)
Contenedor principal que integra la barra de tabs con el contenido:
- Renderiza el TabBar
- Renderiza el contenido del tab activo
- Maneja la lógica de qué componente mostrar según el tipo de tab

### Modificaciones en Componentes Existentes

#### `Tickets.tsx`
- Usa `useTabContext()` para agregar tabs
- Al hacer clic en un ticket, abre un nuevo tab en lugar de navegar
- El botón "Nuevo Ticket" abre un tab en lugar de navegar

#### `TicketDetails.tsx`
- Acepta un prop opcional `ticketId` para funcionar dentro de un tab
- Mantiene compatibilidad con la navegación tradicional (rutas directas)
- Botón de retorno cierra el tab o navega según el contexto

#### `CreateTicket.tsx`
- Cierra el tab al crear exitosamente un ticket
- Botón de cancelar cierra el tab y regresa a la lista

## Uso

### Para el Usuario Final

1. **Abrir un Ticket en Tab**:
   - Haz clic en cualquier ticket de la lista
   - Se abrirá automáticamente en un nuevo tab

2. **Crear un Nuevo Ticket**:
   - Haz clic en "Nuevo Ticket"
   - Se abrirá un formulario en un nuevo tab

3. **Navegar entre Tabs**:
   - Haz clic en la pestaña que deseas ver
   - El contenido cambiará instantáneamente

4. **Cerrar un Tab**:
   - Hover sobre el tab que deseas cerrar
   - Haz clic en la "X" que aparece
   - El tab anterior se activará automáticamente

### Para Desarrolladores

#### Agregar un Nuevo Tab
```typescript
import { useTabContext } from '@/contexts/TabContext';

const { addTab } = useTabContext();

addTab({
  id: 'unique-id',
  type: 'ticket-detail',
  title: 'TKT-123',
  ticketId: '123',
  data: { /* datos adicionales */ }
});
```

#### Cerrar un Tab
```typescript
const { removeTab, setActiveTab } = useTabContext();

// Cerrar y volver a la lista
removeTab('ticket-123');
setActiveTab('tickets-list');
```

#### Actualizar un Tab
```typescript
const { updateTab } = useTabContext();

updateTab('ticket-123', {
  title: 'Nuevo Título'
});
```

## Ventajas

1. **Multitarea**: Los usuarios pueden trabajar con múltiples tickets simultáneamente
2. **Contexto Preservado**: Cada tab mantiene su estado (formularios, scroll, etc.)
3. **Navegación Rápida**: Cambio instantáneo entre tickets sin recargar
4. **UX Mejorada**: Interfaz familiar similar a navegadores web
5. **Productividad**: Menor tiempo perdido en navegación

## Consideraciones Técnicas

- **Memoria**: Cada tab abierto consume memoria; considerar límite de tabs
- **Estado**: Usar React Query para cachear datos y evitar peticiones duplicadas
- **Performance**: Los tabs inactivos no se desmontarán (mantienen estado)
- **Accesibilidad**: Soporte para navegación con teclado (Tab, Enter, Esc)

## Mejoras Futuras

- [ ] Límite máximo de tabs abiertos
- [ ] Atajos de teclado (Ctrl+W para cerrar, Ctrl+Tab para cambiar)
- [ ] Persistencia de tabs en localStorage
- [ ] Arrastrar y soltar para reordenar tabs
- [ ] Indicador de cambios sin guardar
- [ ] Scroll horizontal mejorado para muchos tabs
- [ ] Menú contextual (clic derecho) con opciones adicionales
