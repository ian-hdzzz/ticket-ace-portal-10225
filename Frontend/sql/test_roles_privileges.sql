-- =====================================================
-- SCRIPT DE TESTING: Sistema de Roles y Privilegios
-- =====================================================
-- Ejecutar después del setup_roles_privileges_complete.sql

SET search_path TO cea;

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================
\echo '=== 1. VERIFICANDO ESTRUCTURA DE TABLAS ==='

SELECT 
  'users' as tabla,
  COUNT(*) as total_registros
FROM cea.users
UNION ALL
SELECT 
  'roles' as tabla,
  COUNT(*) as total_registros
FROM cea.roles
UNION ALL
SELECT 
  'privileges' as tabla,
  COUNT(*) as total_registros
FROM cea.privileges
UNION ALL
SELECT 
  'users_roles' as tabla,
  COUNT(*) as total_registros
FROM cea.users_roles
UNION ALL
SELECT 
  'roles_privileges' as tabla,
  COUNT(*) as total_registros
FROM cea.roles_privileges;

-- =====================================================
-- 2. VERIFICAR PRIVILEGIOS IMPORTADOS
-- =====================================================
\echo '=== 2. VERIFICANDO PRIVILEGIOS IMPORTADOS ==='

SELECT 
  module,
  COUNT(*) as total_privilegios
FROM cea.privileges
GROUP BY module
ORDER BY module;

-- =====================================================
-- 3. VERIFICAR ROLES Y SUS PRIVILEGIOS
-- =====================================================
\echo '=== 3. VERIFICANDO ASIGNACIÓN DE PRIVILEGIOS POR ROL ==='

SELECT 
  r.name as rol,
  r.hierarchical_level as nivel,
  COUNT(rp.privilege_id) as total_privilegios,
  r.active as activo
FROM cea.roles r
LEFT JOIN cea.roles_privileges rp ON r.id = rp.role_id
WHERE r.active = true
GROUP BY r.id, r.name, r.hierarchical_level, r.active
ORDER BY r.hierarchical_level, r.name;

-- =====================================================
-- 4. VERIFICAR PRIVILEGIOS DE ROLES ESPECÍFICOS
-- =====================================================
\echo '=== 4. DETALLE DE PRIVILEGIOS POR ROL ==='

-- Ciudadano
SELECT 
  'Ciudadano' as rol,
  p.name as privilegio,
  p.module as modulo
FROM cea.roles r
JOIN cea.roles_privileges rp ON r.id = rp.role_id
JOIN cea.privileges p ON rp.privilege_id = p.id
WHERE r.name = 'Ciudadano'
ORDER BY p.module, p.name;

-- Administrador
SELECT 
  'Administrador' as rol,
  p.name as privilegio,
  p.module as modulo
FROM cea.roles r
JOIN cea.roles_privileges rp ON r.id = rp.role_id
JOIN cea.privileges p ON rp.privilege_id = p.id
WHERE r.name = 'Administrador'
ORDER BY p.module, p.name;

-- =====================================================
-- 5. CREAR USUARIO DE PRUEBA
-- =====================================================
\echo '=== 5. CREANDO USUARIO DE PRUEBA ==='

