# Arquitectura del Sistema de Tabs

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   TabProvider                         │  │
│  │  (Contexto Global de Tabs)                           │  │
│  │                                                        │  │
│  │  Estado:                                              │  │
│  │  - tabs: []                                           │  │
│  │  - activeTabId: string                                │  │
│  │                                                        │  │
│  │  Funciones:                                           │  │
│  │  - addTab()                                           │  │
│  │  - removeTab()                                        │  │
│  │  - setActiveTab()                                     │  │
│  │  - updateTab()                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                  │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TicketsWithTabs                          │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │           TabBar                              │   │  │
│  │  │  ┌──────┐  ┌──────┐  ┌──────┐               │   │  │
│  │  │  │ Tab1 │  │ Tab2 │  │ Tab3 │  ...          │   │  │
│  │  │  └──────┘  └──────┘  └──────┘               │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Contenido del Tab Activo              │   │  │
│  │  │                                                │   │  │
│  │  │  Tipo tickets-list  ─────▶ <Tickets />       │   │  │
│  │  │  Tipo ticket-detail ─────▶ <TicketDetails /> │   │  │
│  │  │  Tipo new-ticket    ─────▶ <CreateTicket />  │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Interacciones del Usuario

### 1. Abrir un Ticket
```
Usuario hace clic en ticket
         │
         ▼
Tickets.tsx llama addTab()
         │
         ▼
TabContext agrega nuevo tab
         │
         ▼
TabBar re-renderiza con nuevo tab
         │
         ▼
TicketsWithTabs renderiza TicketDetails
```

### 2. Cerrar un Tab
```
Usuario hace clic en X del tab
         │
         ▼
TabBar llama removeTab()
         │
         ▼
TabContext elimina el tab
         │
         ▼
TabContext activa tab anterior
         │
         ▼
TicketsWithTabs renderiza nuevo contenido activo
```

### 3. Cambiar de Tab
```
Usuario hace clic en tab diferente
         │
         ▼
TabBar llama setActiveTab()
         │
         ▼
TabContext actualiza activeTabId
         │
         ▼
TicketsWithTabs renderiza nuevo contenido
```

## Estructura de un Tab

```typescript
interface Tab {
  id: string;           // Identificador único (ej: 'ticket-123')
  type: 'tickets-list'  // Tipo de contenido a mostrar
      | 'ticket-detail'
      | 'new-ticket';
  title: string;        // Título mostrado en la pestaña
  ticketId?: string;    // ID del ticket (para ticket-detail)
  data?: any;           // Datos adicionales opcionales
}
```

## Ejemplo de Estado

```typescript
{
  tabs: [
    {
      id: 'tickets-list',
      type: 'tickets-list',
      title: 'Lista de Tickets'
    },
    {
      id: 'ticket-TKT-001',
      type: 'ticket-detail',
      title: 'TKT-001',
      ticketId: '1'
    },
    {
      id: 'new-ticket',
      type: 'new-ticket',
      title: 'Nuevo Ticket'
    },
    {
      id: 'ticket-TKT-045',
      type: 'ticket-detail',
      title: 'TKT-045',
      ticketId: '45'
    }
  ],
  activeTabId: 'ticket-TKT-045'
}
```

## Ventajas del Diseño

1. **Centralizado**: Todo el estado de tabs en un solo lugar
2. **Reutilizable**: Cualquier componente puede usar el contexto
3. **Predecible**: Flujo de datos unidireccional
4. **Escalable**: Fácil agregar nuevos tipos de tabs
5. **Mantenible**: Lógica separada en componentes específicos
