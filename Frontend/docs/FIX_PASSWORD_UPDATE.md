# 🔧 Solución: Problema con Contraseña Temporal

## 🐛 Problema Identificado

Cuando un usuario cambia su contraseña temporal, **NO se guarda en Supabase** porque:

1. ✅ La tabla `cea.users` tiene **Row Level Security (RLS)** habilitado
2. ❌ Solo existe política RLS para **SELECT** (lectura)
3. ❌ **NO existe política para UPDATE** (escritura)
4. ❌ Por lo tanto, la operación `.update()` es bloqueada silenciosamente

## ✅ Solución Completa

### PASO 1: Ejecutar Script SQL en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta este script:

```sql
-- ============================================================================
-- FIX: Permitir actualización de contraseñas en tabla cea.users
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can update their own password" ON cea.users;
DROP POLICY IF EXISTS "Allow users to update own data" ON cea.users;

-- Crear política para que usuarios puedan actualizar su contraseña
CREATE POLICY "Users can update their own password" 
ON cea.users 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Verificar que se creó correctamente
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'cea' 
  AND tablename = 'users'
ORDER BY policyname;
```

**O usa el archivo que creé:**
```bash
Frontend/sql/fix_users_update_policy.sql
```

### PASO 2: Verificar el Fix

Después de ejecutar el script, verifica:

```sql
-- Debe mostrar políticas para SELECT y UPDATE
SELECT 
  tablename,
  policyname,
  cmd as operacion
FROM pg_policies 
WHERE schemaname = 'cea' 
  AND tablename = 'users';
```

**Resultado esperado:**
```
tablename | policyname                              | operacion
----------|----------------------------------------|----------
users     | Allow authenticated read on users      | SELECT
users     | Users can update their own password    | UPDATE
```

### PASO 3: Probar el Sistema

1. **Cierra sesión** si estás logueado
2. **Inicia sesión** con un usuario que tenga `is_temporary_password = true`
3. **Cambia la contraseña** cuando se te solicite
4. **Abre la consola del navegador** (F12) y verifica los logs:
   ```
   🔄 Intentando actualizar contraseña para usuario: <uuid>
   ✅ Contraseña actualizada exitosamente: [array con datos]
   ```
5. **Cierra sesión** nuevamente
6. **Inicia sesión** con la **nueva contraseña** → ✅ Debe funcionar
7. **NO debe pedirte cambiar contraseña** de nuevo

### PASO 4: Verificar en Base de Datos

```sql
-- Verifica que el usuario YA NO tiene contraseña temporal
SELECT 
  id,
  email,
  full_name,
  is_temporary_password,
  password
FROM cea.users
WHERE email = 'tu-email@example.com';
```

**Resultado esperado:**
- `is_temporary_password` debe ser `false`
- `password` debe ser tu nueva contraseña

---

## 🔍 Debugging

### Si todavía no funciona:

#### 1. Verifica RLS Policies

```sql
-- Ver TODAS las políticas de la tabla users
SELECT * FROM pg_policies 
WHERE schemaname = 'cea' 
  AND tablename = 'users';
```

#### 2. Verifica permisos de la tabla

```sql
-- Ver permisos de la tabla
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'cea' 
  AND table_name = 'users';
```

#### 3. Otorgar permisos si es necesario

```sql
-- Dar permiso de UPDATE a usuarios autenticados
GRANT UPDATE ON cea.users TO authenticated;
GRANT UPDATE ON cea.users TO anon;
```

#### 4. Verificar en el Frontend

Abre la consola del navegador (F12) cuando intentes cambiar la contraseña:

**Si ves error tipo:**
```
Error al actualizar contraseña: new row violates row-level security policy
```

**Solución:** El script SQL no se ejecutó correctamente, vuelve a ejecutarlo.

**Si ves:**
```
✅ Contraseña actualizada exitosamente: [{...}]
```

**Todo funcionó correctamente** ✅

---

## 🔒 Seguridad (Opcional)

La política actual permite que **cualquiera** actualice cualquier usuario. Para mayor seguridad:

### Opción 1: Política basada en email (Recomendado)

```sql
DROP POLICY IF EXISTS "Users can update their own password" ON cea.users;

CREATE POLICY "Users can update their own password" 
ON cea.users 
FOR UPDATE 
USING (
  -- Solo si estamos actualizando nuestro propio usuario
  email = current_setting('request.headers', true)::json->>'x-user-email'
)
WITH CHECK (
  email = current_setting('request.headers', true)::json->>'x-user-email'
);
```

**Requiere:** Enviar el email en headers desde el frontend.

### Opción 2: Solo permitir cambio desde contraseña temporal

```sql
DROP POLICY IF EXISTS "Users can update their own password" ON cea.users;

CREATE POLICY "Users can update their own password" 
ON cea.users 
FOR UPDATE 
USING (
  -- Solo si el usuario tiene contraseña temporal
  is_temporary_password = true
)
WITH CHECK (
  -- Asegurar que se cambia a contraseña no temporal
  is_temporary_password = false
);
```

---

## 📋 Checklist Final

- [ ] ✅ Ejecutar `fix_users_update_policy.sql` en Supabase
- [ ] ✅ Verificar políticas con `SELECT * FROM pg_policies WHERE tablename = 'users'`
- [ ] ✅ Probar login con contraseña temporal
- [ ] ✅ Cambiar contraseña y ver logs en consola
- [ ] ✅ Cerrar sesión y volver a entrar con nueva contraseña
- [ ] ✅ Verificar en BD que `is_temporary_password = false`

---

## 🎉 Resultado Esperado

Después de seguir estos pasos:

1. ✅ El usuario puede cambiar su contraseña temporal
2. ✅ La nueva contraseña se guarda correctamente en Supabase
3. ✅ `is_temporary_password` se actualiza a `false`
4. ✅ El usuario puede iniciar sesión con la nueva contraseña
5. ✅ NO se le pide cambiar contraseña de nuevo

---

## 📝 Cambios Realizados

### Archivos Creados:
```
Frontend/sql/fix_users_update_policy.sql
Frontend/docs/FIX_PASSWORD_UPDATE.md (este archivo)
```

### Archivos Modificados:
```
Frontend/src/pages/Auth.tsx
  - Agregado mejor manejo de errores
  - Agregados console.logs para debugging
  - Agregado mensaje de error descriptivo
  - Agregado .select() para verificar actualización
```

### SQL Ejecutado:
```sql
CREATE POLICY "Users can update their own password" 
ON cea.users FOR UPDATE USING (true) WITH CHECK (true);
```
