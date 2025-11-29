import axios from 'axios';

// Environment variables
const CEA_REST_URL = import.meta.env.VITE_CEA_REST_URL;
const CEA_SOAP_CONTRACT_URL = import.meta.env.VITE_CEA_SOAP_CONTRACT_URL;
const CEA_SOAP_WORKORDER_URL = import.meta.env.VITE_CEA_SOAP_WORKORDER_URL;
const CEA_SOAP_METER_URL = import.meta.env.VITE_CEA_SOAP_METER_URL;
const CEA_SOAP_DEBT_URL = import.meta.env.VITE_CEA_SOAP_DEBT_URL;
const CEA_SOAP_READINGS_URL = import.meta.env.VITE_CEA_SOAP_READINGS_URL;
const CEA_SOAP_RECEIPT_URL = import.meta.env.VITE_CEA_SOAP_RECEIPT_URL;
const CEA_API_USERNAME = import.meta.env.VITE_CEA_API_USERNAME;
const CEA_API_PASSWORD = import.meta.env.VITE_CEA_API_PASSWORD;

// Helper to parse XML response
const parseXmlResponse = (xmlString: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  // Basic error checking
  const parserError = xmlDoc.getElementsByTagName("parsererror");
  if (parserError.length > 0) {
    throw new Error("Error parsing XML response");
  }
  return xmlDoc;
};

// Helper to extract text content from a tag
const getTagValue = (xmlDoc: Document | Element, tagName: string): string | null => {
  const element = xmlDoc.getElementsByTagName(tagName)[0];
  return element ? element.textContent : null;
};

// ============================================================================
// REST API Functions
// ============================================================================

export const updateCaseToClosed = async (caseId: string, code: string, note: string) => {
  const url = `${CEA_REST_URL}`; // Assuming the endpoint is the base URL or specific path needs to be appended? 
  // The user request shows "PUT Update Case to closed" with body.
  // It seems the URL is https://appcea.ceaqueretaro.gob.mx/ceadevws/
  
  const data = {
    evento: "terminar_reporte_caso",
    data: {
      sn_caso: caseId,
      sn_code: code,
      sn_notes: note
    }
  };

  const response = await axios.put(url, data);
  return response.data;
};

export const referenceWorkOrderAquacis = async (caseId: string, workOrderId: string) => {
  const url = `${CEA_REST_URL}`; 
  const data = {
    evento: "asigna_orden_aquacis",
    data: {
      sys_id: caseId,
      orden_aquacis: workOrderId
    }
  };

  const response = await axios.put(url, data);
  return response.data;
};

export const updateCaseToCancelled = async (caseId: string) => {
  const url = `${CEA_REST_URL}`;
  const data = {
    evento: "anular_reporte_caso",
    data: {
      sn_caso: caseId
    }
  };

  const response = await axios.put(url, data);
  return response.data;
};

// ============================================================================
// SOAP API Functions
// ============================================================================

// Generic SOAP request helper
const sendSoapRequest = async (url: string, soapAction: string, xmlBody: string) => {
  const response = await axios.post(url, xmlBody, {
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': soapAction
    }
  });
  return parseXmlResponse(response.data);
};

// CEA ConsultaDetalleContrato
export const consultaDetalleContrato = async (numeroContrato: string, idioma: string = 'es') => {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:occ="http://occamWS.ejb.negocio.occam.agbar.com">
   <soapenv:Header/>
   <soapenv:Body>
      <occ:consultaDetalleContrato>
         <numeroContrato>${numeroContrato}</numeroContrato>
         <idioma>${idioma}</idioma>
      </occ:consultaDetalleContrato>
   </soapenv:Body>
</soapenv:Envelope>`;
  
  return sendSoapRequest(CEA_SOAP_CONTRACT_URL, '', xml);
};

export const getContrato = async (numContrato: string, idioma: string = 'es', opciones: string = '') => {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:occ="http://occamWS.ejb.negocio.occam.agbar.com">
   <soapenv:Header/>
   <soapenv:Body>
      <occ:getContrato>
         <numContrato>${numContrato}</numContrato>
         <idioma>${idioma}</idioma>
         <opciones>${opciones}</opciones>
      </occ:getContrato>
   </soapenv:Body>
</soapenv:Envelope>`;

  return sendSoapRequest(CEA_SOAP_CONTRACT_URL, '', xml);
};

