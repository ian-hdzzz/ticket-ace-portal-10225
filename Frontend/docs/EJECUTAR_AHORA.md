# 🚀 EJECUTA ESTO AHORA - Pasos Rápidos

## ❌ Error que tuviste:
```
ERROR: 42601: syntax error at or near "\"
```

**Causa**: El comando `\echo` no funciona en Supabase SQL Editor.

## ✅ SOLUCIÓN: Usa el archivo correcto

### PASO 1: Ejecutar Script Limpio

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre este archivo:
   ```
   Frontend/sql/sync_existing_roles_privileges_clean.sql
   ```
3. Copia todo el contenido
4. Pégalo en el SQL Editor de Supabase
5. Click en **RUN** ▶️

### PASO 2: Verificar que Funcionó

Después de ejecutar el script, ejecuta esta consulta:

```sql
-- Debe retornar datos de usuarios con sus permisos
SELECT * FROM cea.user_permissions_view LIMIT 5;
```

Si ves datos con columnas como `user_id`, `full_name`, `role_name`, `privilege_name` → **¡FUNCIONÓ!** ✅

### PASO 3: Probar la Función

```sql
-- Prueba con un usuario real (usa un ID de tu tabla users)
SELECT cea.user_has_privilege(
  'd6b19f83-5a92-412e-9dce-e787593ca1da'::UUID,  -- Cambia este UUID por uno de tus usuarios
  'crear_ticket'
);
```

Si retorna `true` o `false` → **¡FUNCIONÓ!** ✅

## 💻 Frontend - Ya está listo

El código frontend **YA ESTÁ** integrado en `App.tsx`. Solo necesitas:

### Instalar dependencia:

```bash
cd Frontend
npm install lucide-react
# o
bun add lucide-react
```

### Verificar que el usuario esté en localStorage:

```javascript
// Abre la consola del navegador y ejecuta:
console.log(localStorage.getItem('user'));
```

Debe retornar algo como:
```json
{
  "id": "uuid-del-usuario",
  "email": "usuario@example.com",
  "full_name": "Nombre Usuario"
}
```

## 🧪 PROBAR EL SISTEMA

### Opción 1: Crear Página de Prueba

Crea `Frontend/src/pages/TestPermissions.tsx`:

```tsx
import { usePermissions } from '@/hooks/usePermissions';

export default function TestPermissions() {
  const { permissions, roles, loading, hasPermission } = usePermissions();

  if (loading) return <div className="p-8">Cargando permisos...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔐 Test de Permisos</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">👤 Tus Roles:</h2>
        {roles.length === 0 ? (
          <p className="text-red-600">⚠️ No tienes roles asignados</p>
        ) : (
          <ul className="list-disc list-inside">
            {roles.map(role => (
              <li key={role.role_id} className="text-lg">{role.role_name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-green-50 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">
          ✅ Tus Permisos ({permissions.length}):
        </h2>
        {permissions.length === 0 ? (
          <p className="text-red-600">⚠️ No tienes permisos asignados</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {permissions.map(perm => (
              <div key={perm.privilege_id} className="text-sm bg-white p-2 rounded">
                <span className="font-semibold">{perm.privilege_name}</span>
                <span className="text-gray-500 ml-2">({perm.privilege_module})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">🧪 Verificaciones:</h2>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-semibold">¿Puede crear tickets?</span>
            {hasPermission('crear_ticket') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Puede ver dashboard?</span>
            {hasPermission('acceso_dashboard') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Es admin?</span>
            {hasPermission('access_admin_panel') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Puede editar tickets?</span>
            {hasPermission('editar_ticket') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Puede ver contratos?</span>
            {hasPermission('ver_numero_contratos') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
```

Luego agrega la ruta en `App.tsx`:

```tsx
import TestPermissions from "./pages/TestPermissions";

// Dentro de Routes, después de RequireAuth:
<Route path="/test-permissions" element={<TestPermissions />} />
```

Luego visita: `http://localhost:5173/test-permissions`

### Opción 2: Probar Rutas Protegidas

1. Inicia sesión con un usuario que **NO** sea administrador
2. Intenta acceder a: `http://localhost:5173/dashboard/admin`
3. Deberías ver un mensaje de **"Acceso Denegado"** ✅

## 🔍 Troubleshooting

### Problema: "user_permissions_view does not exist"
**Solución**: Vuelve a ejecutar el script SQL limpio.

### Problema: usePermissions retorna vacío
**Verificar**:

1. ¿Usuario en localStorage?
```javascript
console.log(localStorage.getItem('user'));
```

2. ¿Usuario tiene roles en Supabase?
```sql
SELECT * FROM cea.users_roles WHERE user_id = 'tu-uuid-aqui';
```

3. ¿La vista funciona?
```sql
SELECT * FROM cea.user_permissions_view WHERE user_id = 'tu-uuid-aqui';
```

### Problema: RLS está bloqueando
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA cea TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA cea TO anon;
```

## 📋 Checklist Rápido

- [ ] ✅ Ejecutar `sync_existing_roles_privileges_clean.sql`
- [ ] ✅ Verificar `SELECT * FROM cea.user_permissions_view LIMIT 5`
- [ ] ✅ Instalar `lucide-react`
- [ ] ✅ Verificar usuario en localStorage
- [ ] ✅ Crear y probar página `/test-permissions`
- [ ] ✅ Probar acceso a `/dashboard/admin` con usuario no-admin

## 🎉 ¡Todo Listo!

Una vez que ejecutes el script SQL limpio y veas datos en `user_permissions_view`, el sistema estará completamente funcional.

**Archivos clave:**
- Script SQL: `Frontend/sql/sync_existing_roles_privileges_clean.sql` ⭐
- Documentación: `Frontend/docs/QUICK_START.md`
- Guía completa: `Frontend/docs/RBAC_PERMISSIONS_GUIDE.md`
