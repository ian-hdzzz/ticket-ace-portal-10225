# 🔍 Debugging de Tarifas - Paso a Paso

**Fecha:** 18 de diciembre de 2025  
**Problema:** El componente ContratoTarifasTab no muestra información  
**Solución:** Mejorar logging y parsing de respuesta SOAP

---

## 📋 Cambios Implementados

### 1. **Nueva Función Helper en `cea.ts`**

Se agregó `getTarifaDeAguaPorContratoJson()` para facilitar el parsing de XML a JSON:

```typescript
export const getTarifaDeAguaPorContratoJson = async (
  explotacion: string, 
  contrato: string, 
  idioma: string = 'es'
) => {
  const xmlDoc = await getTarifaDeAguaPorContrato(explotacion, contrato, idioma);
  
  // Serializar XML para debugging
  const serializer = new XMLSerializer();
  const xmlString = serializer.serializeToString(xmlDoc);
  console.log('[getTarifaDeAguaPorContratoJson] XML String:', xmlString);
  
  // Buscar el elemento de retorno
  const returnElement = 
    xmlDoc.getElementsByTagName('getTarifaDeAguaPorContratoReturn')[0] || 
    xmlDoc.getElementsByTagName('getTarifaDeAguaPorContratoResponse')[0] ||
    xmlDoc.getElementsByTagName('return')[0];
  
  if (returnElement) {
    return xmlToJson(returnElement as Element);
  }
  
  return xmlToJson(xmlDoc);
};
```

**Ventajas:**
- ✅ Logging automático del XML raw
- ✅ Prueba múltiples nombres de elementos de retorno
- ✅ Fallback a documento completo si no encuentra elemento específico

---

### 2. **Logging Mejorado en ContratoTarifasTab**

Se agregaron logs detallados en el componente:

```typescript
const data = await getTarifaDeAguaPorContratoJson(explotacion, numeroContrato);
console.log('[ContratoTarifasTab] Datos JSON recibidos:', data);

// Explorar múltiples rutas posibles
const possiblePaths = [
  data,
  data.getTarifaDeAguaPorContratoReturn,
  data.return,
  data.Body?.getTarifaDeAguaPorContratoResponse?.getTarifaDeAguaPorContratoReturn,
  // ... más rutas
];

for (let i = 0; i < possiblePaths.length; i++) {
  const path = possiblePaths[i];
  if (path && typeof path === 'object' && (path.codigo || path.descripcion || path.subconceptos)) {
    console.log(`[ContratoTarifasTab] ✓ Datos encontrados en ruta ${i}`);
    tarifaRaw = path;
    break;
  }
}
```

**Ventajas:**
- ✅ Identifica automáticamente la ruta correcta de los datos
- ✅ Logs claros indican en qué ruta se encontraron los datos
- ✅ No falla si la estructura cambia ligeramente

---

## 🛠️ Cómo Debuggear

### Paso 1: Abrir DevTools
```
F12 o Cmd+Option+I (Mac)
```

### Paso 2: Navegar al Contrato
```
Dashboard → Contratos → [Seleccionar contrato] → Tab "Tarifas"
```

### Paso 3: Revisar Console Logs

Busca estos logs en orden:

#### **A. Logs de la API (`cea.ts`)**

```
[getTarifaDeAguaPorContrato] Parámetros recibidos: {explotacion: "01", contrato: "123456", ...}
[getTarifaDeAguaPorContrato] SOAP Request XML: <soapenv:Envelope ...>
[getTarifaDeAguaPorContrato] SOAP Response: Document {...}
[getTarifaDeAguaPorContratoJson] XML String: <?xml version="1.0"...>
[getTarifaDeAguaPorContratoJson] JSON parseado: {...}
```

**¿Qué verificar?**
- ✅ `explotacion` tiene formato correcto (con ceros: "01", "02")
- ✅ `SOAP Response` no está vacío
- ✅ `XML String` contiene datos reales (no solo `<return/>`)

#### **B. Logs del Componente**

```
[ContratoTarifasTab] Iniciando llamada con: {numeroContrato: "123456", explotacion: "01"}
[ContratoTarifasTab] Datos JSON recibidos: {...}
[ContratoTarifasTab] Keys disponibles: ["codigo", "descripcion", "subconceptos", ...]
[ContratoTarifasTab] ✓ Datos encontrados en ruta 0
[ContratoTarifasTab] Tarifa raw seleccionada: {...}
```

**¿Qué verificar?**
- ✅ `Datos encontrados en ruta X` aparece (indica parsing exitoso)
- ✅ `Tarifa raw seleccionada` contiene: `codigo`, `descripcion`, `subconceptos`

