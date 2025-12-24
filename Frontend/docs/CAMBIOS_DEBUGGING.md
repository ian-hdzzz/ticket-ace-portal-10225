# 🔧 Correcciones Aplicadas - APIs de Consumos y Tarifas

## ✅ Cambios Realizados

### 1. **Formateo Automático de Explotación**
**Archivos modificados:**
- `src/api/cea.ts` → `getConsumos()`
- `src/api/cea.ts` → `getConceptos()`
- `src/api/cea.ts` → `getTarifaDeAguaPorContrato()`

**Cambio:**
```typescript
// Antes:
<explotacion>${xmlEscape(explotacion)}</explotacion>

// Ahora:
const explotacionFormatted = explotacion.padStart(2, '0');
<explotacion>${xmlEscape(explotacionFormatted)}</explotacion>

// Resultado:
"1" → "01"
"12" → "12"
```

### 2. **Logs Detallados en APIs**
**Agregado a cada función API:**
```typescript
console.log('[nombreAPI] Parámetros recibidos:', { 
  explotacion, 
  contrato, 
  idioma,
  explotacionType: typeof explotacion,
  contratoType: typeof contrato 
});

console.log('[nombreAPI] Request params formateados:', {...});
console.log('[nombreAPI] SOAP Request XML:', xml);
console.log('[nombreAPI] SOAP Response:', response);
```

**Beneficio:**
- Ver exactamente qué se envía a la API
- Detectar problemas de formato
- Verificar la respuesta completa

### 3. **Parseo Multi-Ruta en Componentes**

#### `ContratoConsumosTab.tsx`
```typescript
// Intenta múltiples rutas posibles:
let consumosRaw = data?.Body?.getConsumosResponse?.getConsumosReturn?.Consumo;

if (!consumosRaw) {
  consumosRaw = data?.getConsumosResponse?.getConsumosReturn?.Consumo;
}
if (!consumosRaw) {
  consumosRaw = data?.getConsumosReturn?.Consumo;
}
if (!consumosRaw) {
  consumosRaw = data?.Consumo;
}

// Si falla, muestra la estructura completa:
console.error("Estructura de datos recibida:", JSON.stringify(data, null, 2));
```

#### `ContratoTarifasTab.tsx`
- Misma lógica aplicada para tarifas

#### `useConceptos.ts`
- Misma lógica aplicada para conceptos

**Beneficio:**
- Funciona con diferentes estructuras de respuesta XML/JSON
- Logs detallados para debugging
- Muestra estructura completa si falla

### 4. **Logs de Debugging en Componentes**
**Agregado en cada componente:**
```typescript
console.log("Datos de [consumos/tarifas] completos:", data);
console.log("Body:", data?.Body);
console.log("getConsumosResponse:", data?.Body?.getConsumosResponse);
console.log("getConsumosReturn:", data?.Body?.getConsumosResponse?.getConsumosReturn);
console.log("Consumos raw encontrados:", consumosRaw);
```

**Beneficio:**
- Ver cada nivel del parseo
- Identificar dónde están realmente los datos
- Facilitar ajustes rápidos

## 🎯 Cómo Usar los Logs

### En la Consola del Navegador
1. Abre DevTools (F12)
2. Ve al tab "Console"
3. Busca un contrato
4. Click en "Ver Detalles"
5. Navega al tab de Consumos o Tarifas

### Qué Buscar

#### ✅ Logs Exitosos:
```
[getConsumos] Parámetros recibidos: {explotacion: "1", contrato: "523161"}
[getConsumos] Request params formateados: {explotacion: "01", contrato: "523161"}
Consumos raw encontrados: [{año: "2024", periodo: "..."}, ...]
```

#### ❌ Logs de Error:
```
[getConsumos] Parámetros recibidos: {explotacion: "1", contrato: "523161"}
[getConsumos] SOAP Response: Document {...}
Consumos raw encontrados: undefined
Estructura de datos recibida: {
  "Body": {
    "DiferenteCampo": {
      // Los datos están en otra ubicación
    }
  }
}
```

## 🔍 Debugging Paso a Paso

### Problema: "No se encontraron consumos"

**Paso 1:** Verifica que se envíe la petición
```
✅ Debe aparecer: [getConsumos] Request params formateados
```

**Paso 2:** Verifica que llegue respuesta
```
✅ Debe aparecer: [getConsumos] SOAP Response: Document
```

**Paso 3:** Verifica la estructura
```
✅ Revisa: "Datos de consumos completos"
```

**Paso 4:** Identifica dónde están los datos
```
Si ves "Consumos raw encontrados: undefined"
Busca en "Estructura de datos recibida" dónde están realmente
```

**Paso 5:** Ajusta el código
```typescript
// Si los datos están en otro lugar:
// Ejemplo: data?.Response?.Items?.Item
const consumosRaw = data?.Response?.Items?.Item;
```

## 📋 Checklist de Verificación

### Antes de Reportar un Error:

- [ ] Abrí la consola del navegador
- [ ] Vi los logs de `[nombreAPI] Parámetros recibidos`
- [ ] Vi los logs de `[nombreAPI] SOAP Response`
- [ ] Vi los logs de `Datos de [consumos/tarifas] completos`
- [ ] Copié la estructura completa de datos si falló
- [ ] Verifiqué que el contrato y explotación sean correctos
- [ ] Probé con diferentes contratos

### Información para Reportar:

```markdown
**Contrato probado:** 523161
**Explotación:** 1

**Logs en consola:**
[pega aquí los logs completos]

**Estructura de datos recibida:**
[pega aquí el JSON de "Estructura de datos recibida"]

**Error mostrado en UI:**
No se encontraron consumos para este contrato
```

## 🚀 Próximos Pasos

1. **Limpia la caché del navegador** (Ctrl+Shift+Delete)
2. **Recarga la página** (Ctrl+R o Cmd+R)
3. **Busca un contrato conocido**
4. **Abre la consola ANTES de hacer click en los tabs**
5. **Navega a Consumos/Tarifas/Financiero**
6. **Copia los logs** y compártelos

## 📁 Archivos Modificados

```
src/
├── api/
│   └── cea.ts                          ✅ Logs + formato explotación
├── components/
│   └── contrato/
│       ├── ContratoConsumosTab.tsx     ✅ Multi-ruta + logs
│       ├── ContratoTarifasTab.tsx      ✅ Multi-ruta + logs
│       └── ContratoFinancieroTab.tsx   (sin cambios)
└── hooks/
    └── useConceptos.ts                 ✅ Multi-ruta + logs
```

## 💡 Notas Importantes

1. **Explotación siempre se formatea con 2 dígitos:** `"1"` → `"01"`
2. **Contrato se mantiene tal cual:** `"523161"` → `"523161"`
3. **Si necesitas ceros en contrato:** Agregar `.padStart(10, '0')` en `cea.ts`
4. **Los logs son temporales:** Puedes comentarlos después de resolver el problema

## 🎯 Test Rápido

```javascript
// Copia esto en la consola del navegador:
localStorage.setItem('contrato_523161_explotacion', '01');

// Luego navega a:
/dashboard/contratos/detail/523161

// Y revisa los logs
```

---

**Última actualización:** 18 de diciembre de 2025  
**Estado:** Esperando feedback de logs de consola
