# CEA API Triggers - Handover & Deployment Guide

This document serves as a comprehensive handover guide for the CEA API Database Triggers integration. It details the architecture, logic, deployment steps, and troubleshooting procedures to ensure a smooth transition and operation.

## 1. System Architecture

The integration connects the Supabase database events (inserts/updates) to the CEA SOAP/REST API via Supabase Edge Functions.

### Data Flow
1.  **Database Event**: A record is updated in `opportunities`, `personas`, or `tickets`.
2.  **SQL Trigger**: A PostgreSQL trigger (`AFTER UPDATE`) fires and executes a PL/pgSQL function.
3.  **HTTP Request**: The PL/pgSQL function uses the `pg_net` extension to send an asynchronous HTTP POST request to the `cea-trigger-handler` Edge Function.
4.  **Edge Function**: The TypeScript function receives the payload, determines the action type, and calls the appropriate method in `src/api/cea.ts`.
5.  **CEA API**: The request is sent to the external CEA API (SOAP or REST).

### Key Components
-   **Database**: PostgreSQL (Supabase)
-   **Extension**: `pg_net` (for making HTTP requests from SQL)
-   **Triggers**: `on_opportunity_update`, `on_persona_update`, `on_ticket_update`
-   **Functions (SQL)**: `handle_opportunity_update`, `handle_persona_update`, `handle_ticket_update`
-   **Edge Function**: `cea-trigger-handler` (TypeScript)
-   **API Client**: `src/api/cea.ts`

## 2. Trigger Logic & Use Cases

The system handles the following scenarios:

### A. Opportunity Ready -> Work Order
-   **Trigger**: Update on `opportunities` table.
-   **Condition**: `listo_para_agendar` changes from `false`/`null` to `true`.
-   **Action**: Calls `crearOrdenTrabajo` in CEA API.
-   **Data Source**: `informar_familia`, `informar_corporativo`, or `informar_escuela` JSONB fields.

### B. Persona Update -> Notification Change
-   **Trigger**: Update on `personas` table.
-   **Condition**: `correo` or `whatsapp` changes.
-   **Action**: Calls `cambiarPersonaNotificacionContrato` in CEA API.
-   **Data Source**: `curp` (as NIF), `correo`.

### C. Ticket Status -> Close/Cancel Case
-   **Trigger**: Update on `tickets` table.
-   **Condition**: `status` changes.
-   **Actions**:
    -   If `resuelto` or `cerrado`: Calls `updateCaseToClosed`.
    -   If `cancelado`: Calls `updateCaseToCancelled`.

### D. Metadata Actions (Tickets)
These actions are triggered by updating specific keys in the `metadata` JSONB column of the `tickets` table.

1.  **Resolve OT**:
    -   **Key**: `ot_resolution`
    -   **Action**: Calls `resolveOT`.
    -   **Payload**: Object matching `OTResolution` structure.

2.  **Inform Visit**:
    -   **Key**: `visit_info`
    -   **Action**: Calls `informarVisita`.
    -   **Payload**: Object matching visit info structure.

3.  **Invoice Change**:
    -   **Key**: `invoice_change`
    -   **Action**: Calls `cambiarTipoFacturaContrato`.
    -   **Payload**: `{ contrato, nif, tipoFactura }`.

## 3. Deployment Steps

Follow these steps to deploy the system from scratch or update it.

### Step 1: Prerequisites
Ensure the `pg_net` extension is enabled in your Supabase project.
1.  Go to **Supabase Dashboard** > **Database** > **Extensions**.
2.  Search for `pg_net` and enable it.

### Step 2: Deploy Edge Function
The handler logic is located in `src/functions/cea-trigger-handler.ts`.

1.  **Initialize Function** (if new):
    ```bash
    supabase functions new cea-trigger-handler
    ```
2.  **Update Code**:
    Copy the content of `src/functions/cea-trigger-handler.ts` to `supabase/functions/cea-trigger-handler/index.ts`.
3.  **Set Secrets**:
    Configure the environment variables required by `cea.ts`:
    ```bash
    supabase secrets set CEA_REST_URL="https://..."
    supabase secrets set CEA_SOAP_CONTRACT_URL="https://..."
    supabase secrets set CEA_API_USERNAME="user"
    supabase secrets set CEA_API_PASSWORD="pass"
    # ... set all other VITE_CEA_* variables
    ```
4.  **Deploy**:
    ```bash
    supabase functions deploy cea-trigger-handler
    ```
    **Copy the Function URL** from the output (e.g., `https://xyz.supabase.co/functions/v1/cea-trigger-handler`).

