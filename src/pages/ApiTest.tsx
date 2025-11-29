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
                setResult(new XMLSerializer().serializeToString(res));
            } else {
                setResult(JSON.stringify(res, null, 2));
            }
        } catch (error: any) {
            console.error(`${name} error:`, error);
            setResult(`Error: ${error.message}`);
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
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                        onClick={() => handleCall(() => ceaApi.consultaDetalleContrato('123456'), 'consultaDetalleContrato')}
                        disabled={loading}
                    >
                        Consulta Detalle Contrato
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                        onClick={() => handleCall(() => ceaApi.getDeuda('NIF', '12345678A', 'EXPLOTACION'), 'getDeuda')}
                        disabled={loading}
                    >
                        Get Deuda
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                        onClick={() => handleCall(() => ceaApi.getLecturas('EXPLOTACION', 'CONTRATO123'), 'getLecturas')}
                        disabled={loading}
                    >
                        Get Lecturas
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
