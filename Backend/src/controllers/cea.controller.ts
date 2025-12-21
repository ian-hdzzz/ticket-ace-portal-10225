import type { Request, Response } from "express";
import CEAService from "../api/cea.client.js";

export default class CEAController {
    
    // ========================================================================
    // REST API Controllers
    // ========================================================================

    /**
     * Update case to closed status
     */
    static async updateCaseToClosed(req: Request, res: Response) {
        try {
            console.log("in updateCaseToClosed controller")
            const { caseId, code, note } = req.body;

            if (!caseId || !code || !note) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: caseId, code, note"
                });
            }

            // TODO: Business logic - verify user has permission to close this case
            // const hasAccess = await verifyUserCaseAccess(req.user!.userId, caseId);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.updateCaseToClosed(caseId, code, note);

            // TODO: Audit log
            // await auditLog.create({ userId: req.user!.userId, action: 'close_case', caseId });

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error updating case to closed:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al cerrar el caso"
            });
        }
    }

    /**
     * Reference work order to Aquacis
     */
    static async referenceWorkOrderAquacis(req: Request, res: Response) {
        try {
            console.log("in referenceWorkOrderAquacis controller")
            const { caseId, workOrderId } = req.body;

            if (!caseId || !workOrderId) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: caseId, workOrderId"
                });
            }

            // TODO: Business logic - verify user has permission to reference work orders
            // const hasAccess = await verifyUserCaseAccess(req.user!.userId, caseId);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.referenceWorkOrderAquacis(caseId, workOrderId);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error referencing work order:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al referenciar orden de trabajo"
            });
        }
    }

    /**
     * Update case to cancelled status
     */
    static async updateCaseToCancelled(req: Request, res: Response) {
        try {
            console.log("in updateCaseToCancelled controller")
            const { caseId } = req.body;

            if (!caseId) {
                return res.status(400).json({
                    success: false,
                    message: "Falta parámetro requerido: caseId"
                });
            }

            // TODO: Business logic - verify user has permission to cancel this case
            // const hasAccess = await verifyUserCaseAccess(req.user!.userId, caseId);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.updateCaseToCancelled(caseId);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error cancelling case:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al cancelar el caso"
            });
        }
    }

    // ========================================================================
    // SOAP API Controllers - Contracts
    // ========================================================================

    /**
     * Get contract details
     */
    static async consultaDetalleContrato(req: Request, res: Response) {
        try {
            console.log("in consultaDetalleContrato controller")
            const { numeroContrato, idioma = 'es' } = req.body;

            if (!numeroContrato) {
                return res.status(400).json({
                    success: false,
                    message: "Falta parámetro requerido: numeroContrato"
                });
            }

            // TODO: Business logic - verify user has access to this contract
            // const hasAccess = await verifyUserContractAccess(req.user!.userId, numeroContrato);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado para este contrato" });

            const result = await CEAService.consultaDetalleContratoJson(numeroContrato, idioma);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error consulting contract details:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al consultar detalles del contrato"
            });
        }
    }

    /**
     * Get contract
     */
    static async getContrato(req: Request, res: Response) {
        try {
            console.log("in getContrato controller")
            const { numContrato, idioma = 'es', opciones = '' } = req.body;

            if (!numContrato) {
                return res.status(400).json({
                    success: false,
                    message: "Falta parámetro requerido: numContrato"
                });
            }

            // TODO: Business logic - verify user has access to this contract
            // const hasAccess = await verifyUserContractAccess(req.user!.userId, numContrato);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado para este contrato" });

            const result = await CEAService.getContrato(numContrato, idioma, opciones);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error getting contract:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al obtener contrato"
            });
        }
    }

    /**
     * Get contracts list
     */
    static async getContratos(req: Request, res: Response) {
        try {
            console.log("in getContratos controller")
            const {
                numeroContrato,
                actividad,
                actividadSectorial,
                uso,
                cnaeDesde,
                cnaeHasta,
                estados
            } = req.body;

            // TODO: Business logic - filter results to only contracts user has access to
            // const userContracts = await getUserAllowedContracts(req.user!.userId);
            // Apply filtering based on user permissions

            const result = await CEAService.getContratos(
                numeroContrato,
                actividad,
                actividadSectorial,
                uso,
                cnaeDesde,
                cnaeHasta,
                estados || []
            );

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error getting contracts:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al obtener contratos"
            });
        }
    }

    // ========================================================================
    // SOAP API Controllers - Work Orders
    // ========================================================================

    /**
     * Create work order
     */
    static async crearOrdenTrabajo(req: Request, res: Response) {
        try {
            console.log("in crearOrdenTrabajo controller")
            const {
                tipoOrden,
                motivoOrden,
                fechaCreacionOrden,
                numContrato,
                idPtoServicio,
                fechaEstimdaFin,
                observaciones,
                codigoReparacion,
                anyoExpediente
            } = req.body;

            if (!tipoOrden || !motivoOrden || !fechaCreacionOrden || !numContrato || !idPtoServicio) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos"
                });
            }

            // TODO: Business logic - verify user has permission to create work orders for this contract
            // const hasAccess = await verifyUserContractAccess(req.user!.userId, numContrato);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.crearOrdenTrabajo({
                tipoOrden,
                motivoOrden,
                fechaCreacionOrden,
                numContrato,
                idPtoServicio,
                fechaEstimdaFin,
                observaciones,
                codigoReparacion,
                anyoExpediente
            });

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error creating work order:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al crear orden de trabajo"
            });
        }
    }

    /**
     * Resolve work order
     */
    static async resolveOT(req: Request, res: Response) {
        try {
            console.log("in resolveOT controller")
            const data = req.body;

            if (!data.operationalSiteID || !data.installationID) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos"
                });
            }

            // TODO: Business logic - verify user has permission to resolve work orders
            // const hasAccess = await verifyUserWorkOrderAccess(req.user!.userId, data.operationalSiteID);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.resolveOT(data);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error resolving work order:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al resolver orden de trabajo"
            });
        }
    }

    /**
     * Inform visit
     */
    static async informarVisita(req: Request, res: Response) {
        try {
            console.log("in informarVisita controller")
            const data = req.body;

            if (!data.id || !data.codOrden || !data.fechaVisita) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: id, codOrden, fechaVisita"
                });
            }

            // TODO: Business logic - verify user has permission to inform visits
            // const hasAccess = await verifyUserWorkOrderAccess(req.user!.userId, data.codOrden);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.informarVisita(data);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error informing visit:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al informar visita"
            });
        }
    }

    // ========================================================================
    // SOAP API Controllers - Meters
    // ========================================================================

    /**
     * Get service point by meter
     */
    static async getPuntoServicioPorContador(req: Request, res: Response) {
        try {
            console.log("in getPuntoServicioPorContador controller")
            const { listaNumSerieContador, usuario, idioma = 'es', opciones = '' } = req.body;

            if (!listaNumSerieContador || !usuario) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: listaNumSerieContador, usuario"
                });
            }

            // TODO: Business logic - verify user has access to query meters
            // May need to verify after getting results and filter by user's contracts

            const result = await CEAService.getPuntoServicioPorContador(
                listaNumSerieContador,
                usuario,
                idioma,
                opciones
            );

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error getting service point by meter:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al obtener punto de servicio"
            });
        }
    }

    // ========================================================================
    // SOAP API Controllers - Debt
    // ========================================================================

    /**
     * Get debt information
     */
    static async getDeuda(req: Request, res: Response) {
        try {
            console.log("in getDeuda controller")
            const { tipoIdentificador, valor, explotacion, idioma = 'es' } = req.body;

            if (!tipoIdentificador || !valor || !explotacion) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: tipoIdentificador, valor, explotacion"
                });
            }

            // TODO: Business logic - verify user has access to debt information for this contract/customer
            // const hasAccess = await verifyUserDebtAccess(req.user!.userId, valor, tipoIdentificador);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.getDeudaJson(tipoIdentificador, valor, explotacion, idioma);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error getting debt:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al obtener información de deuda"
            });
        }
    }

    // ========================================================================
    // SOAP API Controllers - Readings
    // ========================================================================

    /**
     * Get readings
     */
    static async getLecturas(req: Request, res: Response) {
        try {
            console.log("in getLecturas controller")
            const { explotacion, contrato, idioma = 'es' } = req.body;

            if (!explotacion || !contrato) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: explotacion, contrato"
                });
            }

            // TODO: Business logic - verify user has access to readings for this contract
            // const hasAccess = await verifyUserContractAccess(req.user!.userId, contrato);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.getLecturas(explotacion, contrato, idioma);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error getting readings:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al obtener lecturas"
            });
        }
    }

    // ========================================================================
    // SOAP API Controllers - Receipts/Notifications
    // ========================================================================

    /**
     * Change email notification for person
     */
    static async cambiarEmailNotificacionPersona(req: Request, res: Response) {
        try {
            console.log("in cambiarEmailNotificacionPersona controller")
            const {
                nif,
                nombre,
                apellido1,
                apellido2,
                contrato,
                emailAntiguo,
                emailNuevo,
                codigoOficina,
                usuario
            } = req.body;

            if (!nif || !contrato || !emailNuevo) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: nif, contrato, emailNuevo"
                });
            }

            // TODO: Business logic - verify user has permission to change email for this contract
            // const hasAccess = await verifyUserContractAccess(req.user!.userId, contrato);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.cambiarEmailNotificacionPersona(
                nif,
                nombre,
                apellido1,
                apellido2,
                contrato,
                emailAntiguo,
                emailNuevo,
                codigoOficina,
                usuario
            );

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error changing email notification:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al cambiar email de notificación"
            });
        }
    }

    /**
     * Change notification person for contract
     */
    static async cambiarPersonaNotificacionContrato(req: Request, res: Response) {
        try {
            console.log("in cambiarPersonaNotificacionContrato controller")
            const { contrato, nif, email1, email2, usuario } = req.body;

            if (!contrato || !nif) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: contrato, nif"
                });
            }

            // TODO: Business logic - verify user has permission to change notification person
            // const hasAccess = await verifyUserContractAccess(req.user!.userId, contrato);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.cambiarPersonaNotificacionContrato(
                contrato,
                nif,
                email1,
                email2,
                usuario
            );

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error changing notification person:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al cambiar persona de notificación"
            });
        }
    }

    /**
     * Change invoice type for contract
     */
    static async cambiarTipoFacturaContrato(req: Request, res: Response) {
        try {
            console.log("in cambiarTipoFacturaContrato controller")
            const { contrato, nif, tipoFactura, usuario = '0000004874' } = req.body;

            if (!contrato || !nif || !tipoFactura) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan parámetros requeridos: contrato, nif, tipoFactura"
                });
            }

            // TODO: Business logic - verify user has permission to change invoice type
            // const hasAccess = await verifyUserContractAccess(req.user!.userId, contrato);
            // if (!hasAccess) return res.status(403).json({ success: false, message: "No autorizado" });

            const result = await CEAService.cambiarTipoFacturaContrato(
                contrato,
                nif,
                tipoFactura,
                usuario
            );

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Error changing invoice type:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al cambiar tipo de factura"
            });
        }
    }
}
