import * as ceaApi from '../api/cea';

interface TriggerPayload {
    type: 'opportunity_ready' | 'persona_update' | 'ticket_closed' | 'ticket_cancelled' | 'resolve_ot' | 'informar_visita' | 'invoice_change';
    record: any;
    old_record: any;
}

export async function handleCeaTrigger(payload: TriggerPayload) {
    console.log(`Received trigger: ${payload.type}`);

    try {
        switch (payload.type) {
            case 'opportunity_ready':
                await handleOpportunityReady(payload.record);
                break;
            case 'persona_update':
                await handlePersonaUpdate(payload.record, payload.old_record);
                break;
            case 'ticket_closed':
                await handleTicketClosed(payload.record);
                break;
            case 'ticket_cancelled':
                await handleTicketCancelled(payload.record);
                break;
            case 'resolve_ot':
                await handleResolveOT(payload.record);
                break;
            case 'informar_visita':
                await handleInformarVisita(payload.record);
                break;
            case 'invoice_change':
                await handleInvoiceChange(payload.record);
                break;
            default:
                console.warn(`Unknown trigger type: ${payload.type}`);
        }
    } catch (error) {
        console.error('Error processing trigger:', error);
        throw error;
    }
}

async function handleTicketClosed(record: any) {
    // CEA API: updateCaseToClosed(caseId, code, note)
    const caseId = record.id; // Or a mapped CEA ID if stored
    const code = 'RESUELTO'; // Default code
    const note = record.resolution_notes || 'Cerrado automáticamente';

    console.log(`Closing ticket ${caseId}`);
    // await ceaApi.updateCaseToClosed(caseId, code, note);
}

async function handleTicketCancelled(record: any) {
    // CEA API: updateCaseToCancelled(caseId)
    const caseId = record.id;
    console.log(`Cancelling ticket ${caseId}`);
    // await ceaApi.updateCaseToCancelled(caseId);
}

async function handleResolveOT(record: any) {
    // Data expected in metadata.ot_resolution
    const data = record.metadata?.ot_resolution;
    if (!data) {
        console.warn('Missing OT resolution data');
        return;
    }
    console.log('Resolving OT with data:', data);
    // await ceaApi.resolveOT(data);
}

async function handleInformarVisita(record: any) {
    // Data expected in metadata.visit_info
    const data = record.metadata?.visit_info;
    if (!data) {
        console.warn('Missing Visit Info data');
        return;
    }
    console.log('Informing Visit with data:', data);
    // await ceaApi.informarVisita(data);
}

async function handleInvoiceChange(record: any) {
    // Data expected in metadata.invoice_change
    const data = record.metadata?.invoice_change;
    if (!data || !data.contrato || !data.nif || !data.tipoFactura) {
        console.warn('Missing Invoice Change data');
        return;
    }
    const usuario = data.usuario || 'SYSTEM';
    console.log('Changing Invoice Type:', data);
    // await ceaApi.cambiarTipoFacturaContrato(data.contrato, data.nif, data.tipoFactura, usuario);
}

async function handleOpportunityReady(record: any) {
    // Extract contract info from the various JSONB fields
    const info = record.informacion_familia || record.informacion_corporativo || record.informacion_escuela || {};
    const numContrato = info.numero_contrato || record.contact_id; // Fallback to contact_id if needed, but likely wrong
    const idPtoServicio = info.id_punto_servicio || "0";

    if (!numContrato) {
        console.warn('Cannot create Work Order: Missing contract number in opportunity data');
        return;
    }

    const workOrderData = {
        tipoOrden: 'INSPECCION', // Default to INSPECCION or derive from record
        motivoOrden: 'Oportunidad lista para agendar',
        fechaCreacionOrden: new Date().toISOString().split('T')[0],
        numContrato: numContrato,
        idPtoServicio: idPtoServicio,
        fechaEstimdaFin: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 day
        observaciones: record.notas_internas || record.mensaje_respuesta || '',
        codigoReparacion: '', // Optional or default?
        anyoExpediente: new Date().getFullYear().toString()
    };

    console.log('Creating Work Order with data:', workOrderData);

    try {
        // Uncomment to enable real API call
        // const response = await ceaApi.crearOrdenTrabajo(workOrderData);
        // console.log('Work Order Created:', response);

        // TODO: Update the opportunity with the result (e.g. store OT ID)
    } catch (error) {
        console.error('Failed to create Work Order:', error);
    }
}

async function handlePersonaUpdate(record: any, oldRecord: any) {
    // We need: contrato, nif, email1, email2, usuario
    // Assuming 'personas' table has these or we can derive them
    const nif = record.curp || record.wa_id || '';
    const email1 = record.correo || '';
    const email2 = '';
    const usuario = 'SYSTEM';

    // Contract might be in a related table or metadata. 
    // For now, we'll check if it's passed in the record (unlikely for 'personas' table)
    // or if we need to fetch it.
    // If this trigger is for 'camp_contacts', it might be different.
    // Let's assume for now we log it as we don't have a clear link to Contract in 'personas' table.
    const contrato = '?';

    console.log(`Updating Persona Notification for NIF ${nif}, Email: ${email1}`);

    if (contrato !== '?' && nif) {
        // await ceaApi.cambiarPersonaNotificacionContrato(contrato, nif, email1, email2, usuario);
    } else {
        console.warn('Cannot update persona: Missing contract number or NIF');
    }
}
