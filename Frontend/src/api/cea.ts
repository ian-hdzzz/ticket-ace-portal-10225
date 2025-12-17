import axios from 'axios';

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
const CEA_BASE_PATH = import.meta.env.VITE_CEA_BASE_PATH || '/api/cea';
const CEA_API_BASE = `${BACKEND_URL}${CEA_BASE_PATH}`;

// Configure axios to send cookies with requests
const apiClient = axios.create({
  baseURL: CEA_API_BASE,
  withCredentials: true, // Send cookies with requests
});

// ============================================================================
// REST API Functions (Cases)
// ============================================================================

export const updateCaseToClosed = async (caseId: string, code: string, note: string) => {
  const response = await apiClient.put('/case/close', {
    caseId,
    code,
    note,
  });
  return response.data.data;
};

export const referenceWorkOrderAquacis = async (caseId: string, workOrderId: string) => {
  const response = await apiClient.put('/case/reference-workorder', {
    caseId,
    workOrderId,
  });
  return response.data.data;
};

export const updateCaseToCancelled = async (caseId: string) => {
  const response = await apiClient.put('/case/cancel', {
    caseId,
  });
  return response.data.data;
};

// ============================================================================
// SOAP API Functions - Contracts
// ============================================================================

export const consultaDetalleContratoJson = async (numeroContrato: string, idioma: string = 'es') => {
  const response = await apiClient.post('/contract/details', {
    numeroContrato,
    idioma,
  });
  return response.data.data;
};

export const getContrato = async (numContrato: string, idioma: string = 'es', opciones: string = '') => {
  const response = await apiClient.post('/contract/get', {
    numContrato,
    idioma,
    opciones,
  });
  return response.data.data;
};

export const getContratos = async (
  numeroContrato: string,
  actividad: string,
  actividadSectorial: string,
  uso: string,
  cnaeDesde: string,
  cnaeHasta: string,
  estados: string[]
) => {
  const response = await apiClient.post('/contracts/list', {
    numeroContrato,
    actividad,
    actividadSectorial,
    uso,
    cnaeDesde,
    cnaeHasta,
    estados,
  });
  return response.data.data;
};

// ============================================================================
// SOAP API Functions - Work Orders
// ============================================================================

export const crearOrdenTrabajo = async (data: {
  tipoOrden: string;
  motivoOrden: string;
  fechaCreacionOrden: string;
  numContrato: string;
  idPtoServicio: string;
  fechaEstimdaFin: string;
  observaciones: string;
  codigoReparacion: string;
  anyoExpediente: string;
}) => {
  const response = await apiClient.post('/workorder/create', data);
  return response.data.data;
};

export const resolveOT = async (data: any) => {
  const response = await apiClient.post('/workorder/resolve', data);
  return response.data.data;
};

export const informarVisita = async (data: any) => {
  const response = await apiClient.post('/workorder/inform-visit', data);
  return response.data.data;
};

// ============================================================================
// SOAP API Functions - Meters
// ============================================================================

export const getPuntoServicioPorContador = async (
  listaNumSerieContador: string,
  usuario: string,
  idioma: string = 'es',
  opciones: string = ''
) => {
  const response = await apiClient.post('/meter/service-point', {
    listaNumSerieContador,
    usuario,
    idioma,
    opciones,
  });
  return response.data.data;
};

// ============================================================================
// SOAP API Functions - Debt
// ============================================================================

export const getDeudaJson = async (
  tipoIdentificador: string,
  valor: string,
  explotacion: string,
  idioma: string = 'es'
) => {
  const response = await apiClient.post('/debt/get', {
    tipoIdentificador,
    valor,
    explotacion,
    idioma,
  });
  return response.data.data;
};

// Alias for backward compatibility
export const getDeuda = getDeudaJson;

// ============================================================================
// SOAP API Functions - Readings
// ============================================================================

export const getLecturas = async (explotacion: string, contrato: string, idioma: string = 'es') => {
  const response = await apiClient.post('/readings/get', {
    explotacion,
    contrato,
    idioma,
  });
  return response.data.data;
};

// ============================================================================
// SOAP API Functions - Receipts/Notifications
// ============================================================================

export const cambiarEmailNotificacionPersona = async (
  nif: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  contrato: string,
  emailAntiguo: string,
  emailNuevo: string,
  codigoOficina: string,
  usuario: string
) => {
  const response = await apiClient.post('/notification/change-email', {
    nif,
    nombre,
    apellido1,
    apellido2,
    contrato,
    emailAntiguo,
    emailNuevo,
    codigoOficina,
    usuario,
  });
  return response.data.data;
};

export const cambiarPersonaNotificacionContrato = async (
  contrato: string,
  nif: string,
  email1: string,
  email2: string,
  usuario: string
) => {
  const response = await apiClient.post('/notification/change-person', {
    contrato,
    nif,
    email1,
    email2,
    usuario,
  });
  return response.data.data;
};

export const cambiarTipoFacturaContrato = async (
  contrato: string,
  nif: string,
  tipoFactura: string,
  usuario: string = '0000004874'
) => {
  const response = await apiClient.post('/invoice/change-type', {
    contrato,
    nif,
    tipoFactura,
    usuario,
  });
  return response.data.data;
};

// ============================================================================
// Legacy/Deprecated - Keep for backward compatibility
// ============================================================================

// These were previously exported but are now handled by backend
export const consultaDetalleContrato = consultaDetalleContratoJson;

// Helper functions that were exported - no longer needed but kept for compatibility
export const xmlToJson = (node: any): any => {
  console.warn('xmlToJson is deprecated - XML parsing now handled by backend');
  return node;
};

export const xmlEscape = (value: unknown): string => {
  console.warn('xmlEscape is deprecated - XML escaping now handled by backend');
  return String(value || '');
};
