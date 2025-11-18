-- Script de Seed para insertar 20 tickets de ejemplo
-- Contexto: Comisión Estatal de Agua de Querétaro (CEA)
-- Ejecuta este script en el SQL Editor de Supabase

-- Insertar 20 tickets de ejemplo con datos realistas
INSERT INTO cea.tickets (
  folio, 
  titulo, 
  descripcion, 
  customer_id, 
  service_type, 
  ticket_type, 
  status, 
  priority, 
  channel, 
  tags, 
  metadata
) VALUES 
-- Ticket 1
(
  'CEA-2025-001001', 
  'Falta de suministro en colonia Loma Dorada', 
  'Los vecinos reportan que no tienen agua desde hace 12 horas en la colonia Loma Dorada', 
  NULL, 
  'reportes_fugas', 
  'FUG', 
  'abierto', 
  'urgente', 
  'telefono', 
  ARRAY['desabasto', 'urgente', 'colonia'], 
  '{"municipio": "Querétaro", "colonia": "Loma Dorada", "tiempo_sin_agua": "12 horas", "familias_afectadas": 150}'::jsonb
),

-- Ticket 2
(
  'CEA-2025-001002', 
  'Fuga importante en Av. Constituyentes', 
  'Fuga de gran magnitud en Av. Constituyentes altura del 1500, formación de socavón', 
  NULL, 
  'reportes_fugas', 
  'FUG', 
  'en_proceso', 
  'urgente', 
  'app_movil', 
  ARRAY['fuga', 'socavon', 'avenida_principal'], 
  '{"municipio": "Querétaro", "ubicacion": "Av. Constituyentes #1500", "tipo_fuga": "tubería_principal", "afecta_vialidad": true, "requiere_cierre_vial": true}'::jsonb
),

-- Ticket 3
(
  'CEA-2025-001003', 
  'Aclaración de cargo por consumo excesivo', 
  'Usuario solicita revisión de su recibo por consumo inusualmente alto', 
  NULL, 
  'aclaraciones', 
  'ACL', 
  'esperando_cliente', 
  'media', 
  'presencial', 
  ARRAY['consumo_alto', 'aclaracion', 'recibo'], 
  '{"numero_contrato": "QRO-45678", "periodo": "Oct-Nov 2025", "consumo_promedio": "8m3", "consumo_facturado": "35m3", "municipio": "Querétaro"}'::jsonb
),

-- Ticket 4
(
  'CEA-2025-001004', 
  'Solicitud de nueva toma en El Marqués', 
  'Ciudadano solicita instalación de nueva toma de agua para construcción de vivienda', 
  NULL, 
  'contratacion_cambio', 
  'CON', 
  'abierto', 
  'media', 
  'presencial', 
  ARRAY['nueva_toma', 'el_marques', 'vivienda'], 
  '{"municipio": "El Marqués", "direccion": "Fracc. Real Solare Mz 15 Lt 8", "tipo_servicio": "doméstico", "factibilidad": "pendiente"}'::jsonb
),

-- Ticket 5
(
  'CEA-2025-001005', 
  'Agua turbia en colonia El Refugio', 
  'Múltiples reportes de agua turbia y con mal olor en colonia El Refugio', 
  NULL, 
  'revision_recibo', 
  'REV', 
  'escalado', 
  'alta', 
  'telefono', 
  ARRAY['calidad_agua', 'turbia', 'olor'], 
  '{"municipio": "Querétaro", "colonia": "El Refugio", "reportes_similares": 15, "requiere_analisis_laboratorio": true}'::jsonb
),

-- Ticket 6
(
  'CEA-2025-001006', 
  'Pago no aplicado en sistema', 
  'Usuario realizó pago en Oxxo pero no se refleja en el sistema de CEA', 
  NULL, 
  'pago_recibo', 
  'PAG', 
  'abierto', 
  'alta', 
  'web_chat', 
  ARRAY['pago', 'oxxo', 'no_reflejado'], 
  '{"referencia": "CEA987654321", "monto": "384.50", "fecha_pago": "2025-11-16", "establecimiento": "Oxxo 5 de Febrero"}'::jsonb
),

