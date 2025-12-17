-- =====================================================
-- SCRIPT COMPLETO: Sistema de Roles y Privilegios CEA
-- =====================================================
-- Este script configura el sistema completo de RBAC en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Establecer el esquema
SET search_path TO cea;

-- =====================================================
-- 1. VERIFICAR Y CREAR TABLAS (si no existen)
-- =====================================================

-- Tabla de privilegios (ya existe, solo verificamos estructura)
CREATE TABLE IF NOT EXISTS cea.privileges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de roles (ya existe, verificamos estructura)
CREATE TABLE IF NOT EXISTS cea.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  hierarchical_level INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios (verificar que existe)
CREATE TABLE IF NOT EXISTS cea.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREAR TABLA DE RELACIÓN USUARIOS-ROLES
-- =====================================================
-- TRUNCATE si existe y recrear para garantizar integridad
DROP TABLE IF EXISTS cea.users_roles CASCADE;

CREATE TABLE cea.users_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES cea.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES cea.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES cea.users(id) ON DELETE SET NULL,
  assignment_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_users_roles_user_id ON cea.users_roles(user_id);
CREATE INDEX idx_users_roles_role_id ON cea.users_roles(role_id);

-- =====================================================
-- 3. CREAR TABLA DE RELACIÓN ROLES-PRIVILEGIOS
-- =====================================================
-- TRUNCATE si existe y recrear para garantizar integridad
DROP TABLE IF EXISTS cea.roles_privileges CASCADE;

CREATE TABLE cea.roles_privileges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES cea.roles(id) ON DELETE CASCADE,
  privilege_id UUID NOT NULL REFERENCES cea.privileges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, privilege_id)
);

CREATE INDEX idx_roles_privileges_role_id ON cea.roles_privileges(role_id);
CREATE INDEX idx_roles_privileges_privilege_id ON cea.roles_privileges(privilege_id);

-- =====================================================
-- 4. SINCRONIZAR PRIVILEGIOS CON CSV
-- =====================================================
-- Los privilegios ya existen en la tabla, solo agregamos los faltantes

-- Verificar que los privilegios del CSV existan
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
-- 5. ASIGNAR PRIVILEGIOS A ROLES SEGÚN MATRIZ CSV
-- =====================================================

-- Función helper para obtener IDs
DO $$
DECLARE
  -- IDs de roles
  rol_ciudadano UUID;
  rol_representante UUID;
  rol_agente_contacto UUID;
  rol_agente_resolutora UUID;
  rol_coordinador UUID;
  rol_dueno_proceso UUID;
  rol_admin_funcional UUID;
  rol_admin_tecnico UUID;
  rol_auditor UUID;
  rol_administrador UUID;
  
  -- IDs de privilegios
  priv_acceso_dashboard UUID := '378c249d-52f2-4b3e-99bf-9caf586feb4c';
  priv_generar_reportes UUID := '43b06529-d8b9-4075-b19b-ca5980dc1cc8';
  priv_descargar_reportes UUID := 'd232d869-3d4e-4bb4-8920-6917b2ae65e3';
  priv_compartir_reportes UUID := '4a25be77-99eb-4c40-bfdb-2a27cbb4df57';
  priv_ver_tickets UUID := '75131b8f-65cd-4bf2-9628-cee693e6ba5d';
  priv_crear_ticket UUID := '7403b69f-cfe9-481b-8a5a-4f3761fc8755';
  priv_tomar_ticket UUID := '32f2e927-d0f2-4f7a-90b4-7dc69f046a90';
  priv_editar_ticket UUID := '1b45773d-1084-4f5d-af42-87f9d9654668';
  priv_cerrar_ticket UUID := '83767d20-7160-4b45-a9cb-cc4b1abed845';
  priv_reabrir_ticket UUID := 'b59af4c9-2dd7-4c99-a4c2-f36fc45adab3';
  priv_asignar_ticket UUID := 'ec5abff5-e28a-488e-9fef-462a00b34848';
  priv_reasignar_ticket UUID := 'f7309c36-7385-4d9f-9ff5-38bca469b30f';
  priv_priorizar_ticket UUID := 'ab3182c0-b92b-43e4-8258-bb2f33d178a1';
  priv_ver_historial UUID := '6ade095a-5dcb-4323-886e-0e1290798345';
  priv_adjuntar_archivos UUID := '66114c78-4c5e-450f-b61d-e3d7aa5be0f5';
  priv_crear_orden UUID := 'c6db3d6c-51e2-4b8b-95da-570902157552';
  priv_crear_agente UUID := 'a5c0d14c-3e64-403f-8884-9be7814fcf89';
  priv_editar_agente UUID := '33c161be-b6a2-4798-a873-a1658bad6ab5';
  priv_eliminar_agente UUID := 'b78d3ad9-a95c-494c-9c52-7732fe3b142c';
  priv_aprobar_usuario UUID := 'f1b9d0fc-6dc1-422b-bc44-c9ef506afc99';
  priv_editar_info_usuario UUID := '0751b147-22fa-4bd2-a028-1aa55d681c22';
  priv_eliminar_usuario UUID := '493759da-ef58-4d20-a7a3-09cb2cbf7747';
  priv_asignar_roles UUID := '8b0fbfff-3e80-478e-91df-c2017ada8506';
  priv_ver_contratos UUID := '42717957-38b6-4d50-a797-1f5b23ce2201';
  priv_ver_lecturas UUID := '07d322a2-bb5c-41e9-b4db-2732976f5b3a';
  priv_ver_deuda UUID := 'cf20f3a9-4f37-4724-b49d-0c5e165502d5';