// CEA CrearOrdenDeTrabajo
export const crearOrdenTrabajo = async (data: {
  tipoOrden: string;
  motivoOrden: string;
  fechaCreacionOrden: string;
  numContrato: string;
  idPtoServicio: string;
  fechaEstimdaFin: string;
  observaciones: string;
  codigoReparacion: string;
  anyoExpediente: string;
}) => {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfazgenericaordenesservicio.occamcxf.occam.agbar.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <int:crearOrdenTrabajo>
         <idioma>es</idioma>
         <ordenTrabajo>
            <tipoOrden>${data.tipoOrden}</tipoOrden>
            <motivoOrden>${data.motivoOrden}</motivoOrden>
            <fechaCreacionOrden>${data.fechaCreacionOrden}</fechaCreacionOrden>
            <numContrato>${data.numContrato}</numContrato>
            <idPtoServicio>${data.idPtoServicio}</idPtoServicio>
            <fechaEstimdaFin>${data.fechaEstimdaFin}</fechaEstimdaFin>
            <observaciones>${data.observaciones}</observaciones>
			 <codigoObsCambCont></codigoObsCambCont>
            <codigoReparacion>${data.codigoReparacion}</codigoReparacion>  
            <anyoExpediente>${data.anyoExpediente}</anyoExpediente>
			 <numeroExpediente></numeroExpediente>
            <instalaValvulaPaso>0</instalaValvulaPaso>
         </ordenTrabajo>
         <enCurso>0</enCurso>
      </int:crearOrdenTrabajo>
   </soapenv:Body>
</soapenv:Envelope>`;

  return sendSoapRequest(CEA_SOAP_WORKORDER_URL, '', xml);
};

// CEA GetContador
export const getPuntoServicioPorContador = async (listaNumSerieContador: string, usuario: string, idioma: string = 'es', opciones: string = '') => {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfazgenericacontadores.occamcxf.occam.agbar.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <int:getPuntoServicioPorContador>
         <listaNumSerieContador>${listaNumSerieContador}</listaNumSerieContador>
         <usuario>${usuario}</usuario>
         <idioma>${idioma}</idioma>
         <opciones>${opciones}</opciones>
      </int:getPuntoServicioPorContador>
   </soapenv:Body>
</soapenv:Envelope>`;

  return sendSoapRequest(CEA_SOAP_METER_URL, '', xml);
};

// CEA getDeuda
export const getDeuda = async (tipoIdentificador: string, valor: string, explotacion: string, idioma: string = 'es') => {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfazgenericagestiondeuda.occamcxf.occam.agbar.com/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
	<soapenv:Header>
		<wsse:Security mustUnderstand="1">
        <wsse:UsernameToken wsu:Id="UsernameToken-${CEA_API_USERNAME}">
          <wsse:Username>${CEA_API_USERNAME}</wsse:Username>
          <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${CEA_API_PASSWORD}</wsse:Password>
        </wsse:UsernameToken>
      </wsse:Security>
	</soapenv:Header>
   <soapenv:Body>
      <int:getDeuda>
         <tipoIdentificador>${tipoIdentificador}</tipoIdentificador>
         <valor>${valor}</valor>
         <explotacion>${explotacion}</explotacion>
         <idioma>${idioma}</idioma>
      </int:getDeuda>
   </soapenv:Body>
</soapenv:Envelope>`;

  return sendSoapRequest(CEA_SOAP_DEBT_URL, '', xml);
};

// CEA GetLecturas
export const getLecturas = async (explotacion: string, contrato: string, idioma: string = 'es') => {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:occ="http://occamWS.ejb.negocio.occam.agbar.com">
   <soapenv:Header/>
   <soapenv:Body>
      <occ:getLecturas>
         <explotacion>${explotacion}</explotacion>
         <contrato>${contrato}</contrato>
         <idioma>${idioma}</idioma>
      </occ:getLecturas>
   </soapenv:Body>
</soapenv:Envelope>`;

  return sendSoapRequest(CEA_SOAP_READINGS_URL, '', xml);
};

// CEASolicitudRecibo (Reusing getContrato structure as per user request, but maybe it's different? The user request listed 'getContrato' under 'CEASolicitudRecibo' endpoint too, but also 'cambiarEmailNotificacionPersona' etc. I will add those.)

export const cambiarEmailNotificacionPersona = async (nif: string, nombre: string, apellido1: string, apellido2: string, contrato: string, emailAntiguo: string, emailNuevo: string, codigoOficina: string, usuario: string) => {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:occ="http://occamWS.ejb.negocio.occam.agbar.com">
   <soapenv:Header/>
   <soapenv:Body>
      <occ:cambiarEmailNotificacionPersona>
         <nif>${nif}</nif>
         <nombre>${nombre}</nombre> 
		<apellido1>${apellido1}</apellido1>
         <apellido2>${apellido2}</apellido2>
         <contrato>${contrato}</contrato>
         <emailAntigo>${emailAntiguo}</emailAntigo>
         <emailNuevo>${emailNuevo}</emailNuevo>
         <atencionDe>ChatBot</atencionDe>
         <codigoOficina>${codigoOficina}</codigoOficina>
         <usuario>${usuario}</usuario>
      </occ:cambiarEmailNotificacionPersona>
   </soapenv:Body>
</soapenv:Envelope>`;

  return sendSoapRequest(CEA_SOAP_RECEIPT_URL, '', xml);
};
