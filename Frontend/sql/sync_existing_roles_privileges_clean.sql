-- =====================================================
-- SINCRONIZACIÓN DE ROLES Y PRIVILEGIOS EXISTENTES
-- =====================================================
-- Script compatible con Supabase SQL Editor
-- Ejecutar en: Supabase Dashboard > SQL Editor

SET search_path TO cea;

-- =====================================================
-- PASO 1: VALIDAR ESTRUCTURA DE TABLAS EXISTENTES
-- =====================================================

DO $$
BEGIN
  -- Verificar que existen todas las tablas necesarias
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'cea' AND table_name = 'users') THEN
    RAISE EXCEPTION 'La tabla cea.users no existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'cea' AND table_name = 'roles') THEN
    RAISE EXCEPTION 'La tabla cea.roles no existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'cea' AND table_name = 'privileges') THEN
    RAISE EXCEPTION 'La tabla cea.privileges no existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'cea' AND table_name = 'users_roles') THEN
    RAISE EXCEPTION 'La tabla cea.users_roles no existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'cea' AND table_name = 'roles_privileges') THEN
    RAISE EXCEPTION 'La tabla cea.roles_privileges no existe';
  END IF;
  
  RAISE NOTICE '✅ Todas las tablas existen correctamente';
END $$;

-- =====================================================
-- PASO 2: VERIFICAR Y ACTUALIZAR PRIVILEGIOS
-- =====================================================