-- Ticket 7
(
  'CEA-2025-001007', 
  'Medidor dañado por vandalismo', 
  'Reporte de medidor dañado presuntamente por vandalismo en colonia San Pablo', 
  NULL, 
  'revision_recibo', 
  'REV', 
  'en_proceso', 
  'alta', 
  'telefono', 
  ARRAY['medidor', 'vandalismo', 'dañado'], 
  '{"municipio": "Querétaro", "numero_medidor": "QRO-MED-78945", "colonia": "San Pablo", "requiere_reemplazo": true, "levantar_acta": true}'::jsonb
),

-- Ticket 8
(
  'CEA-2025-001008', 
  'Solicitud de ajuste tarifario', 
  'Empresa solicita cambio de tarifa de doméstica a comercial', 
  NULL, 
  'actualizar_caso', 
  'ACT', 
  'esperando_cliente', 
  'media', 
  'email', 
  ARRAY['cambio_tarifa', 'comercial', 'empresa'], 
  '{"numero_contrato": "QRO-COM-1245", "tarifa_actual": "doméstica", "tarifa_solicitada": "comercial", "giro": "cafetería", "documentos_requeridos": ["RFC", "licencia_funcionamiento"]}'::jsonb
),

-- Ticket 9
(
  'CEA-2025-001009', 
  'Fuga en San Juan del Río zona centro', 
  'Fuga visible en calle Juárez esquina con Hidalgo, pérdida considerable de agua', 
  NULL, 
  'reportes_fugas', 
  'FUG', 
  'en_proceso', 
  'urgente', 
  'whatsapp', 
  ARRAY['fuga', 'san_juan_rio', 'centro'], 
  '{"municipio": "San Juan del Río", "ubicacion": "Juárez esq. Hidalgo", "tipo_via": "calle", "nivel_urgencia": "alto", "cuadrilla_asignada": "Cuadrilla 3"}'::jsonb
),

-- Ticket 10
(
  'CEA-2025-001010', 
  'Consulta sobre programa de tandeo', 
  'Ciudadano solicita información sobre horarios de tandeo en su colonia', 
  NULL, 
  'asesor_humano', 
  'URG', 
  'resuelto', 
  'baja', 
  'telefono', 
  ARRAY['tandeo', 'horarios', 'informacion'], 
  '{"municipio": "Corregidora", "colonia": "El Pueblito", "horario_tandeo": "6:00 AM - 10:00 PM", "dias": "lunes a domingo"}'::jsonb
),

-- Ticket 11
(
  'CEA-2025-001011', 
  'Recibo digital no disponible', 
  'Usuario no puede acceder a su recibo digital desde el portal de CEA', 
  NULL, 
  'recibo_digital', 
  'DIG', 
  'abierto', 
  'media', 
  'app_movil', 
  ARRAY['recibo_digital', 'portal', 'acceso'], 
  '{"numero_contrato": "QRO-34567", "error": "timeout", "navegador": "Safari iOS", "intento_acceso": "2025-11-18 09:30"}'::jsonb
),

-- Ticket 12
(
  'CEA-2025-001012', 
  'Reconexión de servicio Pedro Escobedo', 
  'Solicitud de reconexión de servicio después de pago de adeudo', 
  NULL, 
  'actualizar_caso', 
  'ACT', 
  'en_proceso', 
  'alta', 
  'presencial', 
  ARRAY['reconexion', 'pedro_escobedo', 'adeudo_pagado'], 
  '{"municipio": "Pedro Escobedo", "numero_contrato": "PED-9876", "adeudo_liquidado": "2,450.00", "fecha_pago": "2025-11-17", "corte_realizado": "2025-10-15"}'::jsonb
),

-- Ticket 13
(
  'CEA-2025-001013', 
  'Presión baja en fraccionamiento Jurica', 
  'Vecinos reportan baja presión de agua en todo el fraccionamiento', 
  NULL, 
  'reportes_fugas', 
  'FUG', 
  'escalado', 
  'alta', 
  'email', 
  ARRAY['presion_baja', 'jurica', 'fraccionamiento'], 
  '{"municipio": "Querétaro", "fraccionamiento": "Jurica", "casas_afectadas": 85, "requiere_revision_sistema": true, "posible_causa": "bomba"}'::jsonb
),

