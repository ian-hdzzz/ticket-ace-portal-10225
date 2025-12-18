import { useState, useEffect } from "react";
import { getConceptos, xmlToJson } from "@/api/cea";

interface Concepto {
  codigo: {
    id1: string;
    id2: string;
  };
  descripcion: string;
  organismoPropietario: string;
  esPeriodico: boolean;
}

let conceptosCache: Concepto[] | null = null;
let conceptosPromise: Promise<Concepto[]> | null = null;

/**
 * Hook para obtener y cachear los conceptos de facturación
 * Los conceptos son catálogo, no cambian frecuentemente, por lo que se cachean
 */
export function useConceptos(explotacion: string = "1") {
  const [conceptos, setConceptos] = useState<Concepto[]>(conceptosCache || []);
  const [isLoading, setIsLoading] = useState(!conceptosCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya tenemos cache, usarlo
    if (conceptosCache) {
      setConceptos(conceptosCache);
      setIsLoading(false);
      return;
    }

    // Si ya hay una petición en curso, esperarla
    if (conceptosPromise) {
      conceptosPromise
        .then((data) => {
          setConceptos(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
      return;
    }

    // Crear nueva petición
    setIsLoading(true);
    conceptosPromise = fetchConceptos(explotacion);
    
    conceptosPromise
      .then((data) => {
        conceptosCache = data;
        setConceptos(data);
        setIsLoading(false);
        conceptosPromise = null;
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
        conceptosPromise = null;
      });
  }, [explotacion]);

  return { conceptos, isLoading, error };
}

async function fetchConceptos(explotacion: string): Promise<Concepto[]> {
  try {
    const xmlDoc = await getConceptos(explotacion);
    const data = xmlToJson(xmlDoc);

    console.log("Datos de conceptos completos:", data);
    console.log("Body:", data?.Body);
    console.log("getConceptosResponse:", data?.Body?.getConceptosResponse);
    console.log("getConceptosReturn:", data?.Body?.getConceptosResponse?.getConceptosReturn);

    // Intentar múltiples rutas posibles para los datos
    let conceptosRaw = data?.Body?.getConceptosResponse?.getConceptosReturn?.Concepto;
    
    if (!conceptosRaw) {
      conceptosRaw = data?.getConceptosResponse?.getConceptosReturn?.Concepto;
    }
    if (!conceptosRaw) {
      conceptosRaw = data?.getConceptosReturn?.Concepto;
    }
    if (!conceptosRaw) {
      conceptosRaw = data?.Concepto;
    }

    console.log("Conceptos raw encontrados:", conceptosRaw);

    if (!conceptosRaw) {
      console.error("Estructura de datos recibida:", JSON.stringify(data, null, 2));
      throw new Error("No se encontraron conceptos");
    }

    const conceptosArray = Array.isArray(conceptosRaw) ? conceptosRaw : [conceptosRaw];

    return conceptosArray.map((c: any) => ({
      codigo: {
        id1: c.codigoConcepto?.id1Short || "",
        id2: c.codigoConcepto?.id2Short || "",
      },
      descripcion: c.descripcionConcepto || "",
      organismoPropietario: c.organismoPropietario || "",
      esPeriodico: c.conceptoPeriodico === "true",
    }));
  } catch (error: any) {
    console.error("Error al obtener conceptos:", error);
    throw error;
  }
}

/**
 * Helper para obtener la descripción de un concepto por su código
 */
export function getConceptoDescripcion(conceptos: Concepto[], id1: string, id2: string): string {
  const concepto = conceptos.find((c) => c.codigo.id1 === id1 && c.codigo.id2 === id2);
  return concepto?.descripcion || `Concepto ${id1}-${id2}`;
}

/**
 * Limpiar cache (útil para testing o cuando se necesite refrescar)
 */
export function clearConceptosCache() {
  conceptosCache = null;
  conceptosPromise = null;
}
