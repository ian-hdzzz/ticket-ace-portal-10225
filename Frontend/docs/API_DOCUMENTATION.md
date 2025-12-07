# CEA API Documentation

This document details the SOAP and REST endpoints integrated into the application, including their parameters and XML payload structures.

## Authentication
All SOAP endpoints use WS-Security (UsernameToken) for authentication. The `wsse:Security` header is automatically injected into the SOAP Header.

## SOAP Endpoints

### 1. Get Deuda
**Function:** `getDeuda`
**Service:** `InterfazGenericaGestionDeudaWS`
**Description:** Retrieves debt information for a specific identifier.

**Parameters:**
- `tipoIdentificador`: Type of identifier (e.g., 'CONTRATO').
- `valor`: The identifier value.
- `explotacion`: Exploitation code.
- `idioma`: Language code (default 'es').

**XML Payload:**
```xml
<soapenv:Envelope ...>
   <soapenv:Header>
      <wsse:Security ...>...</wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <int:getDeuda>
         <tipoIdentificador>{tipoIdentificador}</tipoIdentificador>
         <valor>{valor}</valor>
         <explotacion>{explotacion}</explotacion>
         <idioma>{idioma}</idioma>
      </int:getDeuda>
   </soapenv:Body>
</soapenv:Envelope>
```

### 2. Get Contratos
**Function:** `getContratos`
**Service:** `InterfazGenericaContratacionWS`
**Description:** Searches for contracts based on various criteria.

**Parameters:**
- `numeroContrato`: Contract number.
- `actividad`: Activity code.
- `actividadSectorial`: Sectorial activity.
- `uso`: Usage type.
- `cnaeDesde`: Start CNAE.
- `cnaeHasta`: End CNAE.
- `estados`: Array of status strings.

**XML Payload:**
```xml
<soapenv:Envelope ...>
   <soapenv:Header>
      <wsse:Security ...>...</wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <occ:getContratos>
         <numeroContrato>{numeroContrato}</numeroContrato>
         <actividad>{actividad}</actividad>
         <actividadSectorial>{actividadSectorial}</actividadSectorial>
         <uso>{uso}</uso>
         <cnaeDesde>{cnaeDesde}</cnaeDesde>
         <cnaeHasta>{cnaeHasta}</cnaeHasta>
         <estados>
            <string>{estado1}</string>
            <string>{estado2}</string>
            ...
         </estados>
      </occ:getContratos>
   </soapenv:Body>
</soapenv:Envelope>
```

### 3. Resolve OT (Orden de Trabajo)
**Function:** `resolveOT`
**Service:** `InterfazGenericaOrdenesServicioWS`
**Description:** Resolves a work order.

**Parameters:** `data` object containing:
- `operationalSiteID`, `installationID`, `systemOrigin`, `otClass`, `otOrigin`
- `endDateOt`, `endLastTaskOt`
- `finalSolution`, `nonExecutionMotive`, `solutionDescription`
- `executorIdentifier`, `executorName`, `companyExecutorIdentifier`, `companyExecutorName`
- `transmitterInstalled`, `language`, `suspensionLevel`
- `longitude`, `latitude`, `coordinatesType`, `codificationType`, `captureDate`

**XML Payload:**
```xml
<soapenv:Envelope ...>
   <soapenv:Header>
      <wsse:Security ...>...</wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <int:resolveOT>
         <otResolution>
            <otResolutionData>
               <operationalSiteID>{data.operationalSiteID}</operationalSiteID>
               <installationID>{data.installationID}</installationID>
               <!-- ... other fields ... -->
               <geolocalization>
                  <longitude>{data.longitude}</longitude>
                  <latitude>{data.latitude}</latitude>
                  <!-- ... -->
               </geolocalization>
            </otResolutionData>
         </otResolution>
      </int:resolveOT>
   </soapenv:Body>
</soapenv:Envelope>
```

### 4. Informar Visita
**Function:** `informarVisita`
**Service:** `InterfazGenericaOrdenesServicioWS`
**Description:** Reports a visit for a work order.

