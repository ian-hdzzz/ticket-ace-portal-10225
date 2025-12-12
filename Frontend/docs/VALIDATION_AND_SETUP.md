# ✅ Validación y Configuración del Sistema RBAC

## 📋 Validación de Estructura de Base de Datos

### Tablas Existentes (Confirmadas)

✅ **cea.users** - Contiene usuarios del sistema
- Campos: `id`, `full_name`, `email`, `password`, `phone`, `active`, `created_at`, `updated_at`, `is_temporary_password`

✅ **cea.roles** - Contiene los roles
- Campos: `id`, `name`, `description`, `hierarchical_level`, `active`, `created_at`, `updated_at`
- **11 roles** actualmente en la base de datos

✅ **cea.privileges** - Contiene los privilegios
- Campos: `id`, `name`, `description`, `module`, `created_at`
- **38 privilegios** de tu CSV

✅ **cea.users_roles** - Relación muchos a muchos entre users y roles
- Campos: `id`, `user_id`, `role_id`, `assigned_by`, `assignment_date`
- **10 asignaciones** actualmente

✅ **cea.roles_privileges** - Relación muchos a muchos entre roles y privileges
- Campos: `id`, `role_id`, `privilege_id`, `created_at`
- **Múltiples asignaciones** existentes

---

## 🔧 Pasos de Implementación

### Paso 1: Sincronizar Base de Datos

Ejecuta el script en Supabase SQL Editor:

```bash
Frontend/sql/sync_existing_roles_privileges.sql
```

Este script:
1. ✅ Valida que todas las tablas existan
2. ✅ Sincroniza los 38 privilegios del CSV
3. ✅ Crea la vista `user_permissions_view`
4. ✅ Crea la función `user_has_privilege()`
5. ✅ Configura Row Level Security (RLS)
6. ✅ Crea índices para mejor performance
7. ✅ Genera reporte de estado

**⚠️ IMPORTANTE**: Este script **NO borra datos existentes**, solo agrega/actualiza.

### Paso 2: Verificar Vista de Permisos

Después de ejecutar el script, verifica que funcione:

```sql
-- Ver todos los permisos de un usuario específico
SELECT * FROM cea.user_permissions_view 
WHERE email = 'admin@cea.com';

-- Contar permisos por usuario
SELECT 
  full_name,
  role_name,
  COUNT(privilege_id) as total_permisos
FROM cea.user_permissions_view
GROUP BY user_id, full_name, role_name;
```

### Paso 3: Verificar Función Helper

```sql
-- Probar la función con un usuario real
SELECT cea.user_has_privilege(
  'd6b19f83-5a92-412e-9dce-e787593ca1da'::UUID,  -- Ian Hernández (Administrador)
  'crear_ticket'
);
-- Debería retornar TRUE si tiene el permiso
```

---

## 💻 Configuración del Frontend

### Archivos Creados

Los siguientes archivos ya fueron creados y están listos para usar:

#### 1. Hook de Permisos
```
Frontend/src/hooks/usePermissions.ts
```

#### 2. Componente de Protección de Rutas
```
Frontend/src/components/ProtectedRoute.tsx
```

#### 3. Componente de Control de Elementos UI
```
Frontend/src/components/PermissionGate.tsx
```

#### 4. Constantes de Permisos
```
Frontend/src/lib/permissions.ts
```

#### 5. API de Permisos
```
Frontend/src/api/permissions.ts
```

#### 6. App.tsx Actualizado
```
Frontend/src/App.tsx
```
- ✅ Ya integrado con `<ProtectedRoute>`
- ✅ Todas las rutas protegidas según permisos

### Verificar Importaciones

Asegúrate de que estos componentes UI existan en tu proyecto:

```typescript
// Estos deben existir en tu proyecto
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
```

Si no existen, instálalos:

```bash
npm install lucide-react
# o
bun add lucide-react
```

---

## 🧪 Testing del Sistema

### Test 1: Verificar que el Hook Carga Permisos

Crea un componente de prueba:

```typescript
// Frontend/src/pages/TestPermissions.tsx
import { usePermissions } from '@/hooks/usePermissions';

export default function TestPermissions() {
  const { permissions, roles, loading, hasPermission } = usePermissions();

  if (loading) return <div>Cargando permisos...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Permisos</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Roles del Usuario:</h2>
        <ul>
          {roles.map(role => (
            <li key={role.role_id}>{role.role_name}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Permisos del Usuario:</h2>
        <ul>
          {permissions.map(perm => (
            <li key={perm.privilege_id}>
              {perm.privilege_name} ({perm.privilege_module})
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Verificaciones:</h2>
        <p>¿Puede crear tickets? {hasPermission('crear_ticket') ? '✅ SÍ' : '❌ NO'}</p>
        <p>¿Puede ver dashboard? {hasPermission('acceso_dashboard') ? '✅ SÍ' : '❌ NO'}</p>
        <p>¿Es admin? {hasPermission('access_admin_panel') ? '✅ SÍ' : '❌ NO'}</p>
      </div>
    </div>
  );
}
```

Agrega la ruta en `App.tsx`:

```typescript
<Route path="/test-permissions" element={<TestPermissions />} />
```

### Test 2: Verificar Protección de Rutas

1. Inicia sesión con un usuario que tenga rol "Ciudadano"
2. Intenta acceder a `/dashboard/admin`
3. Deberías ver un mensaje de "Acceso Denegado"

