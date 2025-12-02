import { useState } from 'react';
import * as ceaApi from '@/api/cea';

export default function ApiTest() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleCall = async (fn: () => Promise<any>, name: string) => {
        setLoading(true);
        setResult(`Calling ${name}...`);
        try {
            const res = await fn();
            console.log(`${name} response:`, res);
            // If it's an XML document, serialize it to string
            if (res instanceof Document) {
                // Convert to JSON for easier readability if possible
                try {
                    // Prefer the helper if available
                    const parsed = (ceaApi as any).xmlToJson(res);
                    setResult(JSON.stringify(parsed, null, 2));
                } catch (e) {
                    setResult(new XMLSerializer().serializeToString(res));
                }
            } else {
                setResult(JSON.stringify(res, null, 2));
            }
        } catch (error: any) {
            console.error(`${name} error:`, error);
            // Display response details if present
            if (error?.response) {
                const r = error.response;
                const body = typeof r.data === 'string' ? r.data : JSON.stringify(r.data, null, 2);
                // If body looks like XML, attempt to parse to JSON for readability
                if (typeof r.data === 'string' && r.data.trim().startsWith('<')) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(r.data, 'text/xml');
                        const parsed = (ceaApi as any).xmlToJson(doc);
                        setResult(`Error: ${error.message}\nStatus: ${r.status} ${r.statusText}\nResponse(JSON): ${JSON.stringify(parsed, null, 2)}`);
                    } catch (_e) {
                        setResult(`Error: ${error.message}\nStatus: ${r.status} ${r.statusText}\nResponse: ${body}`);
                    }
                } else {
                    setResult(`Error: ${error.message}\nStatus: ${r.status} ${r.statusText}\nResponse: ${body}`);
                }
            } else {
                setResult(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">CEA API Test</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">REST API</h2>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                        onClick={() => handleCall(() => ceaApi.updateCaseToClosed('CASE123', 'CODE123', 'Notes'), 'updateCaseToClosed')}
                        disabled={loading}
                    >
                        Update Case to Closed
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                        onClick={() => handleCall(() => ceaApi.referenceWorkOrderAquacis('CASE123', 'WO123'), 'referenceWorkOrderAquacis')}
                        disabled={loading}
                    >
                        Reference Work Order
                    </button>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">SOAP API</h2>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                            placeholder="Contrato"
                            className="border p-1 rounded"
                            id="contractInput"
                        />
                        <input
                            placeholder="Explotacion (e.g. 01)"
                            className="border p-1 rounded"
                            id="explotacionInput"
                        />
                    </div>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                        onClick={() => {
                            const contract = (document.getElementById('contractInput') as HTMLInputElement).value || '123456';
                            handleCall(() => (ceaApi as any).consultaDetalleContratoJson(contract), 'consultaDetalleContratoJson');
                        }}
                        disabled={loading}
                    >
                        Consulta Detalle Contrato
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                        onClick={() => {
                            const contract = (document.getElementById('contractInput') as HTMLInputElement).value || '123456';
                            const explotacion = (document.getElementById('explotacionInput') as HTMLInputElement).value || 'EXPLOTACION';
                            handleCall(() => (ceaApi as any).getDeudaJson('NIF', contract, explotacion), 'getDeudaJson');
                        }}
                        disabled={loading}
                    >
                        Get Deuda
                    </button>
                    <button
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-full"
                        onClick={() => {
                            handleCall(() => (ceaApi as any).getDeudaJson('CONTRATO', '523160', '1', 'es'), 'getDeudaJson (Fixed)');
                        }}
                        disabled={loading}
                    >
                        Get Deuda (Fixed Payload)
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                        onClick={() => {
                            const contract = (document.getElementById('contractInput') as HTMLInputElement).value || 'CONTRATO123';
                            const explotacion = (document.getElementById('explotacionInput') as HTMLInputElement).value || 'EXPLOTACION';
                            handleCall(() => ceaApi.getLecturas(explotacion, contract), 'getLecturas');
                        }}
                        disabled={loading}
                    >
                        Get Lecturas
                    </button>

                    <h3 className="text-lg font-semibold mt-4 col-span-2">New Endpoints</h3>

                    <button
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 w-full"
                        onClick={() => {
                            const contract = (document.getElementById('contractInput') as HTMLInputElement).value || '';
                            handleCall(() => (ceaApi as any).getContratos(contract, '', '', '', '', '', []), 'getContratos');
                        }}
                        disabled={loading}
                    >
                        Get Contratos
                    </button>

                    <button
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 w-full"
                        onClick={() => {
                            const data = {
                                operationalSiteID: 'SITE1',
                                installationID: 'INST1',
                                systemOrigin: 'SYS',
                                otClass: 'CLASS',
                                otOrigin: 'ORIGIN',
                                endDateOt: '2023-01-01',
                                endLastTaskOt: '2023-01-01',
                                finalSolution: 'SOLVED',
                                nonExecutionMotive: '',
                                solutionDescription: 'Fixed',
                                executorIdentifier: 'EXEC1',
                                executorName: 'John Doe',
                                companyExecutorIdentifier: 'COMP1',
                                companyExecutorName: 'Company Inc',
                                transmitterInstalled: '0',
                                language: 'es',
                                suspensionLevel: '0',
                                longitude: '0.0',
                                latitude: '0.0',
                                coordinatesType: 'GPS',
                                codificationType: 'WGS84',
                                captureDate: '2023-01-01'
                            };
                            handleCall(() => (ceaApi as any).resolveOT(data), 'resolveOT');
                        }}
                        disabled={loading}
                    >
                        Resolve OT
                    </button>

                    <button
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 w-full"
                        onClick={() => {
                            const data = {
                                id: 'ID1',
                                codOrden: 'ORD1',
                                fechaVisita: '2023-01-01',
                                resultado: 'OK',
                                idOperario: 'OP1',
                                nombreOperario: 'Jane Doe',
                                cifContratista: 'CIF1',
                                nombreContratista: 'Contractor Inc',
                                codIncidencia: 'INC1',
                                descIncidencia: 'Desc',
                                observaciones: 'Obs',
                                codVinculacion: 'VINC1',
                                idDocFirma: 'DOC1',
                                personaNombre: 'Client Name',
                                personaApellido1: 'Lastname1',
                                personaApellido2: 'Lastname2',
                                personaTelefono: '123456789',
                                personaNif: 'NIF1'
                            };
                            handleCall(() => (ceaApi as any).informarVisita(data), 'informarVisita');
                        }}
                        disabled={loading}
                    >
                        Informar Visita
                    </button>

                    <button
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 w-full"
                        onClick={() => {
                            const contract = (document.getElementById('contractInput') as HTMLInputElement).value || 'CONTRATO123';
                            handleCall(() => (ceaApi as any).cambiarPersonaNotificacionContrato(contract, 'NIF', 'email1@example.com', 'email2@example.com', 'USER'), 'cambiarPersonaNotificacionContrato');
                        }}
                        disabled={loading}
                    >
                        Cambiar Persona Notif
                    </button>

                    <button
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 w-full"
                        onClick={() => {
                            const contract = (document.getElementById('contractInput') as HTMLInputElement).value || 'CONTRATO123';
                            handleCall(() => (ceaApi as any).cambiarTipoFacturaContrato(contract, 'NIF', 'Digital', 'USER'), 'cambiarTipoFacturaContrato');
                        }}
                        disabled={loading}
                    >
                        Cambiar Tipo Factura
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold">Result:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                    {result}
                </pre>
            </div>
        </div>
    );
}
