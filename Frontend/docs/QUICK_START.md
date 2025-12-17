# 🚀 GUÍA RÁPIDA: Sistema RBAC - Protección de Rutas

## ✅ Estado Actual de tu Base de Datos

**CONFIRMADO**: Ya tienes todas las tablas creadas en Supabase:
- ✅ `cea.users` (11 usuarios)
- ✅ `cea.roles` (11 roles)
- ✅ `cea.privileges` (ya algunos privilegios)
- ✅ `cea.users_roles` (10 asignaciones)
- ✅ `cea.roles_privileges` (múltiples asignaciones)

## 📝 PASO A PASO - Implementación Completa

### PASO 1: Ejecutar Script de Sincronización en Supabase ⚡

1. Abre Supabase → SQL Editor
2. Ejecuta este archivo:
   ```
   Frontend/sql/sync_existing_roles_privileges.sql
   ```
3. Espera a que termine (verás un reporte al final)
4. Verifica que no haya errores

**¿Qué hace este script?**
- ✅ Sincroniza los 38 privilegios del CSV a tu tabla
- ✅ Crea la vista `user_permissions_view` para consultas rápidas
- ✅ Crea la función `user_has_privilege()` para verificar permisos
- ✅ Configura Row Level Security (RLS)
- ✅ Crea índices para mejor performance

### PASO 2: Verificar que Funcione 🔍

Ejecuta esta consulta en Supabase SQL Editor:

```sql
-- Debe retornar tus usuarios con sus permisos
SELECT * FROM cea.user_permissions_view LIMIT 10;
```

Si retorna datos, ¡todo está funcionando! 🎉

### PASO 3: Código Frontend - Ya Está Listo ✨

Los siguientes archivos YA fueron creados y están listos para usar:

```
✅ Frontend/src/hooks/usePermissions.ts          (Hook para verificar permisos)
✅ Frontend/src/components/ProtectedRoute.tsx    (Proteger rutas completas)
✅ Frontend/src/components/PermissionGate.tsx    (Mostrar/ocultar elementos UI)
✅ Frontend/src/lib/permissions.ts               (Constantes de permisos)
✅ Frontend/src/api/permissions.ts               (API para gestionar permisos)
✅ Frontend/src/App.tsx                          (Rutas protegidas)
```

**NO necesitas crear nada más**, solo asegúrate de que tengas instalado:

```bash
npm install lucide-react
# o
bun add lucide-react
```

### PASO 4: Probar el Sistema 🧪

#### Opción A: Crear Página de Prueba

Crea `Frontend/src/pages/TestPermissions.tsx`:

```tsx
import { usePermissions } from '@/hooks/usePermissions';

export default function TestPermissions() {
  const { permissions, roles, loading, hasPermission } = usePermissions();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test de Permisos</h1>
      
      <h2 className="text-xl mt-4">Tus Roles:</h2>
      <ul>
        {roles.map(r => <li key={r.role_id}>{r.role_name}</li>)}
      </ul>

      <h2 className="text-xl mt-4">Tus Permisos ({permissions.length}):</h2>
      <ul className="grid grid-cols-3 gap-2">
        {permissions.map(p => (
          <li key={p.privilege_id} className="text-sm">
            ✓ {p.privilege_name}
          </li>
        ))}
      </ul>

      <h2 className="text-xl mt-4">Verificaciones:</h2>
      <p>¿Puede crear tickets? {hasPermission('crear_ticket') ? '✅' : '❌'}</p>
      <p>¿Puede ver dashboard? {hasPermission('acceso_dashboard') ? '✅' : '❌'}</p>
      <p>¿Es admin? {hasPermission('access_admin_panel') ? '✅' : '❌'}</p>
    </div>
  );
}
```

Agrega la ruta en `App.tsx`:

```tsx
<Route path="/test-permissions" element={<TestPermissions />} />
```

Luego visita: `http://localhost:5173/test-permissions`

#### Opción B: Probar Rutas Protegidas Directamente

1. Inicia sesión con un usuario normal (no admin)
2. Intenta acceder a `/dashboard/admin`
3. Deberías ver "Acceso Denegado" ✅

## 🎯 Uso en tu Aplicación

### Proteger una Ruta Completa

Ya está implementado en `App.tsx`, pero si necesitas agregar más:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

<Route 
  path="nueva-ruta" 
  element={
    <ProtectedRoute requiredPermission="nombre_del_permiso">
      <TuComponente />
    </ProtectedRoute>
  } 
/>
```

### Mostrar/Ocultar Botones o Elementos UI

```tsx
import { PermissionGate } from '@/components/PermissionGate';

// Solo muestra si tiene el permiso
<PermissionGate permission="crear_ticket">
  <button>Crear Ticket</button>
</PermissionGate>

// Solo muestra si tiene AL MENOS UNO de los permisos
<PermissionGate permissions={["editar_ticket", "cerrar_ticket"]}>
  <button>Acciones</button>
</PermissionGate>

// Solo muestra si tiene TODOS los permisos
<PermissionGate 
  permissions={["editar_ticket", "eliminar_ticket"]} 
  requireAll={true}
>
  <button>Eliminar</button>
