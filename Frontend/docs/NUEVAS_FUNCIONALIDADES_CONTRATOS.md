# Nuevas Funcionalidades - Gestión de Contratos

## 📋 Resumen

Se han integrado las APIs `getConceptos`, `getConsumos` y `getTarifaDeAguaPorContrato` en una nueva **página de Detalle de Contrato** que unifica toda la información relacionada con un contrato.

## 🎯 Enfoque de Integración

En lugar de crear páginas separadas repetitivas, se optó por:

1. **Vista Unificada de Contrato** con sistema de tabs
2. **Hook de caché** para conceptos (evitar llamadas repetidas)
3. **Componentes reutilizables** para cada sección

## 📂 Archivos Creados

### 1. Hook para Conceptos
**`src/hooks/useConceptos.ts`**
- Cachea los conceptos de facturación (catálogo)
- Evita llamadas repetidas a la API
- Proporciona helper para traducir códigos a descripciones

### 2. Página Principal
**`src/pages/ContratoDetail.tsx`**
- Ruta: `/dashboard/contratos/detail/:contratoId`
- 4 tabs: Información, Consumos, Tarifas, Financiero
- Vista unificada con estadísticas rápidas

### 3. Componentes de Tabs

#### **`src/components/contrato/ContratoInfoTab.tsx`**
- Información general del contrato y titular
- Datos del punto de suministro
- Fechas de alta/baja

#### **`src/components/contrato/ContratoConsumosTab.tsx`**
- Usa `getConsumos` API
- Muestra historial de consumo con importes
- Gráfica dual: m³ + importes ($)
- Filtro por año
- Estadísticas: promedio, máximo, mínimo
- Desglose de conceptos por período

#### **`src/components/contrato/ContratoTarifasTab.tsx`**
- Usa `getTarifaDeAguaPorContrato` API
- Muestra estructura tarifaria por tramos
- Calculadora de ejemplo (simula costo de 25 m³)
- Historial de tarifas anteriores
- Visualización de rangos de consumo

#### **`src/components/contrato/ContratoFinancieroTab.tsx`**
- Combina `getDeuda` + `getConceptos`
- Estado de cuenta completo
- Deuda actual vs saldo anterior
- Conceptos principales de facturación
- Documentos de pago
- Acciones recomendadas si hay deuda

## 🔗 Integración con Páginas Existentes

### Actualización en `Contratos.tsx`
```tsx
// Guarda la explotación en localStorage
localStorage.setItem(`contrato_${contratoId}_explotacion`, explotacion);

// Botón actualizado
<Button onClick={() => navigate(`/dashboard/contratos/detail/${contratoId}`)}>
  Ver Detalles
</Button>
```

### Rutas Actualizadas en `App.tsx`
```tsx
<Route 
  path="contratos/detail/:contratoId" 
  element={<ContratoDetail />} 
/>
```

## ✨ Características Principales

### Tab 1: Información General
- ✅ Datos del titular (nombre, teléfono, email)
- ✅ Información del contrato (número, explotación, tipo de uso)
- ✅ Punto de suministro (dirección, contador)
- ✅ Fechas (alta, baja)

### Tab 2: Consumos
- ✅ Gráfica de evolución (consumo + importe)
- ✅ Estadísticas: promedio, máximo, mínimo
- ✅ Tabla con desglose por período
- ✅ Fechas de inicio/fin de cada período
- ✅ Conceptos facturados en cada período
- ✅ Filtro por año

### Tab 3: Tarifas
- ✅ Tarifa actual con vigencia
- ✅ Estructura tarifaria por tramos
- ✅ Precio por m³ en cada tramo
- ✅ Calculadora de ejemplo interactiva
- ✅ Historial de tarifas anteriores

### Tab 4: Financiero
- ✅ Estado de deuda (actual + anterior)
- ✅ Desglose: principal + comisiones
- ✅ Ciclos de facturación
- ✅ Conceptos principales de facturación
- ✅ Documentos de pago
- ✅ Alertas según estado (al corriente / con deuda)
- ✅ Acciones recomendadas

## 🎨 Valor Agregado

### Para el Usuario
1. **Vista 360°**: Toda la información del contrato en un solo lugar
2. **Sin repetición**: No navegar entre múltiples páginas
3. **Contexto**: Relaciona consumos → tarifas → importes → deuda
4. **Educativo**: Calculadora de tarifas ayuda a entender la factura

### Para el Desarrollo
1. **Reutilizable**: Componentes modulares
2. **Eficiente**: Cache de conceptos
3. **Mantenible**: Separación por tabs
4. **Extensible**: Fácil agregar más tabs

## 🚀 Uso

```tsx
// Desde la página de Contratos
<Button onClick={() => navigate(`/dashboard/contratos/detail/${contratoId}`)}>
  Ver Detalles
</Button>

// Ruta directa
navigate('/dashboard/contratos/detail/523161')
```

## 📊 Datos Mostrados

### getConsumos
- Año, período, fechas
- Metros cúbicos consumidos
- Importe total
- Conceptos facturados con importes

### getTarifaDeAguaPorContrato
- Código y descripción de tarifa
- Vigencia (desde/hasta)
- Tramos: desde, hasta, precio por m³
- Moneda

### getConceptos
- Código del concepto
- Descripción legible
- Si es periódico o eventual
- Organismo propietario

## 🔄 Flujo de Navegación

```
Contratos (búsqueda)
    ↓
Ver Detalles
    ↓
ContratoDetail (tabs)
    ├─ Info General
    ├─ Consumos (getConsumos + gráfica)
    ├─ Tarifas (getTarifaDeAguaPorContrato + calculadora)
    └─ Financiero (getDeuda + getConceptos)
```

## 🎯 Siguiente Paso

Para probar:
1. Busca un contrato en `/dashboard/contratos`
2. Click en "Ver Detalles"
3. Navega entre los tabs para ver toda la información

## 💡 Notas

- Los conceptos se cachean automáticamente (solo 1 llamada API)
- La explotación se guarda en localStorage para persistencia
- Los componentes manejan estados de carga y error
- Diseño responsive con Tailwind CSS
- Gráficas interactivas con Recharts
