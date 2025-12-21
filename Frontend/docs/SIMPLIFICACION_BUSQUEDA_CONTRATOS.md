# 🎯 Simplificación de Búsqueda de Contratos

**Fecha:** 18 de diciembre de 2025  
**Cambio:** Eliminación del campo manual de explotación - ahora se detecta automáticamente

---

## 📝 Resumen del Cambio

Antes, el usuario tenía que ingresar **manualmente** tanto el número de contrato como la explotación. Ahora, **solo necesita el número de contrato** y la explotación se detecta automáticamente desde la respuesta de la API.

---

## ✅ Cambios Implementados

### 1. **Eliminado State de Explotación**

**Antes:**
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [explotacionQuery, setExplotacionQuery] = useState("1"); // ❌ Eliminado
const [isSearching, setIsSearching] = useState(false);
```

**Después:**
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [isSearching, setIsSearching] = useState(false);
```

---

### 2. **Detección Automática de Explotación**

La explotación ahora se obtiene directamente del objeto de respuesta del contrato:

```typescript
const contratoInfo: ContratoInfo = {
  numeroContrato: contrato.numeroContrato || searchQuery,
  titular: contrato.titular || datosPersonales?.titular || 'Sin titular',
  // ...otros campos...
  explotacion: contrato.explotacion || '1', // ✅ Automático desde la API
  rawData: data,
};
```

**Fallback:** Si la API no devuelve `contrato.explotacion`, usa `"1"` por defecto.

---

### 3. **UI Simplificado**

**Antes:**
```tsx
<div className="flex gap-4">
  <Input placeholder="Número de contrato..." />
  <Input placeholder="Explotación (e.g. 01)" maxLength={2} /> {/* ❌ Eliminado */}
  <Button>Buscar</Button>
</div>
```

**Después:**
```tsx
<div className="flex gap-4">
  <Input placeholder="Número de contrato (ej: 523161)..." />
  <Button>Buscar</Button>
</div>
<p className="text-sm text-muted-foreground mt-2">
  Busca contratos por número. La explotación se detecta automáticamente.
</p>
```

---

### 4. **Validación Simplificada**

**Antes:**
```tsx
disabled={isSearching || !searchQuery.trim() || !explotacionQuery.trim()}
```

**Después:**
```tsx
disabled={isSearching || !searchQuery.trim()}
```

Ahora solo valida que haya un número de contrato.

---

## 🎨 Beneficios

1. ✅ **Menos fricción para el usuario** - Un campo menos que llenar
2. ✅ **Menos errores** - No puede ingresar una explotación incorrecta
3. ✅ **Más rápido** - Búsqueda con un solo click
4. ✅ **UX mejorada** - Interfaz más limpia y simple
5. ✅ **Consistencia** - La explotación siempre viene del sistema CEA

---

## 📊 Flujo de Datos Actualizado

```
Usuario ingresa número de contrato
    ↓
Sistema consulta API: consultaDetalleContratoJson(numeroContrato)
    ↓
API CEA devuelve:
  {
    GenericoContratoDTO: {
      contrato: {
        numeroContrato: "523161",
        explotacion: "01",  ← ✅ Se obtiene aquí automáticamente
        titular: "...",
        // ...
      }
    }
  }
    ↓
Sistema guarda en localStorage:
  contrato_523161_explotacion = "01"
    ↓
Navegación a detalles usa explotación guardada
```

---

## 🔄 Compatibilidad con Páginas Existentes

### ✅ ContratoDetail
Sigue funcionando igual, obtiene explotación de localStorage:
```typescript
const explotacion = localStorage.getItem(`contrato_${contratoId}_explotacion`) || "1";
```

### ✅ Ver Lecturas
El botón "Ver Lecturas" ahora usa la explotación detectada:
```tsx
<Button onClick={() => navigate(`/dashboard/lecturas/${contrato.numeroContrato}/${contrato.explotacion}`)}>
  Ver Lecturas
</Button>
```

### ✅ Ver Detalles
El botón "Ver Detalles" funciona igual:
```tsx
<Button onClick={() => navigate(`/dashboard/contratos/detail/${contrato.numeroContrato}`)}>
  Ver Detalles
</Button>
```

---

## 🧪 Casos de Prueba

### Caso 1: Contrato con Explotación en Respuesta
```
Input: 523161
API devuelve: { contrato: { explotacion: "01" } }
Resultado: ✅ Se usa "01"
```

### Caso 2: Contrato sin Explotación en Respuesta
```
Input: 999999
API devuelve: { contrato: { explotacion: null } }
Resultado: ✅ Se usa "1" (fallback)
```

### Caso 3: Búsqueda Múltiple
```
Input: 523161, luego 888888
Resultado: ✅ Cada contrato mantiene su explotación correcta
```

---

## 📱 Apariencia Visual

### Antes:
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar Contrato                                      │
├─────────────────────────────────────────────────────────┤
│ [# Número de contrato...] [Expl.] [🔍 Buscar]          │
│ Busca contratos por número y explotación               │
└─────────────────────────────────────────────────────────┘
```

### Después:
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar Contrato                                      │
├─────────────────────────────────────────────────────────┤
│ [# Número de contrato (ej: 523161)...] [🔍 Buscar]     │
│ La explotación se detecta automáticamente.              │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos (Opcional)

Posibles mejoras futuras:

1. **Búsqueda por Titular:** Agregar búsqueda por nombre
2. **Historial de Búsquedas:** Guardar últimas búsquedas en localStorage
3. **Autocomplete:** Sugerir contratos mientras escribe
4. **Búsqueda por Dirección:** Permitir buscar por ubicación

---

## 📚 Archivos Modificados

- ✅ `/src/pages/Contratos.tsx`
  - Eliminado state `explotacionQuery`
  - Removido input de explotación del UI
  - Actualizada lógica para usar `contrato.explotacion` de la API
  - Simplificada validación del botón de búsqueda

---

**Última actualización:** 18 dic 2025
