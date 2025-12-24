import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requirePrivileges } from '../middleware/rbac.middleware.js';
import CEAController from '../controllers/cea.controller.js';

const router = Router();

// All CEA routes require authentication
router.use(authenticateToken);

// ============================================================================
// REST API Routes - Cases
// ============================================================================

/**
 * Update case to closed status
 * Requires: cea:write:cases privilege
 */
router.put('/case/close',
    requirePrivileges(['cea:write:cases']),
    CEAController.updateCaseToClosed
);

/**
 * Reference work order to Aquacis
 * Requires: cea:write:cases privilege
 */
router.put('/case/reference-workorder',
    requirePrivileges(['cea:write:cases']),
    CEAController.referenceWorkOrderAquacis
);

/**
 * Update case to cancelled status
 * Requires: cea:write:cases privilege
 */
router.put('/case/cancel',
    requirePrivileges(['cea:write:cases']),
    CEAController.updateCaseToCancelled
);

// ============================================================================
// SOAP API Routes - Contracts
// ============================================================================

/**
 * Get contract details
 * Requires: cea:read:contracts privilege
 */
router.post('/contract/details',
    requirePrivileges(['cea:read:contracts']),
    CEAController.consultaDetalleContrato
);

/**
 * Get contract
 * Requires: cea:read:contracts privilege
 */
router.post('/contract/get',
    requirePrivileges(['cea:read:contracts']),
    CEAController.getContrato
);

/**
 * Get contracts list
 * Requires: cea:read:contracts privilege
 */
router.post('/contracts/list',
    requirePrivileges(['cea:read:contracts']),
    CEAController.getContratos
);

// ============================================================================
// SOAP API Routes - Work Orders
// ============================================================================

/**
 * Create work order
 * Requires: cea:write:work_orders privilege
 */
router.post('/workorder/create',
    requirePrivileges(['cea:write:work_orders']),
    CEAController.crearOrdenTrabajo
);

/**
 * Resolve work order
 * Requires: cea:write:work_orders privilege
 */
router.post('/workorder/resolve',
    requirePrivileges(['cea:write:work_orders']),
    CEAController.resolveOT
);

/**
 * Inform visit
 * Requires: cea:write:work_orders privilege
 */
router.post('/workorder/inform-visit',
    requirePrivileges(['cea:write:work_orders']),
    CEAController.informarVisita
);

// ============================================================================
// SOAP API Routes - Meters
// ============================================================================

/**
 * Get service point by meter
 * Requires: cea:read:meters privilege
 */
router.post('/meter/service-point',
    requirePrivileges(['cea:read:meters']),
    CEAController.getPuntoServicioPorContador
);

// ============================================================================
// SOAP API Routes - Debt
// ============================================================================

/**
 * Get debt information
 * Requires: cea:read:debt privilege
 */
router.post('/debt/get',
    requirePrivileges(['cea:read:debt']),
    CEAController.getDeuda
);

// ============================================================================
// SOAP API Routes - Readings
// ============================================================================

/**
 * Get readings
 * Requires: cea:read:readings privilege
 */
router.post('/readings/get',
    requirePrivileges(['cea:read:readings']),
    CEAController.getLecturas
);

// ============================================================================
// SOAP API Routes - Receipts/Notifications
// ============================================================================

/**
 * Change email notification for person
 * Requires: cea:write:notifications privilege
 */
router.post('/notification/change-email',
    requirePrivileges(['cea:write:notifications']),
    CEAController.cambiarEmailNotificacionPersona
);

/**
 * Change notification person for contract
 * Requires: cea:write:notifications privilege
 */
router.post('/notification/change-person',
    requirePrivileges(['cea:write:notifications']),
    CEAController.cambiarPersonaNotificacionContrato
);

/**
 * Change invoice type for contract
 * Requires: cea:write:invoices privilege
 */
router.post('/invoice/change-type',
    requirePrivileges(['cea:write:invoices']),
    CEAController.cambiarTipoFacturaContrato
);

export default router;
