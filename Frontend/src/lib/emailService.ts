/**
 * Servicio de envío de correos electrónicos
 * Utiliza Supabase Edge Functions o servicios de terceros
 */

import { supabase } from '@/supabase/client';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface TicketCreatedEmailParams {
  recipientEmail: string;
  recipientName: string;
  ticketNumber: string;
  ticketDescription: string;
  ticketPriority: string;
  ticketStatus: string;
  ticketChannel: string;
}

/**
 * Envía un correo electrónico usando el backend con Resend
 */
export const sendEmail = async ({ to, subject, html, text }: SendEmailParams): Promise<boolean> => {
  try {
    // Usar el backend de Express con Resend
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    const response = await fetch(`${backendUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        to, 
        subject, 
        html, 
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error al enviar correo');
    }

    console.log('✅ Correo enviado exitosamente:', data);
    return true;
  } catch (error: any) {
    console.error('❌ Error al enviar correo:', error);
    
    // Fallback: Registrar en base de datos para envío posterior
    try {
      await supabase.from('email_queue').insert({
        recipient_email: to,
        subject,
        html_content: html,
        text_content: text || html.replace(/<[^>]*>/g, ''),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      console.log('📧 Correo agregado a cola de envío');
      return true;
    } catch (queueError) {
      console.error('Error al agregar correo a cola:', queueError);
      return false;
    }
  }
};

/**
 * Envía un correo de notificación cuando se crea un nuevo ticket
 */
export const sendTicketCreatedEmail = async ({
  recipientEmail,
  recipientName,
  ticketNumber,
  ticketDescription,
  ticketPriority,
  ticketStatus,
  ticketChannel,
}: TicketCreatedEmailParams): Promise<boolean> => {
  const subject = `Nuevo Ticket Creado: ${ticketNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .ticket-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .info-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
          color: #6b7280;
        }
        .info-value {
          flex: 1;
          color: #111827;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-priority-urgente {
          background: #fef2f2;
          color: #dc2626;
        }
        .badge-priority-alta {
          background: #fff7ed;
          color: #ea580c;
        }
        .badge-priority-media {
          background: #fef9c3;
          color: #ca8a04;
        }
        .badge-priority-baja {
          background: #f0fdf4;
          color: #16a34a;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Nuevo Ticket Creado</h1>
      </div>
      <div class="content">
        <p>Hola <strong>${recipientName}</strong>,</p>
        <p>Se ha creado un nuevo ticket en el sistema CEA Querétaro. A continuación, los detalles:</p>
        
        <div class="ticket-info">
          <div class="info-row">
            <span class="info-label">Número de Ticket:</span>
            <span class="info-value"><strong>${ticketNumber}</strong></span>
          </div>
          <div class="info-row">
            <span class="info-label">Descripción:</span>
            <span class="info-value">${ticketDescription}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Prioridad:</span>
            <span class="info-value">
              <span class="badge badge-priority-${ticketPriority.toLowerCase()}">${ticketPriority}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Estado:</span>
            <span class="info-value">${ticketStatus}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Canal:</span>
            <span class="info-value">${ticketChannel}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha de Creación:</span>
            <span class="info-value">${new Date().toLocaleString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>

        <center>
          <a href="${window.location.origin}/dashboard/tickets" class="btn">
            Ver Ticket en el Sistema
          </a>
        </center>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Este correo es una notificación automática del sistema de gestión de tickets de CEA Querétaro.
        </p>
      </div>
      <div class="footer">
        <p>CEA Querétaro - Sistema de Gestión de Tickets</p>
        <p>© ${new Date().getFullYear()} Todos los derechos reservados</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hola ${recipientName},

Se ha creado un nuevo ticket en el sistema CEA Querétaro.

Detalles del Ticket:
- Número: ${ticketNumber}
- Descripción: ${ticketDescription}
- Prioridad: ${ticketPriority}
- Estado: ${ticketStatus}
- Canal: ${ticketChannel}
- Fecha: ${new Date().toLocaleString('es-MX')}

Accede al sistema para ver más detalles: ${window.location.origin}/dashboard/tickets

---
CEA Querétaro - Sistema de Gestión de Tickets
  `;

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
  });
};