**Parameters:** `data` object containing:
- `id`, `codOrden`, `fechaVisita`, `resultado`
- `idOperario`, `nombreOperario`, `cifContratista`, `nombreContratista`
- `codIncidencia`, `descIncidencia`, `observaciones`
- `codVinculacion`, `idDocFirma`
- `personaNombre`, `personaApellido1`, `personaApellido2`, `personaTelefono`, `personaNif`

**XML Payload:**
```xml
<soapenv:Envelope ...>
   <soapenv:Header>
      <wsse:Security ...>...</wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <int:informarVisita>
         <id>{data.id}</id>
         <codOrden>{data.codOrden}</codOrden>
         <fechaVisita>{data.fechaVisita}</fechaVisita>
         <resultado>{data.resultado}</resultado>
         <!-- ... -->
         <aResponsable>
            <codVinculacion>{data.codVinculacion}</codVinculacion>
            <personaVisita>
               <nombre>{data.personaNombre}</nombre>
               <!-- ... -->
            </personaVisita>
         </aResponsable>
      </int:informarVisita>
   </soapenv:Body>
</soapenv:Envelope>
```

### 5. Cambiar Persona Notificación Contrato
**Function:** `cambiarPersonaNotificacionContrato`
**Service:** `InterfazOficinaVirtualClientesWS`
**Description:** Updates the notification contact for a contract.

**Parameters:**
- `contrato`: Contract number.
- `nif`: NIF of the person.
- `email1`, `email2`: Email addresses.
- `usuario`: User identifier.

**XML Payload:**
```xml
<soapenv:Envelope ...>
   <soapenv:Header>
      <wsse:Security ...>...</wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <occ:cambiarPersonaNotificacionContrato>
         <contrato>{contrato}</contrato>
         <nif>{nif}</nif>
         <email1>{email1}</email1>
         <email2>{email2}</email2>
         <usuario>{usuario}</usuario>
      </occ:cambiarPersonaNotificacionContrato>
   </soapenv:Body>
</soapenv:Envelope>
```

### 6. Cambiar Tipo Factura Contrato
**Function:** `cambiarTipoFacturaContrato`
**Service:** `InterfazOficinaVirtualClientesWS`
**Description:** Updates the invoice type (e.g., digital/paper) for a contract.

**Parameters:**
- `contrato`: Contract number.
- `nif`: NIF of the holder.
- `tipoFactura`: Invoice type code.
- `usuario`: User identifier.

**XML Payload:**
```xml
<soapenv:Envelope ...>
   <soapenv:Header>
      <wsse:Security ...>...</wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <occ:cambiarTipoFacturaContrato>
         <contrato>{contrato}</contrato>
         <nif>{nif}</nif>
         <tipoFactura>{tipoFactura}</tipoFactura>
         <usuario>{usuario}</usuario>
      </occ:cambiarTipoFacturaContrato>
   </soapenv:Body>
</soapenv:Envelope>
```

### Other SOAP Endpoints
- **`consultaDetalleContrato`**: Retrieves detailed contract info.
- **`getContrato`**: Retrieves contract info with options.
- **`crearOrdenTrabajo`**: Creates a new work order.
- **`getPuntoServicioPorContador`**: Finds service point by meter serial number.
- **`getLecturas`**: Retrieves meter readings.
- **`cambiarEmailNotificacionPersona`**: Updates email for notifications.

## REST Endpoints

### 1. Update Case to Closed
**Function:** `updateCaseToClosed`
**Payload:**
```json
{
  "evento": "terminar_reporte_caso",
  "data": {
    "caso_sn": "{caseId}",
    "sn_code": "{code}",
    "sn_notes": "{note}",
    "sys_id": "",
    "orden_aquacis": ""
  }
}
```

### 2. Reference Work Order Aquacis
**Function:** `referenceWorkOrderAquacis`
**Payload:**
```json
{
  "evento": "asigna_orden_aquacis",
  "data": {
    "sys_id": "{caseId}",
    "orden_aquacis": "{workOrderId}",
    "caso_sn": "",
    "sn_code": "",
    "sn_notes": ""
  }
}
```

### 3. Update Case to Cancelled
**Function:** `updateCaseToCancelled`
**Payload:**
```json
{
  "evento": "anular_reporte_caso",
  "data": {
    "caso_sn": "{caseId}",
    "sys_id": "",
    "orden_aquacis": "",
    "sn_code": "",
    "sn_notes": ""
  }
}
```