</PermissionGate>
```

### Verificar Permisos en Código JavaScript

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MiComponente() {
  const { hasPermission, hasAnyPermission, hasRole } = usePermissions();

  const canEdit = hasPermission('editar_ticket');
  const canDoSomething = hasAnyPermission(['crear_ticket', 'editar_ticket']);
  const isAdmin = hasRole('Administrador');

  if (canEdit) {
    // Hacer algo
  }

  return <div>...</div>;
}
```

### Actualizar tu Navegación/Sidebar

```tsx
import { PermissionGate } from '@/components/PermissionGate';

function Sidebar() {
  return (
    <nav>
      <PermissionGate permissions={["acceso_dashboard", "view_dashboard"]}>
        <Link to="/dashboard">Dashboard</Link>
      </PermissionGate>
      
      <PermissionGate permissions={["ver_tickets", "view_tickets"]}>
        <Link to="/dashboard/tickets">Tickets</Link>
      </PermissionGate>
      
      <PermissionGate permission="access_admin_panel">
        <Link to="/dashboard/admin">Admin</Link>
      </PermissionGate>
    </nav>
  );
}
```

## 📊 Permisos Disponibles

Aquí están los 38 privilegios que sincronizaste:

**Dashboard:**
- `acceso_dashboard`, `view_dashboard`

**Tickets:**
- `ver_tickets`, `view_tickets`, `crear_ticket`, `create_ticket`
- `editar_ticket`, `tomar_ticket`, `cerrar_ticket`, `reabrir_ticket`
- `asignar_ticket`, `reasignar_ticket`, `priorizar_ticket`
- `ver_historial_conversacion`, `adjuntar_archivos`, `manage_tickets`

**Reportes:**
- `generar_reportes`, `descargar_reportes`, `compartir_reportes`

**Usuarios:**
- `aprobar_usuario`, `editar_info_usuario`, `eliminar_usuario`, `asignar_roles`

**Agentes:**
- `crear_agente`, `editar_agente`, `eliminar_agente`, `manage_agents`

**Contratos:**
- `ver_numero_contratos`, `view_contracts`, `view_contract_details`, `manage_contracts`

**Lecturas:**
- `ver_lecturas`, `view_readings`

**Deuda:**
- `ver_deuda`, `view_debt`

**Otros:**
- `crear_orden_trabajo`, `access_admin_panel`, `view_settings`

## 🔧 Gestión de Permisos desde el Frontend

Si necesitas gestionar permisos programáticamente:

```typescript
import { 
  getUserPermissions,
  assignRoleToUser,
  removeRoleFromUser,
  getAllRoles,
  getAllPrivileges,
} from '@/api/permissions';

// Obtener permisos de un usuario
const permisos = await getUserPermissions(userId);

// Asignar rol a usuario
await assignRoleToUser(userId, roleId, assignedBy);

// Remover rol de usuario
await removeRoleFromUser(userId, roleId);

// Obtener todos los roles
const roles = await getAllRoles();

// Obtener todos los privilegios
const privilegios = await getAllPrivileges();
```

## 🚨 Troubleshooting

### Problema: "Cannot find module '@/hooks/usePermissions'"

**Solución**: Verifica que el alias `@` esté configurado en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Problema: usePermissions retorna vacío

**Verificar**:
1. ¿El usuario está en `localStorage`? 
   ```js
   console.log(localStorage.getItem('user'));
   ```

2. ¿El usuario tiene roles asignados?
   ```sql
   SELECT * FROM cea.users_roles WHERE user_id = 'tu-id';
   ```

3. ¿El rol tiene privilegios?
   ```sql
   SELECT * FROM cea.roles_privileges WHERE role_id = 'tu-role-id';
   ```

### Problema: RLS está bloqueando consultas

```sql
-- Dar permisos de lectura
GRANT SELECT ON ALL TABLES IN SCHEMA cea TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA cea TO anon;
```

## ✅ Checklist Final

- [ ] ✅ Ejecutar `sync_existing_roles_privileges.sql` en Supabase
- [ ] ✅ Verificar `SELECT * FROM cea.user_permissions_view`
- [ ] ✅ Instalar `lucide-react` si no está
- [ ] ✅ Crear página de prueba `/test-permissions`
- [ ] ✅ Probar con diferentes usuarios
- [ ] ✅ Actualizar navegación con `<PermissionGate>`
- [ ] ✅ Verificar que rutas protegidas funcionen

## 📚 Documentación Adicional

- **Guía Completa**: `Frontend/docs/RBAC_PERMISSIONS_GUIDE.md`
- **Validación**: `Frontend/docs/VALIDATION_AND_SETUP.md`
- **Testing**: `Frontend/sql/test_roles_privileges.sql`

---

## 🎉 ¡Listo!

Una vez que ejecutes el script de sincronización en Supabase, todo el código frontend está listo para funcionar. Solo necesitas:

1. Ejecutar el script SQL ✅
2. Probar la página de test ✅
3. Empezar a usar `<ProtectedRoute>` y `<PermissionGate>` ✅

**¿Tienes dudas?** Todo está documentado en `RBAC_PERMISSIONS_GUIDE.md` con ejemplos completos.
