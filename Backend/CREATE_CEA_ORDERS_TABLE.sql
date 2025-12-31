-- Crear tabla de órdenes de trabajo (CEA Orders)
-- Esta tabla almacenará las órdenes de trabajo generadas desde tickets

CREATE TABLE IF NOT EXISTS cea.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación con el ticket origen
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Información básica de la orden
    numero_orden VARCHAR(50) UNIQUE NOT NULL, -- Número único de la orden (ej: ORD-2024-001)
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('inspeccion', 'reparacion', 'mantenimiento', 'instalacion', 'revision')),
    motivo TEXT NOT NULL, -- Motivo de la orden
    
    -- Fechas importantes
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_programada DATE, -- Fecha fin programada
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_finalizacion TIMESTAMP WITH TIME ZONE,
    
    -- Estado de la orden
    estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN (
        'pendiente', 'programada', 'en_proceso', 'pausada', 
        'completada', 'cancelada', 'rechazada'
    )),
    
    -- Información del trabajo
    observaciones TEXT, -- Observaciones generales de la orden
    codigo_reparacion VARCHAR(100), -- Código de reparación específico
    descripcion_trabajo TEXT, -- Descripción detallada del trabajo a realizar
    
    -- Información de ubicación (heredada del ticket pero puede ser modificada)
    direccion TEXT,
    colonia VARCHAR(100),
    codigo_postal VARCHAR(10),
    coordenadas_gps POINT, -- Para ubicación exacta si está disponible
    
    -- Información de contrato y cliente
    numero_contrato VARCHAR(50),
    nombre_cliente VARCHAR(200),
    telefono_cliente VARCHAR(20),
    email_cliente VARCHAR(100),
    
    -- Asignación de personal
    asignado_a UUID REFERENCES users(id), -- Técnico asignado
    supervisor_id UUID REFERENCES users(id), -- Supervisor de la orden
    equipo_asignado VARCHAR(100), -- Nombre del equipo de trabajo
    
    -- Información técnica
    prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente', 'critica')),
    tiempo_estimado_horas INTEGER, -- Tiempo estimado en horas
    materiales_requeridos JSONB, -- Lista de materiales necesarios
    herramientas_requeridas JSONB, -- Lista de herramientas necesarias
    
    -- Control de SLA
    sla_horas INTEGER DEFAULT 72, -- SLA en horas desde la creación
    sla_deadline TIMESTAMP WITH TIME ZONE, -- Calculado por trigger
    sla_cumplido BOOLEAN DEFAULT NULL, -- NULL=pendiente, true=cumplido, false=incumplido
    
    -- Resultados y cierre
    resultado VARCHAR(50) CHECK (resultado IN ('exitoso', 'parcial', 'fallido', 'reprogramado', NULL)),
    notas_cierre TEXT, -- Notas finales al cerrar la orden
    materiales_utilizados JSONB, -- Materiales realmente utilizados
    tiempo_real_horas DECIMAL(4,2), -- Tiempo real invertido
    
    -- Seguimiento y escalamiento
    escalado BOOLEAN DEFAULT FALSE,
    escalado_a UUID REFERENCES users(id), -- A quién se escaló
    fecha_escalado TIMESTAMP WITH TIME ZONE,
    motivo_escalado TEXT,
    
    -- Control de calidad
    requiere_validacion BOOLEAN DEFAULT FALSE,
    validado_por UUID REFERENCES users(id),
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    calificacion_cliente INTEGER CHECK (calificacion_cliente >= 1 AND calificacion_cliente <= 5),
    comentarios_cliente TEXT,
    
    -- Información de facturación
    costo_estimado DECIMAL(10,2),
    costo_real DECIMAL(10,2),
    facturable BOOLEAN DEFAULT TRUE,
    numero_factura VARCHAR(50),
    
    -- Metadatos y auditoría
    metadata JSONB DEFAULT '{}', -- Información adicional flexible
    tags TEXT[] DEFAULT '{}', -- Tags para categorización
    archivos_adjuntos JSONB DEFAULT '[]', -- URLs de archivos relacionados
    
    -- Auditoría
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_orders_ticket_id ON cea.orders(ticket_id);
CREATE INDEX idx_orders_numero_orden ON cea.orders(numero_orden);
CREATE INDEX idx_orders_estado ON cea.orders(estado);
CREATE INDEX idx_orders_tipo ON cea.orders(tipo);
CREATE INDEX idx_orders_asignado_a ON cea.orders(asignado_a);
CREATE INDEX idx_orders_fecha_programada ON cea.orders(fecha_programada);
CREATE INDEX idx_orders_prioridad ON cea.orders(prioridad);
CREATE INDEX idx_orders_created_at ON cea.orders(created_at);
CREATE INDEX idx_orders_sla_deadline ON cea.orders(sla_deadline);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_orders_estado_prioridad ON cea.orders(estado, prioridad);
CREATE INDEX idx_orders_asignado_estado ON cea.orders(asignado_a, estado);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON cea.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Trigger para calcular SLA deadline automáticamente
CREATE OR REPLACE FUNCTION calculate_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular sla_deadline si no está establecido
    IF NEW.sla_deadline IS NULL THEN
        NEW.sla_deadline = NEW.fecha_creacion + INTERVAL '1 hour' * COALESCE(NEW.sla_horas, 72);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_sla_deadline_trigger
    BEFORE INSERT OR UPDATE ON cea.orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sla_deadline();

