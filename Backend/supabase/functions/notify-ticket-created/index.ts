// ============================================
// SUPABASE EDGE FUNCTION - Envío Automático de Emails
// ============================================
// Esta función se ejecuta automáticamente cuando se crea un ticket
// y envía un correo de notificación al usuario

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const BACKEND_URL = Deno.env.get('BACKEND_URL') || 'http://localhost:3000'

serve(async (req) => {
  try {
    // Parsear el body de la petición
    const { record, type, table } = await req.json()

    console.log('📬 Webhook recibido:', { type, table })
    console.log('📦 Datos del ticket:', record)

    // Solo procesar inserciones en la tabla tickets
    if (type !== 'INSERT' || table !== 'tickets') {
      return new Response(
        JSON.stringify({ message: 'Evento ignorado' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obtener el email del usuario
    let userEmail = null
    let userName = null

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Intentar obtener el email del usuario creador
    if (record.created_by) {
      const { data: user } = await supabase.auth.admin.getUserById(record.created_by)
      if (user) {
        userEmail = user.email
        userName = user.user_metadata?.full_name || user.email
      }
    }

    // Si no hay email, buscar en la tabla de customers
    if (!userEmail && record.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('email, name')
        .eq('id', record.customer_id)
        .single()
      
      if (customer) {
        userEmail = customer.email
        userName = customer.name || customer.email
      }
    }

    // Si no se encontró email, salir
    if (!userEmail) {
      console.log('⚠️ No se encontró email para este ticket')
      return new Response(
        JSON.stringify({ message: 'No email found for user' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('📧 Enviando correo a:', userEmail)

    // Llamar al webhook del backend
    const webhookResponse = await fetch(`${BACKEND_URL}/api/email/webhook/ticket-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        record,
        user_email: userEmail,
        user_name: userName,
      }),
    })

    const result = await webhookResponse.json()
    console.log('✅ Respuesta del webhook:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent',
        email: userEmail 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/* 
INSTRUCCIONES DE DEPLOYMENT:

1. Instalar Supabase CLI:
   npm install -g supabase

2. Login en Supabase:
   supabase login

3. Link al proyecto:
   supabase link --project-ref tu-project-ref

4. Deploy la función:
   supabase functions deploy notify-ticket-created

5. Configurar variables de entorno en Supabase Dashboard:
   - RESEND_API_KEY=re_TyjkPw4w_NGVowLV2Z6Tqnr1sguM31ihE
   - BACKEND_URL=https://tu-backend.com (o http://localhost:3000 para dev)

6. Crear el Database Webhook en Supabase Dashboard:
   - Ve a Database → Webhooks
   - Create a new webhook
   - Name: notify-ticket-created
   - Table: tickets
   - Events: INSERT
   - Type: Supabase Edge Functions
   - Edge Function: notify-ticket-created

7. Probar insertando un ticket:
   INSERT INTO tickets (descripcion, priority, status, channel, created_by)
   VALUES ('Test email', 'media', 'abierto', 'web', 'user-id-here');
*/