-- Insertar/actualizar privilegios desde el CSV (usar UPSERT)
INSERT INTO cea.privileges (id, name, description, module, created_at) VALUES
('0751b147-22fa-4bd2-a028-1aa55d681c22', 'editar_info_usuario', 'Editar información de usuarios', 'usuarios', '2025-12-11 14:47:59.998241+00'),
('07d322a2-bb5c-41e9-b4db-2732976f5b3a', 'ver_lecturas', 'Ver lecturas de consumo', 'lecturas', '2025-12-11 14:47:59.998241+00'),
('1a64ef81-7182-4f33-9289-f56b464d3d9d', 'view_contracts', 'Ver contratos', 'contratos', '2025-12-12 01:06:43.424226+00'),
('1b45773d-1084-4f5d-af42-87f9d9654668', 'editar_ticket', 'Editar información de tickets', 'tickets', '2025-12-11 14:47:59.998241+00'),
('1d9fa9cb-0e0c-4c8b-95a8-de56e22c61e2', 'view_debt', 'Ver deuda', 'deuda', '2025-12-12 01:06:43.424226+00'),
('32f2e927-d0f2-4f7a-90b4-7dc69f046a90', 'tomar_ticket', 'Tomar/asignar ticket a sí mismo', 'tickets', '2025-12-11 14:47:59.998241+00'),
('33c161be-b6a2-4798-a873-a1658bad6ab5', 'editar_agente', 'Editar información de agentes', 'agentes', '2025-12-11 14:47:59.998241+00'),
('378c249d-52f2-4b3e-99bf-9caf586feb4c', 'acceso_dashboard', 'Acceso al panel principal', 'dashboard', '2025-12-11 14:47:59.998241+00'),
('42717957-38b6-4d50-a797-1f5b23ce2201', 'ver_numero_contratos', 'Ver número de contratos asociados', 'contratos', '2025-12-11 14:47:59.998241+00'),
('43b06529-d8b9-4075-b19b-ca5980dc1cc8', 'generar_reportes', 'Generar reportes y gráficos del sistema', 'reportes', '2025-12-11 14:47:59.998241+00'),
('471e4fb7-b710-4550-8063-f039e088033d', 'access_admin_panel', 'Acceder al panel de administración', 'administracion', '2025-12-12 01:06:43.424226+00'),
('493759da-ef58-4d20-a7a3-09cb2cbf7747', 'eliminar_usuario', 'Eliminar usuarios del sistema', 'usuarios', '2025-12-11 14:47:59.998241+00'),
('4a25be77-99eb-4c40-bfdb-2a27cbb4df57', 'compartir_reportes', 'Compartir reportes con otros usuarios', 'reportes', '2025-12-11 14:47:59.998241+00'),
('66114c78-4c5e-450f-b61d-e3d7aa5be0f5', 'adjuntar_archivos', 'Adjuntar archivos a tickets', 'tickets', '2025-12-11 14:47:59.998241+00'),
('6ade095a-5dcb-4323-886e-0e1290798345', 'ver_historial_conversacion', 'Ver historial de conversaciones del ticket', 'tickets', '2025-12-11 14:47:59.998241+00'),
('7403b69f-cfe9-481b-8a5a-4f3761fc8755', 'crear_ticket', 'Crear nuevos tickets', 'tickets', '2025-12-11 14:47:59.998241+00'),
('75131b8f-65cd-4bf2-9628-cee693e6ba5d', 'view_tickets', 'Ver tickets', 'tickets', '2025-12-12 01:06:43.424226+00'),
('83767d20-7160-4b45-a9cb-cc4b1abed845', 'cerrar_ticket', 'Cerrar tickets resueltos', 'tickets', '2025-12-11 14:47:59.998241+00'),
('8b0fbfff-3e80-478e-91df-c2017ada8506', 'asignar_roles', 'Asignar roles a usuarios', 'usuarios', '2025-12-11 14:47:59.998241+00'),
('9e38b5d6-4a4f-406b-8962-55284ee3f897', 'view_contract_details', 'Ver detalles de contratos', 'contratos', '2025-12-12 01:06:43.424226+00'),
('a4492417-cea8-4f2e-b53a-4775f09c6ed6', 'view_readings', 'Ver lecturas', 'lecturas', '2025-12-12 01:06:43.424226+00'),
('a5c0d14c-3e64-403f-8884-9be7814fcf89', 'crear_agente', 'Crear nuevos agentes en el sistema', 'agentes', '2025-12-11 14:47:59.998241+00'),
('ab3182c0-b92b-43e4-8258-bb2f33d178a1', 'priorizar_ticket', 'Cambiar prioridad de tickets', 'tickets', '2025-12-11 14:47:59.998241+00'),
('b59af4c9-2dd7-4c99-a4c2-f36fc45adab3', 'reabrir_ticket', 'Reabrir tickets cerrados', 'tickets', '2025-12-11 14:47:59.998241+00'),
('b78d3ad9-a95c-494c-9c52-7732fe3b142c', 'eliminar_agente', 'Eliminar agentes del sistema', 'agentes', '2025-12-11 14:47:59.998241+00'),
('bb1f98be-2920-4356-951e-c14a993e8b21', 'manage_agents', 'Gestionar agentes IA', 'agentes', '2025-12-12 01:06:43.424226+00'),
('bf0721ff-94b4-4baf-98a4-0671e4159c16', 'view_settings', 'Ver configuración', 'configuracion', '2025-12-12 01:06:43.424226+00'),
('c6db3d6c-51e2-4b8b-95da-570902157552', 'crear_orden_trabajo', 'Crear órdenes de trabajo', 'ordenes', '2025-12-11 14:47:59.998241+00'),
('cf20f3a9-4f37-4724-b49d-0c5e165502d5', 'ver_deuda', 'Ver información de deuda/adeudos', 'facturacion', '2025-12-11 14:47:59.998241+00'),
('cfd1ab90-be71-4ebe-a30b-7cfcff47b990', 'manage_contracts', 'Gestionar contratos', 'contratos', '2025-12-12 01:06:43.424226+00'),
('d232d869-3d4e-4bb4-8920-6917b2ae65e3', 'descargar_reportes', 'Descargar reportes generados', 'reportes', '2025-12-11 14:47:59.998241+00'),
('d5b53431-4dfa-496b-8c9f-4718f87588e5', 'view_dashboard', 'Ver dashboard principal', 'dashboard', '2025-12-12 01:06:43.424226+00'),
('dcb4c346-b891-4d6b-8d9f-b22b12231ca1', 'ver_tickets', 'Ver tickets del sistema', 'tickets', '2025-12-11 14:47:59.998241+00'),
('de2897dc-acae-4499-ba40-4fb0866e8265', 'create_ticket', 'Crear tickets', 'tickets', '2025-12-12 01:06:43.424226+00'),
('e7c9dda1-807f-47a3-8c58-ec8f84ca034e', 'manage_tickets', 'Gestionar tickets', 'tickets', '2025-12-12 01:06:43.424226+00'),
('ec5abff5-e28a-488e-9fef-462a00b34848', 'asignar_ticket', 'Asignar tickets a otros usuarios', 'tickets', '2025-12-11 14:47:59.998241+00'),
('f1b9d0fc-6dc1-422b-bc44-c9ef506afc99', 'aprobar_usuario', 'Aprobar registro de nuevos usuarios', 'usuarios', '2025-12-11 14:47:59.998241+00'),
('f7309c36-7385-4d9f-9ff5-38bca469b30f', 'reasignar_ticket', 'Reasignar tickets ya asignados', 'tickets', '2025-12-11 14:47:59.998241+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  module = EXCLUDED.module;

-- =====================================================
-- PASO 3: CREAR/RECREAR VISTA user_permissions_view
-- =====================================================

DROP VIEW IF EXISTS cea.user_permissions_view CASCADE;

CREATE VIEW cea.user_permissions_view AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  r.id as role_id,
  r.name as role_name,
  p.id as privilege_id,
  p.name as privilege_name,
  p.module as privilege_module
FROM cea.users u
JOIN cea.users_roles ur ON u.id = ur.user_id
JOIN cea.roles r ON ur.role_id = r.id
JOIN cea.roles_privileges rp ON r.id = rp.role_id
JOIN cea.privileges p ON rp.privilege_id = p.id
WHERE u.active = true AND r.active = true;

-- =====================================================
-- PASO 4: CREAR/RECREAR FUNCIÓN user_has_privilege
-- =====================================================

CREATE OR REPLACE FUNCTION cea.user_has_privilege(
  p_user_id UUID,
  p_privilege_name VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM cea.user_permissions_view 
    WHERE user_id = p_user_id 
    AND privilege_name = p_privilege_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASO 5: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE cea.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.privileges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.roles_privileges ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow authenticated read on users" ON cea.users;
DROP POLICY IF EXISTS "Allow authenticated read on roles" ON cea.roles;
DROP POLICY IF EXISTS "Allow authenticated read on privileges" ON cea.privileges;
DROP POLICY IF EXISTS "Allow authenticated read on users_roles" ON cea.users_roles;
DROP POLICY IF EXISTS "Allow authenticated read on roles_privileges" ON cea.roles_privileges;

-- Crear políticas para lectura (todos los usuarios autenticados pueden leer)
CREATE POLICY "Allow authenticated read on users" ON cea.users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on roles" ON cea.roles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on privileges" ON cea.privileges FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on users_roles" ON cea.users_roles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on roles_privileges" ON cea.roles_privileges FOR SELECT USING (true);

-- =====================================================
-- PASO 6: CREAR ÍNDICES PARA MEJORAR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_roles_user_id ON cea.users_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_roles_role_id ON cea.users_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_privileges_role_id ON cea.roles_privileges(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_privileges_privilege_id ON cea.roles_privileges(privilege_id);
CREATE INDEX IF NOT EXISTS idx_privileges_name ON cea.privileges(name);
CREATE INDEX IF NOT EXISTS idx_privileges_module ON cea.privileges(module);

-- =====================================================
-- FIN - Ejecuta las siguientes consultas para verificar
-- =====================================================

-- CONSULTA 1: Ver estadísticas
SELECT 
  'users' as tabla,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE active = true) as activos
FROM cea.users
UNION ALL
SELECT 
  'roles' as tabla,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE active = true) as activos
FROM cea.roles
UNION ALL
SELECT 
  'privileges' as tabla,
  COUNT(*) as total_registros,
  NULL as activos
FROM cea.privileges
UNION ALL
SELECT 
  'users_roles' as tabla,
  COUNT(*) as total_registros,
  NULL as activos
FROM cea.users_roles
UNION ALL
SELECT 
  'roles_privileges' as tabla,
  COUNT(*) as total_registros,
  NULL as activos
FROM cea.roles_privileges;

-- CONSULTA 2: Ver privilegios por módulo
-- SELECT module, COUNT(*) as total FROM cea.privileges GROUP BY module ORDER BY module;

-- CONSULTA 3: Ver roles y sus privilegios
-- SELECT r.name as rol, r.hierarchical_level as nivel, COUNT(rp.privilege_id) as total_privilegios
-- FROM cea.roles r
-- LEFT JOIN cea.roles_privileges rp ON r.id = rp.role_id
-- WHERE r.active = true
-- GROUP BY r.id, r.name, r.hierarchical_level
-- ORDER BY r.hierarchical_level, r.name;

-- CONSULTA 4: Probar la vista (ejecutar después)
-- SELECT * FROM cea.user_permissions_view LIMIT 5;