---

## ❌ Posibles Errores y Soluciones

### Error 1: "No se encontraron tarifas para este contrato"

**Causa:** El parsing no encuentra la estructura esperada

**Solución:**
1. Revisa el log `[ContratoTarifasTab] Estructura completa recibida:`
2. Identifica dónde están los datos reales
3. Agrega una nueva ruta a `possiblePaths` en el componente

**Ejemplo:**
```typescript
const possiblePaths = [
  data,
  data.getTarifaDeAguaPorContratoReturn,
  data.nuevaRutaQueEncontraste, // ← Agregar aquí
  // ...
];
```

---

### Error 2: XML Response vacío o con error

**Síntomas:**
```
[getTarifaDeAguaPorContratoJson] XML String: <return/>
```

**Causas posibles:**
- ❌ Explotación incorrecta
- ❌ Número de contrato inválido
- ❌ Contrato no tiene tarifa asignada en el sistema CEA

**Solución:**
1. Verifica que `explotacion` sea correcta (consulta con CEA)
2. Prueba con otro número de contrato conocido
3. Revisa las credenciales de la API en `.env`

---

### Error 3: Campos undefined (codigo, descripcion, etc.)

**Síntomas:**
```
Código: undefined-undefined-undefined
```

**Causa:** La estructura de `tarifaRaw` no coincide con la esperada

**Solución:**
1. Revisa el log `[ContratoTarifasTab] Tarifa raw seleccionada:`
2. Identifica los nombres reales de los campos
3. Actualiza las interfaces en `ContratoTarifasTab.tsx`

**Ejemplo:**
Si el API devuelve `codigoTarifa` en lugar de `codigo`:
```typescript
interface Tarifa {
  codigoTarifa: {  // ← Cambiar nombre
    id1: string;
    // ...
  };
}
```

---

## 📊 Estructura Esperada de la Respuesta

### Estructura Mínima
```typescript
{
  codigo: {
    id1Short: "string",
    id2Short: "string", 
    id3Short: "string"
  },
  descripcion: "string",
  publicacion: {
    fechaPublicacion: "2025-01-01",
    textoPublicacion: "string"
  },
  subconceptos: {
    Subconcepto: [
      {
        descripcion: "string",
        correctoresAplicables: {
          Corrector: [
            { descripcion: "string" }
          ]
        }
      }
    ]
  },
  variablesContratos: {
    Variable: [
      {
        id: "string",
        descripcion: "string",
        valor: "string"
      }
    ]
  },
  variablesPuntoServicio: {
    Variable: [] | null
  }
}
```

---

## 🧪 Pruebas Recomendadas

### Test 1: Contrato con Tarifa Conocida
```typescript
// En console del navegador
const test = await getTarifaDeAguaPorContratoJson("01", "123456");
console.log(test);
```

### Test 2: Verificar Explotación
```typescript
// Revisar localStorage
const expl = localStorage.getItem('contrato_123456_explotacion');
console.log('Explotación guardada:', expl);
```

### Test 3: Parsing Manual
```typescript
// Copiar el XML String del log y parsearlo manualmente
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlStringCopiado, "text/xml");
console.log('Elementos encontrados:', xmlDoc.getElementsByTagName('*'));
```

---

## 📝 Checklist de Debugging

- [ ] Logs de API aparecen en consola
- [ ] SOAP Request XML se construye correctamente
- [ ] SOAP Response contiene datos (no vacío)
- [ ] JSON parseado tiene estructura esperada
- [ ] Component encuentra datos en alguna ruta
- [ ] `tarifaRaw` contiene campos: `codigo`, `descripcion`, `subconceptos`
- [ ] UI renderiza sin errores
- [ ] Datos se muestran correctamente en pantalla

---

## 🔗 Referencias

- **Archivo API:** `/src/api/cea.ts` (línea ~440)
- **Componente:** `/src/components/contrato/ContratoTarifasTab.tsx`
- **Docs anteriores:** 
  - `/docs/ACTUALIZACION_TARIFAS_REAL.md`
  - `/docs/TROUBLESHOOTING_CONSUMOS_TARIFAS.md`

---

## 💡 Tips

1. **Usar Network Tab:** Revisa la pestaña Network → WS/XHR para ver el request/response raw
2. **Breakpoints:** Coloca breakpoints en `getTarifaDeAguaPorContratoJson` para inspeccionar el XML
3. **Pretty Print:** Usa `JSON.stringify(data, null, 2)` para logs más legibles
4. **XML Viewer:** Copia el XML String a un visor online para analizarlo mejor

---

**Última actualización:** 18 dic 2025
