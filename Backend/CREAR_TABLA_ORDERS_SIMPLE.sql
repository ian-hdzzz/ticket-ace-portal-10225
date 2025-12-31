-- PASO 1: Crear la tabla cea.orders (ejecutar en Supabase SQL Editor)

CREATE SCHEMA IF NOT EXISTS cea;

CREATE TABLE IF NOT EXISTS cea.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación con el ticket origen
    ticket_id UUID NOT NULL REFERENCES cea.tickets(id) ON DELETE CASCADE,
    
    -- Información básica de la orden
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('inspeccion', 'reparacion', 'mantenimiento', 'instalacion', 'revision')),
    motivo TEXT NOT NULL,
    
    -- Fechas importantes
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_programada DATE,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_finalizacion TIMESTAMP WITH TIME ZONE,
    
    -- Estado de la orden
    estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN (
        'pendiente', 'programada', 'en_proceso', 'pausada', 
        'completada', 'cancelada', 'rechazada'
    )),
    
    -- Información del trabajo
    observaciones TEXT,
    codigo_reparacion VARCHAR(100),
    descripcion_trabajo TEXT,
    
    -- Información de ubicación
    direccion TEXT,
    colonia VARCHAR(100),
    codigo_postal VARCHAR(10),
    coordenadas_gps POINT,
    
    -- Información de contrato y cliente
    numero_contrato VARCHAR(50),
    nombre_cliente VARCHAR(200),
    telefono_cliente VARCHAR(20),
    email_cliente VARCHAR(100),
    
    -- Asignación de personal
    asignado_a UUID REFERENCES cea.users(id),
    supervisor_id UUID REFERENCES cea.users(id),
    equipo_asignado VARCHAR(100),
    
    -- Información técnica
    prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente', 'critica')),
    tiempo_estimado_horas INTEGER,
    materiales_requeridos JSONB,
    herramientas_requeridas JSONB,
    
    -- Control de SLA
    sla_horas INTEGER DEFAULT 72,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    sla_cumplido BOOLEAN DEFAULT NULL,
    
    -- Resultados y cierre
    resultado VARCHAR(50) CHECK (resultado IN ('exitoso', 'parcial', 'fallido', 'reprogramado', NULL)),
    notas_cierre TEXT,
    materiales_utilizados JSONB,
    tiempo_real_horas DECIMAL(4,2),
    
    -- Seguimiento y escalamiento
    escalado BOOLEAN DEFAULT FALSE,
    escalado_a UUID REFERENCES cea.users(id),
    fecha_escalado TIMESTAMP WITH TIME ZONE,
    motivo_escalado TEXT,
    
    -- Control de calidad
    requiere_validacion BOOLEAN DEFAULT FALSE,
    validado_por UUID REFERENCES cea.users(id),
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    calificacion_cliente INTEGER CHECK (calificacion_cliente >= 1 AND calificacion_cliente <= 5),
    comentarios_cliente TEXT,
    
    -- Información de facturación
    costo_estimado DECIMAL(10,2),
    costo_real DECIMAL(10,2),
    facturable BOOLEAN DEFAULT TRUE,
    numero_factura VARCHAR(50),
    
    -- Metadatos y auditoría
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    archivos_adjuntos JSONB DEFAULT '[]',
    
    -- Auditoría
    created_by UUID REFERENCES cea.users(id),
    updated_by UUID REFERENCES cea.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para generar número de orden automático
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    month_str TEXT := TO_CHAR(NOW(), 'MM');
    counter INTEGER;
    new_number TEXT;
BEGIN
    IF NEW.numero_orden IS NOT NULL AND NEW.numero_orden != '' THEN
        RETURN NEW;
    END IF;
    
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(numero_orden, '-', 4) AS INTEGER)
    ), 0) + 1
    INTO counter
    FROM cea.orders 
    WHERE numero_orden LIKE 'ORD-' || year_str || '-' || month_str || '-%';
    
    new_number := 'ORD-' || year_str || '-' || month_str || '-' || LPAD(counter::TEXT, 4, '0');
    NEW.numero_orden := new_number;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger para generar número de orden
DROP TRIGGER IF EXISTS generate_order_number_trigger ON cea.orders;
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON cea.orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_orders_ticket_id ON cea.orders(ticket_id);
CREATE INDEX IF NOT EXISTS idx_orders_estado ON cea.orders(estado);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON cea.orders(created_at);

-- Permisos básicos
GRANT SELECT, INSERT, UPDATE, DELETE ON cea.orders TO authenticated;
GRANT USAGE ON SCHEMA cea TO authenticated;