### Test 3: Verificar PermissionGate

Agrega esto en cualquier componente:

```tsx
import { PermissionGate } from '@/components/PermissionGate';

<PermissionGate permission="crear_ticket">
  <button>Este botón solo se ve si tienes permiso de crear_ticket</button>
</PermissionGate>
```

---

## 🔍 Troubleshooting

### Problema: "user_permissions_view does not exist"

**Solución**: Ejecuta el script `sync_existing_roles_privileges.sql` en Supabase.

### Problema: "Cannot read property 'id' of null"

**Solución**: Verifica que el usuario esté correctamente almacenado en `localStorage`:

```javascript
const user = localStorage.getItem('user');
console.log('Usuario en localStorage:', user);
```

### Problema: "usePermissions retorna vacío"

**Causas posibles**:
1. El usuario no tiene roles asignados en `users_roles`
2. El rol no tiene privilegios asignados en `roles_privileges`
3. El schema en `supabase/client.ts` no está configurado correctamente

**Verificar**:

```sql
-- Ver si el usuario tiene roles
SELECT * FROM cea.users_roles WHERE user_id = 'tu-user-id';

-- Ver si el rol tiene privilegios
SELECT * FROM cea.roles_privileges WHERE role_id = 'tu-role-id';

-- Ver directamente en la vista
SELECT * FROM cea.user_permissions_view WHERE user_id = 'tu-user-id';
```

### Problema: RLS Blocking Queries

Si las consultas fallan con errores de permisos, ejecuta:

```sql
-- Dar permisos de lectura a usuarios autenticados
GRANT SELECT ON ALL TABLES IN SCHEMA cea TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA cea TO anon;
```

---

## 📊 Mapeo de Roles a Privilegios Actuales

Basado en tus datos existentes, estos son los roles y cuántos privilegios tiene cada uno:

```sql
SELECT 
  r.name as rol,
  COUNT(rp.privilege_id) as total_privilegios
FROM cea.roles r
LEFT JOIN cea.roles_privileges rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY COUNT(rp.privilege_id) DESC;
```

### Roles Identificados:

1. **Administrador** (39d29900...) - Máximos privilegios
2. **Administrador Funcional** (78a683be...)
3. **Administrador Técnico** (0d28fab6...)
4. **Coordinador de Área** (9396c9f6...)
5. **Agente de Contacto** (ca0b30c6...)
6. **Agente de Área Resolutora** (8a11b829...)
7. **Dueño de Proceso / Servicio** (2d7ff6fb...)
8. **Auditor / Transparencia** (bd32b626...)
9. **Representante de organización** (6786356d...)
10. **Ciudadano** (f82de238...)
11. **Ciudadana** (877ea231...) - ⚠️ Parece duplicado con "Ciudadano"

---

## 🎯 Próximos Pasos

### 1. Asignar Privilegios a Roles Nuevos

Si agregaste roles que no tienen privilegios asignados, usa:

```sql
-- Ejemplo: Asignar privilegios al rol "Ciudadano"
INSERT INTO cea.roles_privileges (role_id, privilege_id)
SELECT 
  'f82de238-a3c0-43ff-92cd-9a939e4116d6'::UUID,  -- ID del rol Ciudadano
  id
FROM cea.privileges
WHERE name IN ('crear_ticket', 'ver_tickets', 'ver_lecturas', 'ver_deuda')
ON CONFLICT DO NOTHING;
```

### 2. Probar con Diferentes Usuarios

Crea usuarios de prueba con diferentes roles y verifica que:
- Vean solo las rutas permitidas
- Los botones se muestren/oculten correctamente
- No puedan acceder a rutas protegidas

### 3. Implementar en Navegación

Actualiza tu componente de navegación para usar `<PermissionGate>`:

```tsx
// Ejemplo en Sidebar
import { PermissionGate } from '@/components/PermissionGate';

<PermissionGate permission="acceso_dashboard">
  <Link to="/dashboard">Dashboard</Link>
</PermissionGate>

<PermissionGate permissions={["ver_tickets", "view_tickets"]}>
  <Link to="/dashboard/tickets">Tickets</Link>
</PermissionGate>

<PermissionGate permission="access_admin_panel">
  <Link to="/dashboard/admin">Administración</Link>
</PermissionGate>
```

---

## 📚 Documentación Adicional

Consulta estos archivos para más información:

- **Guía Completa**: `Frontend/docs/RBAC_PERMISSIONS_GUIDE.md`
- **Script de Testing**: `Frontend/sql/test_roles_privileges.sql`
- **Setup Completo**: `Frontend/sql/setup_roles_privileges_complete.sql`

---

## ✅ Checklist de Implementación

- [ ] Ejecutar `sync_existing_roles_privileges.sql` en Supabase
- [ ] Verificar que `user_permissions_view` funcione
- [ ] Verificar que `user_has_privilege()` funcione
- [ ] Probar `usePermissions()` en el frontend
- [ ] Probar `<ProtectedRoute>` con diferentes usuarios
- [ ] Probar `<PermissionGate>` en componentes
- [ ] Actualizar navegación con permisos
- [ ] Crear usuarios de prueba con diferentes roles
- [ ] Testing completo del flujo de permisos
- [ ] Documentar permisos específicos de tu aplicación

---

**¿Todo listo?** Ejecuta el script de sincronización y luego prueba accediendo a la aplicación con diferentes usuarios. ¡El sistema debería funcionar perfectamente con tu estructura existente!
