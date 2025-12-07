
import { handleCeaTrigger } from '../src/functions/cea-trigger-handler';

// Mock the CEA API to prevent actual calls during test
// We can do this by mocking the module if we were using Jest/Vitest, 
// but for a simple script we'll just rely on the commented out calls in the handler 
// or we can monkey patch if needed. For now, the handler has the calls commented out.

async function runTests() {
    console.log('--- Testing Opportunity Ready Trigger ---');
    const opportunityPayload = {
        type: 'opportunity_ready' as const,
        record: {
            id: 'opp-123',
            listo_para_agendar: true,
            informacion_familia: {
                numero_contrato: '12345678',
                id_punto_servicio: '98765'
            },
            notas_internas: 'Test observation'
        },
        old_record: {
            listo_para_agendar: false
        }
    };
    await handleCeaTrigger(opportunityPayload);

    console.log('\n--- Testing Opportunity Ready Trigger (Missing Contract) ---');
    const opportunityMissingContract = {
        type: 'opportunity_ready' as const,
        record: {
            id: 'opp-124',
            listo_para_agendar: true,
            informacion_familia: {},
            notas_internas: 'Should fail'
        },
        old_record: {
            listo_para_agendar: false
        }
    };
    await handleCeaTrigger(opportunityMissingContract);

    console.log('\n--- Testing Persona Update Trigger ---');
    const personaPayload = {
        type: 'persona_update' as const,
        record: {
            curp: 'ABC123456',
            correo: 'new@example.com',
            whatsapp: '5555555555'
        },
        old_record: {
            correo: 'old@example.com'
        }
    };
    await handleCeaTrigger(personaPayload);

    console.log('\n--- Testing Ticket Closed Trigger ---');
    const ticketClosedPayload = {
        type: 'ticket_closed' as const,
        record: {
            id: 'ticket-001',
            status: 'resuelto',
            resolution_notes: 'Fixed the leak'
        },
        old_record: {
            status: 'en_proceso'
        }
    };
    await handleCeaTrigger(ticketClosedPayload);

    console.log('\n--- Testing Resolve OT Trigger ---');
    const resolveOTPayload = {
        type: 'resolve_ot' as const,
        record: {
            id: 'ticket-002',
            metadata: {
                ot_resolution: {
                    operationalSiteID: 'SITE-1',
                    finalSolution: 'REPAIRED'
                }
            }
        },
        old_record: {
            metadata: {}
        }
    };
    await handleCeaTrigger(resolveOTPayload);

    console.log('\n--- Testing Invoice Change Trigger ---');
    const invoiceChangePayload = {
        type: 'invoice_change' as const,
        record: {
            id: 'ticket-003',
            metadata: {
                invoice_change: {
                    contrato: '123456',
                    nif: 'ABC',
                    tipoFactura: 'ELECTRONICA'
                }
            }
        },
        old_record: {
            metadata: {}
        }
    };
    await handleCeaTrigger(invoiceChangePayload);
}

runTests().catch(console.error);
