# 📧 Configuración de Envío de Correos Electrónicos

## Descripción

El sistema ahora envía correos electrónicos automáticos cuando se crea un nuevo ticket. El correo se envía al usuario que está logueado en el sistema.

## ✨ Características Implementadas

1. **Notificación automática por correo** al crear un ticket
2. **Template HTML profesional** con información completa del ticket
3. **Fallback a cola de correos** si el servicio principal falla
4. **Toast notifications** para informar al usuario sobre el estado del envío

## 🛠️ Archivos Modificados/Creados

### Nuevos Archivos:
- `/src/lib/emailService.ts` - Servicio de envío de correos

### Archivos Modificados:
- `/src/pages/Tickets.tsx` - Integración de envío de correo al crear ticket

## 📋 Configuración Requerida

Para que el envío de correos funcione, necesitas configurar **Supabase Edge Functions** o una alternativa.

### Opción 1: Supabase Edge Functions (Recomendado)

#### 1. Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

#### 2. Inicializar Supabase en tu proyecto

```bash
cd Backend  # O donde esté tu backend
supabase init
```

#### 3. Crear Edge Function para envío de correos

```bash
supabase functions new send-email
```

#### 4. Configurar la Edge Function

Edita el archivo `supabase/functions/send-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  to: string
  subject: string
  html: string
  text?: string
}

serve(async (req) => {
  try {
    const { to, subject, html, text }: EmailRequest = await req.json()

    // Usar Resend.com para enviar correos
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEA Querétaro <noreply@tudominio.com>',
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Error al enviar correo')
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

#### 5. Configurar secretos en Supabase

```bash
# Obtén tu API key de Resend.com (https://resend.com)
supabase secrets set RESEND_API_KEY=tu_api_key_aqui
```

#### 6. Desplegar la función

```bash
supabase functions deploy send-email
```

### Opción 2: Usar Resend.com Directamente (Más Simple)

Si prefieres no usar Edge Functions, puedes crear un endpoint simple en tu backend:

#### 1. Instalar Resend en tu backend

```bash
cd Backend
npm install resend
# o
yarn add resend
# o
bun add resend
```

#### 2. Crear endpoint en tu backend (Express/Node)

```typescript
// Backend/src/routes/email.ts
import { Resend } from 'resend';
import express from 'express';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    const data = await resend.emails.send({
      from: 'CEA Querétaro <noreply@tudominio.com>',
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
```

#### 3. Modificar emailService.ts para usar tu backend

```typescript
// En /src/lib/emailService.ts, reemplaza la función sendEmail:

export const sendEmail = async ({ to, subject, html, text }: SendEmailParams): Promise<boolean> => {
  try {
    const response = await fetch('http://tu-backend.com/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html, text }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error al enviar correo');
    }

    console.log('✅ Correo enviado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return false;
  }
};
```

### Opción 3: Cola de Correos (Fallback Automático)

Si no configuras ninguna de las opciones anteriores, el sistema automáticamente guardará los correos en una tabla `email_queue` para procesamiento posterior.

#### 1. Crear tabla en Supabase

```sql
-- Ejecuta esto en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS email_queue (
  id BIGSERIAL PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

-- Índice para consultas eficientes
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at DESC);
```

#### 2. Crear job para procesar cola (opcional)

Puedes crear un cron job o worker que procese los correos pendientes:

```typescript
// Script para procesar correos pendientes
const processEmailQueue = async () => {
  const { data: pendingEmails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(10);

  for (const email of pendingEmails || []) {
    try {
      // Enviar correo usando tu servicio preferido
      await sendEmailViaResend(email);
      
      // Marcar como enviado
      await supabase
        .from('email_queue')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', email.id);
    } catch (error) {
      // Marcar como error
      await supabase
        .from('email_queue')
        .update({ 
          status: 'error', 
          error_message: error.message 
        })
        .eq('id', email.id);
    }
  }
};
```

## 🎨 Plantilla de Correo

La plantilla incluye:
- ✅ Header con gradiente profesional
- ✅ Información completa del ticket
- ✅ Badges de prioridad con colores
- ✅ Botón para ver el ticket en el sistema
- ✅ Footer con información de la empresa
- ✅ Diseño responsive

## 🔧 Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Para Resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Dominio verificado en Resend
EMAIL_FROM_ADDRESS=noreply@tudominio.com
EMAIL_FROM_NAME="CEA Querétaro"

# URL del backend (si usas opción 2)
VITE_BACKEND_URL=http://localhost:3000
```

## 📧 Servicios de Correo Recomendados

1. **Resend.com** (Recomendado)
   - ✅ 3,000 correos gratis/mes
   - ✅ Fácil configuración
   - ✅ Excelente deliverability
   - 🔗 [resend.com](https://resend.com)

2. **SendGrid**
   - ✅ 100 correos gratis/día
   - ✅ Robusto y confiable
   - 🔗 [sendgrid.com](https://sendgrid.com)

3. **Mailgun**
   - ✅ 5,000 correos gratis/mes (primeros 3 meses)
   - 🔗 [mailgun.com](https://mailgun.com)

## 🧪 Pruebas

Para probar el envío de correos:

1. Asegúrate de que el usuario logueado tenga un email en la base de datos
2. Crea un nuevo ticket
3. Verifica que aparezcan los toasts de confirmación
4. Revisa tu bandeja de entrada

## 🐛 Troubleshooting

### El correo no se envía

1. **Verifica las variables de entorno:**
   ```bash
   supabase secrets list
   ```

2. **Revisa los logs de la Edge Function:**
   ```bash
   supabase functions logs send-email
   ```

3. **Verifica la tabla email_queue:**
   ```sql
   SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 10;
   ```

### CORS errors

Si obtienes errores de CORS, asegúrate de configurar correctamente los headers en tu Edge Function o backend.

## 📝 Notas Importantes

- Los correos solo se envían si el usuario tiene un email registrado
- El sistema muestra toasts informativos sobre el estado del envío
- Si falla el envío, el ticket se crea de todas formas
- Los correos se guardan en cola como fallback automático

## 🚀 Próximas Mejoras

- [ ] Plantillas personalizables por tipo de ticket
- [ ] Envío de correos al asignar/actualizar tickets
- [ ] Notificaciones por WhatsApp/SMS
- [ ] Dashboard para monitorear correos enviados
- [ ] Programación de envío de reportes periódicos