-- Ticket 14
(
  'CEA-2025-001014', 
  'Reporte de toma clandestina en Amazcala', 
  'Vecinos reportan posible toma clandestina en construcción abandonada', 
  NULL, 
  'reportes_fugas', 
  'FUG', 
  'esperando_interno', 
  'urgente', 
  'telefono', 
  ARRAY['toma_clandestina', 'amazcala', 'denuncia'], 
  '{"municipio": "El Marqués", "localidad": "Amazcala", "ubicacion": "Calle sin nombre s/n", "requiere_inspeccion": true, "coordinacion_policia": true}'::jsonb
),

-- Ticket 15
(
  'CEA-2025-001015', 
  'Actualización de datos de propietario', 
  'Cambio de propietario por compra-venta de inmueble en Tequisquiapan', 
  NULL, 
  'actualizar_caso', 
  'ACT', 
  'abierto', 
  'media', 
  'presencial', 
  ARRAY['cambio_propietario', 'tequisquiapan', 'compraventa'], 
  '{"municipio": "Tequisquiapan", "contrato_actual": "TEQ-5432", "propietario_anterior": "María González", "propietario_nuevo": "Roberto Sánchez", "escrituras_presentadas": true}'::jsonb
),

-- Ticket 16
(
  'CEA-2025-001016', 
  'Solicitud de pipas por desabasto', 
  'Comunidad rural solicita apoyo con pipas debido a desabasto prolongado', 
  NULL, 
  'asesor_humano', 
  'URG', 
  'en_proceso', 
  'urgente', 
  'presencial', 
  ARRAY['pipas', 'comunidad_rural', 'desabasto'], 
  '{"municipio": "Cadereyta", "localidad": "El Saucillo", "familias_beneficiadas": 45, "pipas_requeridas": 2, "duracion_estimada": "5 días"}'::jsonb
),

-- Ticket 17
(
  'CEA-2025-001017', 
  'Facturación incorrecta por días', 
  'Usuario reporta que se le facturaron más días del periodo correspondiente', 
  NULL, 
  'aclaraciones', 
  'ACL', 
  'abierto', 
  'media', 
  'web_chat', 
  ARRAY['facturacion', 'dias_incorrectos', 'recalculo'], 
  '{"numero_contrato": "QRO-23456", "periodo_facturado": "35 días", "periodo_correcto": "30 días", "diferencia_cobro": "67.50"}'::jsonb
),

-- Ticket 18
(
  'CEA-2025-001018', 
  'Fuga en red secundaria Corregidora', 
  'Reporte de fuga en tubería secundaria, afecta presión en 20 viviendas', 
  NULL, 
  'reportes_fugas', 
  'FUG', 
  'en_proceso', 
  'alta', 
  'app_movil', 
  ARRAY['fuga', 'red_secundaria', 'corregidora'], 
  '{"municipio": "Corregidora", "colonia": "Vista Real", "tipo_tuberia": "secundaria", "viviendas_afectadas": 20, "diametro_tuberia": "4 pulgadas"}'::jsonb
),

-- Ticket 19
(
  'CEA-2025-001019', 
  'Convenio de pago por adeudo', 
  'Usuario solicita establecer convenio de pago para liquidar adeudo acumulado', 
  NULL, 
  'pago_recibo', 
  'PAG', 
  'esperando_cliente', 
  'media', 
  'presencial', 
  ARRAY['convenio', 'adeudo', 'facilidades'], 
  '{"numero_contrato": "QRO-67890", "adeudo_total": "4,850.00", "meses_adeudo": 6, "propuesta_parcialidades": 4, "enganche_propuesto": "1,200.00"}'::jsonb
),

-- Ticket 20
(
  'CEA-2025-001020', 
  'Verificación de medidor inteligente', 
  'Usuario solicita verificación de funcionamiento de medidor inteligente recién instalado', 
  NULL, 
  'revision_recibo', 
  'REV', 
  'resuelto', 
  'baja', 
  'telefono', 
  ARRAY['medidor_inteligente', 'verificacion', 'nuevo'], 
  '{"municipio": "Querétaro", "numero_medidor": "SMART-QRO-1523", "fecha_instalacion": "2025-11-10", "lecturas_transmitidas": true, "funcionamiento": "correcto"}'::jsonb
);

-- Verificar que se insertaron correctamente
SELECT 
  folio, 
  titulo, 
  service_type, 
  ticket_type, 
  status, 
  priority, 
  channel,
  created_at
FROM cea.tickets 
WHERE folio LIKE 'CEA-2025-001%'
ORDER BY created_at DESC;