-- Trigger para actualizar SLA cumplido automáticamente
CREATE OR REPLACE FUNCTION update_orders_sla_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actualizar si el estado cambió a completada y sla_cumplido es NULL
    IF NEW.estado = 'completada' AND OLD.estado != 'completada' AND NEW.sla_cumplido IS NULL THEN
        NEW.sla_cumplido = (NEW.fecha_finalizacion <= NEW.sla_deadline);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_sla_status
    BEFORE UPDATE ON cea.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_sla_status();

-- Función para generar número de orden automático
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    month_str TEXT := TO_CHAR(NOW(), 'MM');
    counter INTEGER;
    new_number TEXT;
BEGIN
    -- Si ya tiene número, no generar uno nuevo
    IF NEW.numero_orden IS NOT NULL AND NEW.numero_orden != '' THEN
        RETURN NEW;
    END IF;
    
    -- Obtener el siguiente contador para el año/mes actual
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(numero_orden, '-', 4) AS INTEGER)
    ), 0) + 1
    INTO counter
    FROM cea.orders 
    WHERE numero_orden LIKE 'ORD-' || year_str || '-' || month_str || '-%';
    
    -- Generar el nuevo número
    new_number := 'ORD-' || year_str || '-' || month_str || '-' || LPAD(counter::TEXT, 4, '0');
    
    NEW.numero_orden := new_number;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON cea.orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Comentarios para documentar la tabla
COMMENT ON TABLE cea.orders IS 'Órdenes de trabajo generadas desde tickets del sistema';
COMMENT ON COLUMN cea.orders.ticket_id IS 'ID del ticket que originó esta orden de trabajo';
COMMENT ON COLUMN cea.orders.numero_orden IS 'Número único de la orden en formato ORD-YYYY-MM-0001';
COMMENT ON COLUMN cea.orders.tipo IS 'Tipo de orden: inspección, reparación, mantenimiento, etc.';
COMMENT ON COLUMN cea.orders.sla_deadline IS 'Fecha límite calculada automáticamente basada en SLA';
COMMENT ON COLUMN cea.orders.metadata IS 'Información adicional en formato JSON';
COMMENT ON COLUMN cea.orders.materiales_requeridos IS 'Lista de materiales necesarios en formato JSON';
COMMENT ON COLUMN cea.orders.herramientas_requeridas IS 'Lista de herramientas necesarias en formato JSON';

-- Insertar algunos datos de ejemplo para testing
INSERT INTO cea.orders (
    ticket_id,
    tipo,
    motivo,
    fecha_programada,
    observaciones,
    direccion,
    numero_contrato,
    nombre_cliente,
    prioridad,
    tiempo_estimado_horas,
    created_by
) VALUES 
(
    (SELECT id FROM tickets LIMIT 1), -- Usar un ticket existente
    'inspeccion',
    'Revisión de instalación reportada por cliente',
    CURRENT_DATE + INTERVAL '3 days',
    'Cliente reporta problemas con el servicio. Realizar inspección completa.',
    'Calle Principal #123, Col. Centro',
    'CTR-2024-001',
    'Juan Pérez García',
    'media',
    4,
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
) ON CONFLICT DO NOTHING;
