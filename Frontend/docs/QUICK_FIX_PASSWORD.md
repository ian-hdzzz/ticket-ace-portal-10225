# 🚨 PROBLEMA: Contraseña No Se Guarda

## 🎯 Solución en 3 Pasos

### 1️⃣ DIAGNOSTICAR (Opcional)
```bash
# Abre Supabase SQL Editor y ejecuta:
Frontend/sql/diagnostic_users_rls_clean.sql
```

Esto te dirá si falta la política UPDATE.

---

### 2️⃣ APLICAR FIX ⭐
```bash
# Abre Supabase SQL Editor y ejecuta:
Frontend/sql/fix_users_update_policy.sql
```

O copia y pega esto directamente:

```sql
DROP POLICY IF EXISTS "Users can update their own password" ON cea.users;

CREATE POLICY "Users can update their own password" 
ON cea.users 
FOR UPDATE 
USING (true)
WITH CHECK (true);
```

---

### 3️⃣ VERIFICAR
```sql
-- Debe mostrar 2 políticas: SELECT y UPDATE
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'cea' 
  AND tablename = 'users';
```

**Resultado esperado:**
```
policyname                              | cmd
----------------------------------------|--------
Allow authenticated read on users       | SELECT
Users can update their own password     | UPDATE
```

✅ Si ves ambas políticas → **LISTO**

---

## 🧪 Probar

1. Login con contraseña temporal
2. Cambia la contraseña
3. Abre consola del navegador (F12)
4. Deberías ver: `✅ Contraseña actualizada exitosamente`
5. Logout y vuelve a entrar con la nueva contraseña
6. ✅ NO debe pedir cambiar contraseña de nuevo

---

## 📁 Archivos

### SQL (Ejecutar en Supabase):
- ⭐ `fix_users_update_policy.sql` - **SOLUCIÓN PRINCIPAL**
- 🔍 `diagnostic_users_rls_clean.sql` - Diagnóstico

### Documentación:
- 📖 `FIX_PASSWORD_UPDATE.md` - Guía completa
- 📝 `QUICK_FIX_PASSWORD.md` - Este archivo (resumen)

### Frontend (Ya actualizado):
- ✅ `src/pages/Auth.tsx` - Mejorado con logs y manejo de errores

---

## ❓ Por Qué Ocurre

1. ✅ Supabase tiene Row Level Security (RLS) habilitado en `cea.users`
2. ✅ Existe política para **SELECT** (leer usuarios)
3. ❌ **NO existe política para UPDATE** (actualizar usuarios)
4. ❌ Por lo tanto `.update()` falla silenciosamente

**La solución:** Agregar política UPDATE con el script `fix_users_update_policy.sql`

---

## 🆘 Si No Funciona

### Error: "new row violates row-level security policy"

**Causa:** El script no se ejecutó correctamente.

**Solución:** 
1. Ejecuta de nuevo `fix_users_update_policy.sql`
2. Verifica con: `SELECT * FROM pg_policies WHERE tablename = 'users'`

### Error: "permission denied for table users"

**Causa:** Falta permiso GRANT.

**Solución:**
```sql
GRANT UPDATE ON cea.users TO authenticated;
GRANT UPDATE ON cea.users TO anon;
```

### La contraseña se guarda pero sigue pidiendo cambiarla

**Causa:** `is_temporary_password` no se actualizó a `false`.

**Solución:**
```sql
-- Verificar
SELECT id, email, is_temporary_password 
FROM cea.users 
WHERE email = 'tu-email@example.com';

-- Si sigue siendo true, actualízalo manualmente:
UPDATE cea.users 
SET is_temporary_password = false 
WHERE email = 'tu-email@example.com';
```