BEGIN
  -- Obtener IDs de roles (buscar por nombre)
  SELECT id INTO rol_ciudadano FROM cea.roles WHERE name = 'Ciudadano';
  SELECT id INTO rol_representante FROM cea.roles WHERE name = 'Representante de organización';
  SELECT id INTO rol_agente_contacto FROM cea.roles WHERE name = 'Agente de Contacto';
  SELECT id INTO rol_agente_resolutora FROM cea.roles WHERE name = 'Agente de Área Resolutora';
  SELECT id INTO rol_coordinador FROM cea.roles WHERE name = 'Coordinador de Área';
  SELECT id INTO rol_dueno_proceso FROM cea.roles WHERE name = 'Dueño de Proceso / Servicio';
  SELECT id INTO rol_admin_funcional FROM cea.roles WHERE name = 'Administrador Funcional';
  SELECT id INTO rol_admin_tecnico FROM cea.roles WHERE name = 'Administrador Técnico';
  SELECT id INTO rol_auditor FROM cea.roles WHERE name = 'Auditor / Transparencia';
  SELECT id INTO rol_administrador FROM cea.roles WHERE name = 'Administrador';

  -- Limpiar asignaciones existentes
  TRUNCATE cea.roles_privileges;

  -- CIUDADANO
  IF rol_ciudadano IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_ciudadano, priv_ver_tickets),
    (rol_ciudadano, priv_crear_ticket),
    (rol_ciudadano, priv_editar_ticket),
    (rol_ciudadano, priv_cerrar_ticket),
    (rol_ciudadano, priv_reabrir_ticket),
    (rol_ciudadano, priv_ver_historial),
    (rol_ciudadano, priv_adjuntar_archivos),
    (rol_ciudadano, priv_ver_contratos),
    (rol_ciudadano, priv_ver_lecturas),
    (rol_ciudadano, priv_ver_deuda);
  END IF;

  -- REPRESENTANTE DE ORGANIZACIÓN
  IF rol_representante IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_representante, priv_acceso_dashboard),
    (rol_representante, priv_descargar_reportes),
    (rol_representante, priv_ver_tickets),
    (rol_representante, priv_crear_ticket),
    (rol_representante, priv_editar_ticket),
    (rol_representante, priv_cerrar_ticket),
    (rol_representante, priv_reabrir_ticket),
    (rol_representante, priv_ver_historial),
    (rol_representante, priv_adjuntar_archivos),
    (rol_representante, priv_ver_contratos),
    (rol_representante, priv_ver_lecturas),
    (rol_representante, priv_ver_deuda);
  END IF;

  -- AGENTE DE CONTACTO
  IF rol_agente_contacto IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_agente_contacto, priv_acceso_dashboard),
    (rol_agente_contacto, priv_ver_tickets),
    (rol_agente_contacto, priv_crear_ticket),
    (rol_agente_contacto, priv_tomar_ticket),
    (rol_agente_contacto, priv_editar_ticket),
    (rol_agente_contacto, priv_cerrar_ticket),
    (rol_agente_contacto, priv_reabrir_ticket),
    (rol_agente_contacto, priv_asignar_ticket),
    (rol_agente_contacto, priv_reasignar_ticket),
    (rol_agente_contacto, priv_priorizar_ticket),
    (rol_agente_contacto, priv_ver_historial),
    (rol_agente_contacto, priv_adjuntar_archivos),
    (rol_agente_contacto, priv_ver_contratos),
    (rol_agente_contacto, priv_ver_lecturas),
    (rol_agente_contacto, priv_ver_deuda);
  END IF;

  -- AGENTE DE ÁREA RESOLUTORA
  IF rol_agente_resolutora IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_agente_resolutora, priv_acceso_dashboard),
    (rol_agente_resolutora, priv_ver_tickets),
    (rol_agente_resolutora, priv_crear_ticket),
    (rol_agente_resolutora, priv_tomar_ticket),
    (rol_agente_resolutora, priv_editar_ticket),
    (rol_agente_resolutora, priv_cerrar_ticket),
    (rol_agente_resolutora, priv_reabrir_ticket),
    (rol_agente_resolutora, priv_ver_historial),
    (rol_agente_resolutora, priv_adjuntar_archivos),
    (rol_agente_resolutora, priv_crear_orden),
    (rol_agente_resolutora, priv_ver_contratos),
    (rol_agente_resolutora, priv_ver_lecturas),
    (rol_agente_resolutora, priv_ver_deuda);
  END IF;

  -- COORDINADOR DE ÁREA
  IF rol_coordinador IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_coordinador, priv_acceso_dashboard),
    (rol_coordinador, priv_generar_reportes),
    (rol_coordinador, priv_descargar_reportes),
    (rol_coordinador, priv_compartir_reportes),
    (rol_coordinador, priv_ver_tickets),
    (rol_coordinador, priv_crear_ticket),
    (rol_coordinador, priv_tomar_ticket),
    (rol_coordinador, priv_editar_ticket),
    (rol_coordinador, priv_cerrar_ticket),
    (rol_coordinador, priv_reabrir_ticket),
    (rol_coordinador, priv_asignar_ticket),
    (rol_coordinador, priv_reasignar_ticket),
    (rol_coordinador, priv_priorizar_ticket),
    (rol_coordinador, priv_ver_historial),
    (rol_coordinador, priv_adjuntar_archivos),
    (rol_coordinador, priv_crear_orden),
    (rol_coordinador, priv_ver_contratos),
    (rol_coordinador, priv_ver_lecturas),
    (rol_coordinador, priv_ver_deuda);
  END IF;

  -- DUEÑO DE PROCESO / SERVICIO
  IF rol_dueno_proceso IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_dueno_proceso, priv_acceso_dashboard),
    (rol_dueno_proceso, priv_generar_reportes),
    (rol_dueno_proceso, priv_descargar_reportes),
    (rol_dueno_proceso, priv_compartir_reportes),
    (rol_dueno_proceso, priv_ver_tickets),
    (rol_dueno_proceso, priv_priorizar_ticket),
    (rol_dueno_proceso, priv_ver_historial),
    (rol_dueno_proceso, priv_adjuntar_archivos),
    (rol_dueno_proceso, priv_crear_orden),
    (rol_dueno_proceso, priv_ver_contratos),
    (rol_dueno_proceso, priv_ver_lecturas),
    (rol_dueno_proceso, priv_ver_deuda);
  END IF;

  -- ADMINISTRADOR FUNCIONAL (todos los permisos)
  IF rol_admin_funcional IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_admin_funcional, priv_acceso_dashboard),
    (rol_admin_funcional, priv_generar_reportes),
    (rol_admin_funcional, priv_descargar_reportes),
    (rol_admin_funcional, priv_compartir_reportes),
    (rol_admin_funcional, priv_ver_tickets),
    (rol_admin_funcional, priv_crear_ticket),
    (rol_admin_funcional, priv_tomar_ticket),
    (rol_admin_funcional, priv_editar_ticket),
    (rol_admin_funcional, priv_cerrar_ticket),
    (rol_admin_funcional, priv_reabrir_ticket),
    (rol_admin_funcional, priv_asignar_ticket),
    (rol_admin_funcional, priv_reasignar_ticket),
    (rol_admin_funcional, priv_priorizar_ticket),
    (rol_admin_funcional, priv_ver_historial),
    (rol_admin_funcional, priv_adjuntar_archivos),
    (rol_admin_funcional, priv_crear_orden),
    (rol_admin_funcional, priv_crear_agente),
    (rol_admin_funcional, priv_editar_agente),
    (rol_admin_funcional, priv_eliminar_agente),
    (rol_admin_funcional, priv_aprobar_usuario),
    (rol_admin_funcional, priv_editar_info_usuario),
    (rol_admin_funcional, priv_eliminar_usuario),
    (rol_admin_funcional, priv_asignar_roles),
    (rol_admin_funcional, priv_ver_contratos),
    (rol_admin_funcional, priv_ver_lecturas),
    (rol_admin_funcional, priv_ver_deuda);
  END IF;

  -- ADMINISTRADOR TÉCNICO (todos los permisos)
  IF rol_admin_tecnico IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_admin_tecnico, priv_acceso_dashboard),
    (rol_admin_tecnico, priv_generar_reportes),
    (rol_admin_tecnico, priv_descargar_reportes),
    (rol_admin_tecnico, priv_compartir_reportes),
    (rol_admin_tecnico, priv_ver_tickets),
    (rol_admin_tecnico, priv_crear_ticket),
    (rol_admin_tecnico, priv_tomar_ticket),
    (rol_admin_tecnico, priv_editar_ticket),
    (rol_admin_tecnico, priv_cerrar_ticket),
    (rol_admin_tecnico, priv_reabrir_ticket),
    (rol_admin_tecnico, priv_asignar_ticket),
    (rol_admin_tecnico, priv_reasignar_ticket),
    (rol_admin_tecnico, priv_priorizar_ticket),
    (rol_admin_tecnico, priv_ver_historial),
    (rol_admin_tecnico, priv_adjuntar_archivos),
    (rol_admin_tecnico, priv_crear_orden),
    (rol_admin_tecnico, priv_crear_agente),
    (rol_admin_tecnico, priv_editar_agente),
    (rol_admin_tecnico, priv_eliminar_agente),
    (rol_admin_tecnico, priv_aprobar_usuario),
    (rol_admin_tecnico, priv_editar_info_usuario),
    (rol_admin_tecnico, priv_eliminar_usuario),
    (rol_admin_tecnico, priv_asignar_roles),
    (rol_admin_tecnico, priv_ver_contratos),
    (rol_admin_tecnico, priv_ver_lecturas),
    (rol_admin_tecnico, priv_ver_deuda);
  END IF;

  -- AUDITOR / TRANSPARENCIA
  IF rol_auditor IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_auditor, priv_acceso_dashboard),
    (rol_auditor, priv_generar_reportes),
    (rol_auditor, priv_descargar_reportes),
    (rol_auditor, priv_compartir_reportes),
    (rol_auditor, priv_ver_tickets),
    (rol_auditor, priv_ver_historial),
    (rol_auditor, priv_ver_contratos),
    (rol_auditor, priv_ver_lecturas),
    (rol_auditor, priv_ver_deuda);
  END IF;

  -- ADMINISTRADOR (todos los permisos)
  IF rol_administrador IS NOT NULL THEN
    INSERT INTO cea.roles_privileges (role_id, privilege_id) VALUES
    (rol_administrador, priv_acceso_dashboard),
    (rol_administrador, priv_generar_reportes),
    (rol_administrador, priv_descargar_reportes),
    (rol_administrador, priv_compartir_reportes),
    (rol_administrador, priv_ver_tickets),
    (rol_administrador, priv_crear_ticket),
    (rol_administrador, priv_tomar_ticket),
    (rol_administrador, priv_editar_ticket),
    (rol_administrador, priv_cerrar_ticket),
    (rol_administrador, priv_reabrir_ticket),
    (rol_administrador, priv_asignar_ticket),
    (rol_administrador, priv_reasignar_ticket),
    (rol_administrador, priv_priorizar_ticket),
    (rol_administrador, priv_ver_historial),
    (rol_administrador, priv_adjuntar_archivos),
    (rol_administrador, priv_crear_orden),
    (rol_administrador, priv_crear_agente),
    (rol_administrador, priv_editar_agente),
    (rol_administrador, priv_eliminar_agente),
    (rol_administrador, priv_aprobar_usuario),
    (rol_administrador, priv_editar_info_usuario),
    (rol_administrador, priv_eliminar_usuario),
    (rol_administrador, priv_asignar_roles),
    (rol_administrador, priv_ver_contratos),
    (rol_administrador, priv_ver_lecturas),
    (rol_administrador, priv_ver_deuda);
  END IF;

  RAISE NOTICE 'Privilegios asignados correctamente a los roles';
END $$;

-- =====================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE cea.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.privileges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cea.roles_privileges ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura (todos los usuarios autenticados pueden leer)
CREATE POLICY "Allow authenticated read on users" ON cea.users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on roles" ON cea.roles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on privileges" ON cea.privileges FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on users_roles" ON cea.users_roles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on roles_privileges" ON cea.roles_privileges FOR SELECT USING (true);

-- =====================================================
-- 7. CREAR VISTA PARA CONSULTA RÁPIDA DE PERMISOS
-- =====================================================

CREATE OR REPLACE VIEW cea.user_permissions_view AS
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
-- 8. FUNCIÓN PARA VERIFICAR PERMISOS
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
-- 9. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar conteo de privilegios
SELECT COUNT(*) as total_privileges FROM cea.privileges;

-- Verificar roles
SELECT COUNT(*) as total_roles FROM cea.roles WHERE active = true;

-- Verificar asignaciones roles-privilegios
SELECT 
  r.name as role_name,
  COUNT(rp.privilege_id) as total_privileges
FROM cea.roles r
LEFT JOIN cea.roles_privileges rp ON r.id = rp.role_id
WHERE r.active = true
GROUP BY r.name
ORDER BY r.name;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
