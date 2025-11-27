-- Crear el esquema si no existe
CREATE SCHEMA IF NOT EXISTS cea;

-- Establecer el esquema por defecto para esta sesión
SET search_path TO cea;

-- Tabla de roles
CREATE TABLE cea.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  hierarchical_level INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de privilegios
CREATE TABLE cea.privileges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE cea.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Hash de la contraseña (usar bcrypt, argon2, etc.)
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación usuarios-roles
CREATE TABLE cea.users_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES cea.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES cea.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES cea.users(id),
  assignment_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Tabla de relación roles-privilegios
CREATE TABLE cea.roles_privileges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES cea.roles(id) ON DELETE CASCADE,
  privilege_id UUID NOT NULL REFERENCES cea.privileges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, privilege_id)
);

-- Insertar roles iniciales
INSERT INTO cea.roles (name, hierarchical_level, description) VALUES
('Administrador', 1, 'Acceso total al sistema'),
('Gerencia', 2, 'Gerencia general'),
('Subgerencia de Contratos', 3, 'Gestión de contratos'),
('Subgerencia de Factibilidades', 3, 'Gestión de factibilidades'),
('Subgerencia de Inspección y Vigilancia', 3, 'Inspección y vigilancia'),
('Subgerencia de Lecturas', 3, 'Gestión de lecturas'),
('Subgerencia de Limitación y Reconexión de Servicio', 3, 'Limitación y reconexión'),
('Subgerencia de Servicio al Cliente', 3, 'Atención al cliente'),
('Subgerencia de Soporte Técnico', 3, 'Soporte técnico'),
('Gerencia de Control y Seguimiento de Factibilidades', 2, 'Control de factibilidades'),
('Gerencia de Facturación', 2, 'Gestión de facturación'),
('Gerencia de Infraestructura Informática y Seg. de la Info.', 2, 'TI y seguridad'),
('Gerencia de Ingeniería de Operación', 2, 'Ingeniería operativa'),
('Gerencia de Medición de Consumos', 2, 'Medición de consumos'),
('Gerencia de Operación y Mantenimiento PTAR', 2, 'PTAR'),
('Gerencia de Programas de Inversión', 2, 'Programas de inversión'),
('Gerencia de Regularización de Asentamientos e Inspección', 2, 'Regularización'),
('Gerencia de Tesorería', 2, 'Gestión financiera'),
('Gerencia Jurídica de Recuperación de Cartera', 2, 'Recuperación jurídica'),
('Call Center Externo', 4, 'Atención telefónica'),
('Coordinación de Planeación y Proyectos Técnicos', 2, 'Planeación técnica'),
('Coordinación de Vinculación Comercial y Servicio al Cliente', 2, 'Vinculación comercial'),
('Coordinación General Ejecutiva', 1, 'Coordinación ejecutiva'),
('Gerencia Comercial', 2, 'Gestión comercial'),
('Gerencia de Administración de Proyectos', 2, 'Administración de proyectos'),
('Gerencia de Cartera Vencida Administrativa', 2, 'Cartera vencida'),
('Gerencia de Contratación y Padrón de Usuarios', 2, 'Contratación y padrón'),
('Gerencia de Control Sanitario y Pluvial', 2, 'Control sanitario');

-- Insertar privilegios iniciales
INSERT INTO cea.privileges (name, module, description) VALUES
-- Tickets
('crear_ticket', 'tickets', 'Crear nuevos tickets'),
('ver_tickets', 'tickets', 'Ver tickets asignados'),
('ver_todos_tickets', 'tickets', 'Ver todos los tickets del sistema'),
('editar_ticket', 'tickets', 'Editar tickets'),
('asignar_ticket', 'tickets', 'Asignar tickets a usuarios'),
('cerrar_ticket', 'tickets', 'Cerrar tickets'),
('eliminar_ticket', 'tickets', 'Eliminar tickets'),
('exportar_tickets', 'tickets', 'Exportar reportes de tickets'),

-- Usuarios
('crear_usuario', 'usuarios', 'Crear nuevos usuarios'),
('ver_usuarios', 'usuarios', 'Ver lista de usuarios'),
('editar_usuario', 'usuarios', 'Editar información de usuarios'),
('desactivar_usuario', 'usuarios', 'Desactivar usuarios'),
('asignar_roles', 'usuarios', 'Asignar roles a usuarios'),

-- Reportes
('ver_reportes', 'reportes', 'Ver reportes del sistema'),
('exportar_reportes', 'reportes', 'Exportar reportes'),

-- Configuración
('gestionar_roles', 'configuracion', 'Gestionar roles y permisos'),
('configurar_sistema', 'configuracion', 'Configurar parámetros del sistema');