-- Insertar usuario de prueba (si no existe)
INSERT INTO cea.users (id, full_name, email, password, phone)
VALUES (
  'test-user-001'::UUID,
  'Usuario de Prueba',
  'test@cea.com',
  '$2b$10$test.hash.here', -- Hash ficticio
  '5551234567'
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- Asignar rol "Agente de Contacto" al usuario de prueba
INSERT INTO cea.users_roles (user_id, role_id)
VALUES (
  'test-user-001'::UUID,
  (SELECT id FROM cea.roles WHERE name = 'Agente de Contacto')
)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- =====================================================
-- 6. PROBAR VISTA DE PERMISOS
-- =====================================================
\echo '=== 6. PROBANDO VISTA user_permissions_view ==='

SELECT 
  user_id,
  full_name,
  role_name,
  COUNT(DISTINCT privilege_id) as total_permisos_unicos,
  STRING_AGG(DISTINCT privilege_module, ', ' ORDER BY privilege_module) as modulos
FROM cea.user_permissions_view
WHERE email = 'test@cea.com'
GROUP BY user_id, full_name, role_name;

-- Listar todos los permisos del usuario de prueba
SELECT 
  role_name as rol,
  privilege_name as permiso,
  privilege_module as modulo
FROM cea.user_permissions_view
WHERE email = 'test@cea.com'
ORDER BY privilege_module, privilege_name;

-- =====================================================
-- 7. PROBAR FUNCIÓN user_has_privilege
-- =====================================================
\echo '=== 7. PROBANDO FUNCIÓN user_has_privilege ==='

-- Verificar si el usuario tiene permisos específicos
SELECT 
  'test@cea.com' as usuario,
  'crear_ticket' as permiso_verificado,
  cea.user_has_privilege(
    'test-user-001'::UUID,
    'crear_ticket'
  ) as tiene_permiso

UNION ALL

SELECT 
  'test@cea.com' as usuario,
  'eliminar_usuario' as permiso_verificado,
  cea.user_has_privilege(
    'test-user-001'::UUID,
    'eliminar_usuario'
  ) as tiene_permiso

UNION ALL

SELECT 
  'test@cea.com' as usuario,
  'acceso_dashboard' as permiso_verificado,
  cea.user_has_privilege(
    'test-user-001'::UUID,
    'acceso_dashboard'
  ) as tiene_permiso;

-- =====================================================
-- 8. VERIFICAR RLS (ROW LEVEL SECURITY)
-- =====================================================
\echo '=== 8. VERIFICANDO POLÍTICAS RLS ==='

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'cea'
ORDER BY tablename, policyname;

-- =====================================================
-- 9. ESTADÍSTICAS FINALES
-- =====================================================
\echo '=== 9. ESTADÍSTICAS FINALES ==='

SELECT 
  'Total Usuarios' as metrica,
  COUNT(*)::TEXT as valor
FROM cea.users
WHERE active = true

UNION ALL

SELECT 
  'Total Roles Activos' as metrica,
  COUNT(*)::TEXT as valor
FROM cea.roles
WHERE active = true

UNION ALL

SELECT 
  'Total Privilegios' as metrica,
  COUNT(*)::TEXT as valor
FROM cea.privileges

UNION ALL

SELECT 
  'Total Asignaciones Usuario-Rol' as metrica,
  COUNT(*)::TEXT as valor
FROM cea.users_roles

UNION ALL

SELECT 
  'Total Asignaciones Rol-Privilegio' as metrica,
  COUNT(*)::TEXT as valor
FROM cea.roles_privileges

UNION ALL

SELECT 
  'Privilegios Sin Asignar' as metrica,
  COUNT(*)::TEXT as valor
FROM cea.privileges p
WHERE NOT EXISTS (
  SELECT 1 FROM cea.roles_privileges rp 
  WHERE rp.privilege_id = p.id
);

-- =====================================================
-- 10. VERIFICAR PRIVILEGIOS NO ASIGNADOS
-- =====================================================
\echo '=== 10. PRIVILEGIOS SIN ASIGNAR A NINGÚN ROL ==='

SELECT 
  p.name as privilegio_sin_usar,
  p.module as modulo,
  p.description as descripcion
FROM cea.privileges p
WHERE NOT EXISTS (
  SELECT 1 FROM cea.roles_privileges rp 
  WHERE rp.privilege_id = p.id
)
ORDER BY p.module, p.name;

-- =====================================================
-- TESTING COMPLETADO
-- =====================================================
\echo '=== TESTING COMPLETADO ==='
\echo 'Revisa los resultados arriba para verificar que todo esté correcto.'
\echo ''
\echo 'Pasos siguientes:'
\echo '1. Si hay privilegios sin asignar, revisa si deben asignarse a algún rol'
\echo '2. Crea más usuarios de prueba con diferentes roles'
\echo '3. Prueba el frontend con diferentes usuarios'
