# 🔧 Troubleshooting - APIs de Consumos y Tarifas

## 🐛 Diagnóstico de Problemas

### Pasos para Debuggear

1. **Abre la Consola del Navegador** (F12 o Cmd+Option+I)
2. **Ve a la pestaña "Console"**
3. **Busca un contrato y accede al detalle**
4. **Navega a los tabs de Consumos/Tarifas**

### 📋 Logs que Deberías Ver

#### Para `getConsumos`:
```
[getConsumos] Parámetros recibidos: {
  explotacion: "1",
  contrato: "523161",
  idioma: "es",
  explotacionType: "string",
  contratoType: "string"
}

[getConsumos] Request params formateados: {
  explotacion: "01",
  contrato: "523161",
  idioma: "es"
}

[getConsumos] SOAP Request XML: <soapenv:Envelope ...>

[getConsumos] SOAP Response: Document {...}

Datos de consumos completos: {...}
Body: {...}
getConsumosResponse: {...}
getConsumosReturn: {...}
Consumos raw encontrados: [...]
```

#### Para `getTarifaDeAguaPorContrato`:
```
[getTarifaDeAguaPorContrato] Parámetros recibidos: {...}
[getTarifaDeAguaPorContrato] Request params formateados: {...}
[getTarifaDeAguaPorContrato] SOAP Request XML: <soapenv:Envelope ...>
[getTarifaDeAguaPorContrato] SOAP Response: Document {...}

Datos de tarifas completos: {...}
Body: {...}
getTarifaDeAguaPorContratoResponse: {...}
```

#### Para `getConceptos`:
```
[getConceptos] Parámetros recibidos: {...}
[getConceptos] Request params formateados: {...}
[getConceptos] SOAP Request XML: <soapenv:Envelope ...>
[getConceptos] SOAP Response: Document {...}

Datos de conceptos completos: {...}
```

## 🔍 Problemas Comunes y Soluciones

### 1. "No se encontraron consumos/tarifas para este contrato"

**Posibles causas:**
- El número de contrato no existe en el sistema
- La explotación es incorrecta
- El formato del contrato necesita ceros a la izquierda
- La API devuelve una estructura XML diferente

**Qué revisar:**
1. Verifica en los logs `SOAP Request XML` que el contrato y explotación sean correctos
2. Revisa `SOAP Response` para ver si hay datos en la respuesta
3. Checa `Datos de [consumos/tarifas] completos` para ver la estructura completa
4. Si ves `undefined` en los logs de búsqueda de rutas, la estructura XML es diferente

**Solución temporal:**
Copia el objeto completo de `Datos de [consumos/tarifas] completos` y pégalo aquí. Ajustaremos el parseador.

### 2. "Error de autenticación" o "401 Unauthorized"

**Posibles causas:**
- Credenciales incorrectas en `.env`
- El endpoint SOAP requiere autenticación adicional

**Qué revisar:**
1. Verifica que `VITE_CEA_API_USERNAME` y `VITE_CEA_API_PASSWORD` estén configurados
2. Verifica que `VITE_CEA_SOAP_READINGS_URL` sea el correcto

### 3. Número de Contrato Incorrecto

**Cambios aplicados:**
- Ahora la explotación se formatea con ceros a la izquierda: `"1"` → `"01"`
- El número de contrato se mantiene tal cual se recibe

**Si el problema persiste:**
Puede que necesites formatear el contrato también:
```typescript
// En cea.ts, agregar:
const contratoFormatted = contrato.padStart(10, '0'); // Ejemplo: "523161" → "0000523161"
```

### 4. Estructura XML Diferente

**Los componentes ahora intentan múltiples rutas:**
```typescript
// Busca en:
data?.Body?.getConsumosResponse?.getConsumosReturn?.Consumo
data?.getConsumosResponse?.getConsumosReturn?.Consumo
data?.getConsumosReturn?.Consumo
data?.Consumo
```

**Si ninguna funciona:**
1. Copia el JSON completo de `Estructura de datos recibida:`
2. Identifica dónde están los datos realmente
3. Actualiza el código para usar esa ruta

## 🛠️ Cómo Reportar el Error

Si sigues teniendo problemas, copia y pega esto:

```
PROBLEMA: [describe qué no funciona]

CONTRATO PROBADO: [número de contrato]
EXPLOTACIÓN: [número de explotación]

LOGS DE LA CONSOLA:
[pega los logs completos aquí]

ESTRUCTURA DE DATOS RECIBIDA:
[pega el JSON de "Estructura de datos recibida" aquí]
```

## 📝 Archivos Modificados

### APIs (`src/api/cea.ts`)
- ✅ Agregados logs detallados
- ✅ Formato automático de explotación con ceros (`"1"` → `"01"`)
- ✅ Logs de parámetros recibidos y enviados

### Componentes
- ✅ `ContratoConsumosTab.tsx`: Múltiples rutas de parseo
- ✅ `ContratoTarifasTab.tsx`: Múltiples rutas de parseo
- ✅ `useConceptos.ts`: Múltiples rutas de parseo

### Logs Agregados
- Parámetros recibidos (tipo y valor)
- Parámetros formateados (después del padStart)
- XML del request
- Respuesta completa del SOAP
- Cada nivel del parseo de JSON
- Estructura completa si falla

## 🎯 Próximos Pasos

1. **Prueba con un contrato conocido** que sepas que tiene datos
2. **Revisa la consola** y busca los logs mencionados arriba
3. **Copia la estructura de datos** si ves errores
4. **Comparte los logs** para que podamos ajustar el parseador

## 💡 Tip

Si estás usando **Postman** o **SoapUI**, prueba primero las APIs directamente con:
- Explotación: `01` (con cero a la izquierda)
- Contrato: El número tal cual
- Idioma: `es`

Esto confirmará si el problema es del parsing o de la API misma.