### Step 3: Configure Database Triggers
The SQL definition is in `sql/cea_triggers.sql`.

1.  **Edit SQL File**:
    Open `sql/cea_triggers.sql` and replace the placeholders:
    -   Replace `https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler` with your **Function URL**.
    -   Replace `YOUR_ANON_KEY` with your Supabase **Anon Key** (or Service Role Key if needed).

2.  **Apply SQL**:
    Run the script in the Supabase **SQL Editor**. This will create/replace the functions and triggers.

## 4. Verification & Testing

You can verify the setup using the provided test script or by manipulating data directly.

### Using Test Script
A script `scripts/test-cea-handler.ts` is provided to simulate the webhook payloads locally.
```bash
npx tsx scripts/test-cea-handler.ts
```
*Note: This tests the handler logic, not the actual DB trigger firing.*

### End-to-End Testing
1.  **Open your App/Database**.
2.  **Perform an Action**: e.g., Close a ticket.
3.  **Check Logs**:
    -   **Database Logs**: Check `postgres` logs to ensure `pg_net` sent the request.
    -   **Function Logs**: Check Edge Function logs to see the received payload and API response.

## 5. Troubleshooting

| Issue | Check |
|PO | --- |
| **Trigger doesn't fire** | 1. Is the trigger created? (`\d table_name` in psql)<br>2. Did the condition match? (e.g. `status` actually changed)<br>3. Is `pg_net` enabled? |
| **Function receives no data** | Check the `body` construction in the SQL function. Ensure `row_to_json(NEW)` is working. |
| **API Call Fails** | Check Edge Function logs for 4xx/5xx errors from CEA API. Verify secrets/credentials. |
| **"Net" schema not found** | `pg_net` extension is not enabled. |

## 6. Maintenance
-   **Updating Logic**: Edit `src/functions/cea-trigger-handler.ts` and redeploy the function.
-   **Adding Triggers**: Edit `sql/cea_triggers.sql`, add the new logic, and re-run the SQL script.

## 7. Finalizing the Implementation (Pending Actions)

The current handler code (`src/functions/cea-trigger-handler.ts`) contains commented-out API calls and placeholders to prevent accidental execution during testing. **You must complete the following steps before going live:**

### A. Uncomment API Calls
In `src/functions/cea-trigger-handler.ts`, uncomment the following lines to enable actual communication with the CEA API:

1.  **Ticket Closed**: Uncomment `await ceaApi.updateCaseToClosed(...)` in `handleTicketClosed`.
2.  **Ticket Cancelled**: Uncomment `await ceaApi.updateCaseToCancelled(...)` in `handleTicketCancelled`.
3.  **Resolve OT**: Uncomment `await ceaApi.resolveOT(...)` in `handleResolveOT`.
4.  **Inform Visit**: Uncomment `await ceaApi.informarVisita(...)` in `handleInformarVisita`.
5.  **Invoice Change**: Uncomment `await ceaApi.cambiarTipoFacturaContrato(...)` in `handleInvoiceChange`.
6.  **Opportunity Ready**: Uncomment `await ceaApi.crearOrdenTrabajo(...)` in `handleOpportunityReady`.
7.  **Persona Update**: Uncomment `await ceaApi.cambiarPersonaNotificacionContrato(...)` in `handlePersonaUpdate`.

### B. Implement Missing Business Logic
Some functions require specific business logic mapping that depends on your data structure:

1.  **Opportunity Ready (`handleOpportunityReady`)**:
    -   **Map Fields**: The `workOrderData` object currently uses default values (e.g., `tipoOrden: 'INSPECCION'`, `codigoReparacion: ''`). You must implement logic to derive these values from the `opportunity` record.
    -   **Store Result**: Implement the TODO item: `// TODO: Update the opportunity with the result`. You should update the `opportunities` table with the returned Work Order ID (OT ID) to maintain a link.

2.  **Persona Update (`handlePersonaUpdate`)**:
    -   **Fetch Contract**: The `contrato` variable is currently set to `'?'`. You need to implement logic to retrieve the correct contract number associated with the person (e.g., query a `contracts` table or check `metadata`).
    -   **Validate Data**: Ensure `nif` and `email` are valid before calling the API.

3.  **Ticket Closed (`handleTicketClosed`)**:
    -   **Resolution Code**: The `code` is hardcoded to `'RESUELTO'`. If you have different closure codes, map them from `record.status` or `record.metadata`.
