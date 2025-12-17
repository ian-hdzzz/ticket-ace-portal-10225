# Sistema de Protección de Rutas por Roles y Permisos

Este documento explica cómo funciona el sistema de protección de rutas basado en roles y permisos (RBAC) en el sistema CEA.

## 📋 Tabla de Contenidos

1. [Estructura de Base de Datos](#estructura-de-base-de-datos)
2. [Instalación](#instalación)
3. [Uso en Frontend](#uso-en-frontend)
4. [Matriz de Permisos](#matriz-de-permisos)
5. [Ejemplos](#ejemplos)

## 🗄️ Estructura de Base de Datos

### Tablas Principales

```
cea.users              → Usuarios del sistema
cea.roles              → Roles disponibles (Administrador, Ciudadano, etc.)
cea.privileges         → Privilegios/Permisos individuales
cea.users_roles        → Relación usuarios ↔ roles (many-to-many)
cea.roles_privileges   → Relación roles ↔ privilegios (many-to-many)
```

### Vista Helper

```sql
cea.user_permissions_view  → Vista que combina todas las relaciones
                             para consultas rápidas de permisos
```

### Función Helper

```sql
cea.user_has_privilege(user_id, privilege_name) → Verifica si un usuario
                                                   tiene un permiso específico
```

## 🚀 Instalación

### 1. Configurar Base de Datos en Supabase

Ejecuta el script SQL completo en el SQL Editor de Supabase:

```bash
# El archivo está en:
Frontend/sql/setup_roles_privileges_complete.sql
```

Este script:
- ✅ Verifica y crea las tablas necesarias
- ✅ Recrea las tablas de relación (users_roles, roles_privileges)
- ✅ Inserta todos los privilegios del CSV
- ✅ Asigna permisos a roles según la matriz CSV
- ✅ Configura Row Level Security (RLS)
- ✅ Crea vistas y funciones helper

### 2. Verificar Roles en Supabase

Asegúrate de que existan estos roles en `cea.roles`:
- Ciudadano
- Representante de organización
- Agente de Contacto
- Agente de Área Resolutora
- Coordinador de Área
- Dueño de Proceso / Servicio
- Administrador Funcional
- Administrador Técnico
- Auditor / Transparencia
- Administrador

Si no existen, insértalos manualmente o ejecuta el script de roles.

## 💻 Uso en Frontend

### Hook: `usePermissions`

El hook principal para verificar permisos del usuario actual:

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { 
    permissions,      // Array de permisos del usuario
    roles,           // Array de roles del usuario
    loading,         // Estado de carga
    hasPermission,   // Función para verificar un permiso
    hasAnyPermission, // Verificar si tiene al menos uno
    hasAllPermissions, // Verificar si tiene todos
    hasRole,         // Verificar si tiene un rol
    refetch          // Recargar permisos
  } = usePermissions();

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {hasPermission('crear_ticket') && (
        <button>Crear Ticket</button>
      )}
    </div>
  );
}
```

### Componente: `<ProtectedRoute>`

Protege rutas completas. Si el usuario no tiene permisos, muestra error o redirige:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

// Requiere UN permiso específico
<Route 
  path="tickets/new" 
  element={
    <ProtectedRoute requiredPermission="crear_ticket">
      <CreateTicket />
    </ProtectedRoute>
  } 
/>

// Requiere AL MENOS UNO de varios permisos
<Route 
  path="tickets" 
  element={
    <ProtectedRoute requiredPermissions={["ver_tickets", "view_tickets"]}>
      <Tickets />
    </ProtectedRoute>
  } 
/>

// Requiere TODOS los permisos
<Route 
  path="admin" 
  element={
    <ProtectedRoute 
      requiredPermissions={["access_admin_panel", "asignar_roles"]}
      requireAll={true}
    >
      <Admin />
    </ProtectedRoute>
  } 
/>

// Requiere un ROL específico
<Route 
  path="super-admin" 
  element={
    <ProtectedRoute requiredRole="Administrador">
      <SuperAdmin />
    </ProtectedRoute>
  } 
/>
```

**Props de `<ProtectedRoute>`:**
- `requiredPermission`: String - Un permiso requerido
- `requiredPermissions`: String[] - Múltiples permisos
- `requireAll`: Boolean - Si true, requiere TODOS. Si false, requiere AL MENOS UNO
- `requiredRole`: String - Nombre del rol requerido
- `fallbackPath`: String - Ruta de redirección si no tiene acceso (default: '/dashboard')
- `showError`: Boolean - Mostrar mensaje de error o solo redirigir (default: true)

### Componente: `<PermissionGate>`

Muestra/oculta elementos de UI basado en permisos:

```tsx
import { PermissionGate } from '@/components/PermissionGate';

function TicketActions() {
  return (
    <div>
      {/* Solo muestra el botón si tiene el permiso */}
      <PermissionGate permission="crear_ticket">
        <Button>Crear Ticket</Button>
      </PermissionGate>

      {/* Muestra si tiene al menos uno de los permisos */}
      <PermissionGate permissions={["editar_ticket", "cerrar_ticket"]}>
        <Button>Acciones</Button>
      </PermissionGate>

      {/* Muestra si tiene TODOS los permisos */}
      <PermissionGate 
        permissions={["editar_ticket", "eliminar_ticket"]} 
        requireAll={true}
      >
        <Button variant="destructive">Eliminar</Button>
      </PermissionGate>

      {/* Con fallback (elemento alternativo) */}
      <PermissionGate 
        permission="ver_reportes"
        fallback={<p>No tienes acceso a reportes</p>}
      >
        <ReportesComponent />
      </PermissionGate>
    </div>
  );
}
```

## 📊 Matriz de Permisos

### Privilegios por Módulo

| Módulo | Privilegios |
|--------|-------------|
| **Dashboard** | `acceso_dashboard`, `view_dashboard` |
| **Tickets** | `ver_tickets`, `crear_ticket`, `editar_ticket`, `tomar_ticket`, `cerrar_ticket`, `reabrir_ticket`, `asignar_ticket`, `reasignar_ticket`, `priorizar_ticket`, `ver_historial_conversacion`, `adjuntar_archivos` |
| **Reportes** | `generar_reportes`, `descargar_reportes`, `compartir_reportes` |
| **Usuarios** | `aprobar_usuario`, `editar_info_usuario`, `eliminar_usuario`, `asignar_roles` |
| **Agentes** | `crear_agente`, `editar_agente`, `eliminar_agente`, `manage_agents` |
| **Contratos** | `ver_numero_contratos`, `view_contracts`, `view_contract_details`, `manage_contracts` |
| **Lecturas** | `ver_lecturas`, `view_readings` |
| **Deuda** | `ver_deuda`, `view_debt` |
| **Órdenes** | `crear_orden_trabajo` |
| **Admin** | `access_admin_panel` |
| **Configuración** | `view_settings` |

### Roles y sus Permisos

#### 🟢 Ciudadano
- Ver tickets, crear ticket, editar ticket, cerrar ticket, reabrir ticket
- Ver historial, adjuntar archivos
- Ver contratos, lecturas, deuda

#### 🔵 Representante de Organización
- Todo lo del Ciudadano +
- Acceso a dashboard
- Descargar reportes

#### 🟡 Agente de Contacto
- Todo lo del Representante +
- Tomar ticket, asignar ticket, reasignar ticket, priorizar ticket

#### 🟠 Agente de Área Resolutora
- Acceso a dashboard, ver/crear/tomar/editar/cerrar/reabrir tickets
- Ver historial, adjuntar archivos
- Crear orden de trabajo
- Ver contratos, lecturas, deuda

#### 🟣 Coordinador de Área
- Todo lo del Agente de Contacto +
- Generar reportes, compartir reportes
- Crear orden de trabajo

#### 🔴 Dueño de Proceso / Servicio
- Acceso a dashboard
- Generar/descargar/compartir reportes
- Ver tickets, priorizar, ver historial, adjuntar archivos
- Crear orden
- Ver contratos, lecturas, deuda

#### ⚫ Administrador Funcional / Técnico
- **TODOS** los permisos del sistema

#### ⚪ Auditor / Transparencia
- Acceso a dashboard
- Generar/descargar/compartir reportes
- Ver tickets, ver historial
- Ver contratos, lecturas, deuda
- **Solo lectura** (no puede modificar)

## 📚 Ejemplos Completos

### Ejemplo 1: Proteger una Ruta

```tsx
// App.tsx
<Route 
  path="tickets/new" 
  element={
    <ProtectedRoute 
      requiredPermission="crear_ticket"
      fallbackPath="/dashboard/tickets"
      showError={true}
    >
      <CreateTicket />
    </ProtectedRoute>
  } 
/>
```

### Ejemplo 2: Mostrar/Ocultar Botones

```tsx
// TicketList.tsx
import { PermissionGate } from '@/components/PermissionGate';

function TicketList() {
  return (
    <div>
      <h1>Tickets</h1>
      
      <PermissionGate permission="crear_ticket">
        <Button onClick={handleCreate}>
          Crear Nuevo Ticket
        </Button>
      </PermissionGate>

      {tickets.map(ticket => (
        <div key={ticket.id}>
          <h3>{ticket.title}</h3>
          
          <PermissionGate permissions={["editar_ticket", "cerrar_ticket"]}>
            <Button onClick={() => handleEdit(ticket)}>Editar</Button>
          </PermissionGate>
          
          <PermissionGate permission="eliminar_ticket">
            <Button variant="destructive">Eliminar</Button>
          </PermissionGate>
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo 3: Lógica Condicional en Código

```tsx
// TicketDetails.tsx
import { usePermissions } from '@/hooks/usePermissions';

function TicketDetails() {
  const { hasPermission, hasAnyPermission, hasRole } = usePermissions();
  const canEdit = hasPermission('editar_ticket');
  const canClose = hasPermission('cerrar_ticket');
  const canAssign = hasAnyPermission(['asignar_ticket', 'reasignar_ticket']);
  const isAdmin = hasRole('Administrador');

  const handleAction = () => {
    if (canEdit) {
      // Permitir edición
    } else if (canClose) {
      // Solo permitir cerrar
    }
  };

  return (
    <div>
      <h1>Ticket Details</h1>
      
      {canEdit && (
        <input value={title} onChange={e => setTitle(e.target.value)} />
      )}
      
      {!canEdit && <p>{title}</p>}
      
      {canAssign && (
        <select onChange={handleAssign}>
          <option>Asignar a...</option>
        </select>
      )}
      
      {isAdmin && (
        <Button variant="destructive">Eliminar Ticket</Button>
      )}
    </div>
  );
}
```

### Ejemplo 4: Menú de Navegación Dinámico

```tsx
// Sidebar.tsx
import { PermissionGate } from '@/components/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';

function Sidebar() {
  const { hasPermission } = usePermissions();

  return (
    <nav>
      {hasPermission('acceso_dashboard') && (
        <Link to="/dashboard">Dashboard</Link>
      )}
      
      <PermissionGate permissions={["ver_tickets", "view_tickets"]}>
        <Link to="/dashboard/tickets">Tickets</Link>
      </PermissionGate>
      
      <PermissionGate permissions={["ver_numero_contratos", "view_contracts"]}>
        <Link to="/dashboard/contratos">Contratos</Link>
      </PermissionGate>
      
      <PermissionGate permission="manage_agents">
        <Link to="/dashboard/agents">Agentes IA</Link>
      </PermissionGate>
      
      <PermissionGate permission="access_admin_panel">
        <Link to="/dashboard/admin">Administración</Link>
      </PermissionGate>
    </nav>
  );
}
```

## 🔧 Consultas Útiles en Supabase

### Ver todos los permisos de un usuario

```sql
SELECT * FROM cea.user_permissions_view 
WHERE user_id = 'uuid-del-usuario';
```

### Ver roles y cantidad de permisos

```sql
SELECT 
  r.name as role_name,
  COUNT(rp.privilege_id) as total_privileges
FROM cea.roles r
LEFT JOIN cea.roles_privileges rp ON r.id = rp.role_id
GROUP BY r.name
ORDER BY r.name;
```

### Verificar si un usuario tiene un permiso

```sql
SELECT cea.user_has_privilege(
  'uuid-del-usuario'::UUID, 
  'crear_ticket'
);
```

### Asignar rol a un usuario

```sql
INSERT INTO cea.users_roles (user_id, role_id)
VALUES (
  'uuid-del-usuario'::UUID,
  (SELECT id FROM cea.roles WHERE name = 'Agente de Contacto')
);
```

## 🚨 Troubleshooting

### Los permisos no se cargan
1. Verifica que el usuario esté en `localStorage` con `localStorage.getItem('user')`
2. Verifica que el usuario tenga un rol asignado en `cea.users_roles`
3. Verifica que el rol tenga permisos en `cea.roles_privileges`
4. Revisa la consola del navegador para errores

### "Access Denied" incluso con permisos correctos
1. Verifica que el nombre del permiso sea exacto (case-sensitive)
2. Usa la vista `cea.user_permissions_view` para ver los permisos del usuario
3. Llama a `refetch()` del hook después de cambios de rol

### RLS blocking queries
Si las consultas fallan con errores de permisos:
```sql
-- Verificar que RLS esté configurado correctamente
SELECT * FROM pg_policies WHERE tablename IN 
  ('users', 'roles', 'privileges', 'users_roles', 'roles_privileges');
```

## 📝 Notas Importantes

1. **Case Sensitivity**: Los nombres de permisos son case-sensitive
2. **Múltiples Roles**: Un usuario puede tener múltiples roles simultáneamente
3. **Cache**: Los permisos se cargan una vez al montar el componente. Usa `refetch()` para recargar
4. **Fallback**: Siempre define un `fallbackPath` o usa `showError={false}` para mejor UX

## 🎯 Mejores Prácticas

1. ✅ Usa nombres de permisos descriptivos y consistentes
2. ✅ Agrupa permisos relacionados usando `requiredPermissions` con array
3. ✅ Usa `<PermissionGate>` para UI, `<ProtectedRoute>` para rutas
4. ✅ Combina verificaciones de rol y permiso cuando sea necesario
5. ✅ Proporciona feedback claro al usuario cuando no tiene permisos
6. ✅ Mantén la matriz de permisos documentada y actualizada

---

**Autor**: Sistema CEA  
**Última actualización**: Diciembre 2025
