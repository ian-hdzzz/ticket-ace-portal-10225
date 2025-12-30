import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import express from 'express';
import type { Request, Response } from 'express';

// Cargar variables de entorno
dotenv.config();

const router = express.Router();

// Validar que las credenciales de Gmail estén configuradas
const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_PASSWORD;

if (!gmailUser || !gmailPassword) {
  console.error('❌ GMAIL_USER o GMAIL_PASSWORD no están configuradas en .env');
  throw new Error('Gmail credentials are required');
}

console.log('✅ Gmail credentials encontradas');

// Crear transporter de Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPassword,
  },
});

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * POST /api/email/send
 * Envía un correo electrónico usando Resend
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text }: SendEmailRequest = req.body;

    // Validación básica
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan campos requeridos: to, subject, html' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email inválido' 
      });
    }

    console.log(`📧 Enviando correo a: ${to}`);
    console.log(`📝 Asunto: ${subject}`);

    // Enviar correo usando Nodemailer
    const mailOptions = {
      from: `"CEA Querétaro" <${gmailUser}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Convertir HTML a texto plano
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Correo enviado exitosamente:', info);

    res.json({ 
      success: true, 
      data: info,
      message: 'Correo enviado exitosamente'
    });
  } catch (error: any) {
    console.error('❌ Error al enviar correo:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al enviar correo',
      details: error
    });
  }
});

/**
 * GET /api/email/test
 * Endpoint de prueba para verificar que el servicio funciona
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const testEmail = req.query.email as string || 'test@example.com';
    
    const mailOptions = {
      from: `"CEA Querétaro" <${gmailUser}>`,
      to: testEmail,
      subject: 'Test Email - CEA Querétaro',
      html: `
        <h1>🎉 ¡Email de Prueba!</h1>
        <p>Si estás viendo esto, el servicio de correos está funcionando correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Email de prueba enviado',
      data: info 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/email/send-temp-password
 * Envía un correo con la contraseña temporal para un usuario nuevo
 */
router.post('/send-temp-password', async (req: Request, res: Response) => {
  try {
    const { email, name, tempPassword }: { email: string; name: string; tempPassword: string } = req.body;

    // Validación básica
    if (!email || !name || !tempPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan campos requeridos: email, name, tempPassword' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email inválido' 
      });
    }

    console.log(`📧 Enviando contraseña temporal a: ${email}`);
    console.log(`👤 Usuario: ${name}`);

    // Plantilla HTML para el correo de contraseña temporal
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido - CEA Querétaro</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2463EB 0%, #0CADE7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: 700;">
                ¡Bienvenido al Sistema!
              </h1>
              <p style="margin: 10px 0 0; color: #fff; font-size: 16px; opacity: 0.9;">
                CEA Querétaro - Portal de Tickets
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <p style="margin: 0 0 30px; color: #111827; font-size: 16px; line-height: 1.5;">
                Hola <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #111827; font-size: 16px; line-height: 1.5;">
                Se ha creado tu cuenta en el sistema de tickets de CEA Querétaro. A continuación encontrarás tus credenciales de acceso:
              </p>

              <!-- Credenciales Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #54b7ecff; border-radius: 8px; overflow: hidden; margin-bottom: 30px; border-left: 4px solid #F59E0B;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #000000ff; font-size: 16px; font-weight: 600; padding-bottom: 15px;">
                          Credenciales de Acceso
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #ffffffff; font-size: 14px; padding: 5px 0;">
                          Email:
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 16px; font-weight: 500; padding: 5px 0; font-family: monospace; background: #fff; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                          ${email}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #ffffffff; font-size: 14px; padding: 15px 0 5px 0;">
                          Contraseña Temporal:
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 16px; font-weight: 600; font-family: monospace; background: #fff; padding: 15px; border-radius: 4px; border: 2px solid #F59E0B; letter-spacing: 1px;">
                          ${tempPassword}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Instrucciones de Seguridad -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FEE2E2; border-radius: 8px; overflow: hidden; margin-bottom: 30px; border-left: 4px solid #DC2626;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #000000ff; font-size: 16px; font-weight: 600; padding-bottom: 10px;">
                          ⚠️ Importante - Seguridad
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 14px; line-height: 1.6;">
                          <ul style="margin: 0; padding-left: 20px;">
                            <li>Esta es una <strong>contraseña temporal</strong></li>
                            <li>Debes cambiarla al iniciar sesión por primera vez</li>
                            <li>No compartas estas credenciales con nadie</li>
                            <li>Si tienes problemas para acceder, contacta al administrador</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app" 
                       style="display: inline-block; padding: 16px 40px; background: #2463EB; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Iniciar Sesión
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5; font-style: italic; text-align: center;">
                Si tienes alguna duda o problema, contacta al administrador del sistema.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #111827; padding: 30px; text-align: center; border-top: 1px solid #0CADE7;">
              <p style="margin: 0 0 10px; color: #fff; font-size: 14px;">
                CEA Querétaro - Sistema de Tickets
              </p>
              <p style="margin: 0; color: #0CADE7; font-size: 12px;">
                Este correo contiene información confidencial. No lo reenvíes.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Texto plano como fallback
    const text = `
¡Bienvenido al Sistema de Tickets - CEA Querétaro!

Hola ${name},

Se ha creado tu cuenta en el sistema. Aquí están tus credenciales:

Email: ${email}
Contraseña Temporal: ${tempPassword}

IMPORTANTE:
- Esta es una contraseña temporal
- Debes cambiarla al iniciar sesión por primera vez
- No compartas estas credenciales con nadie

Enlace de acceso: ${process.env.VITE_FRONTEND_URL || 'https://chatwoot-cea-app.xyz'}/login

---
CEA Querétaro - Sistema de Tickets
    `;

    // Enviar correo usando Nodemailer
    const mailOptions = {
      from: `"CEA Querétaro" <${gmailUser}>`,
      to: email,
      subject: ' Credenciales de Acceso - Sistema CEA Querétaro',
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Correo con contraseña enviado exitosamente:', info);

    res.json({ 
      success: true, 
      data: info,
      message: 'Credenciales enviadas por correo exitosamente'
    });
  } catch (error: any) {
    console.error('❌ Error al enviar correo con contraseña:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al enviar credenciales por correo',
      details: error
    });
  }
});

/**
 * POST /api/email/webhook/ticket-created
 * Webhook para ser llamado por Supabase cuando se crea un nuevo ticket
 * Este endpoint recibe datos del trigger de Supabase
 */
router.post('/webhook/ticket-created', async (req: Request, res: Response) => {
  try {
    console.log('🔔 Webhook recibido - Nuevo ticket creado');
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));

    const { record, user_email, user_name, customer_email, customer_name } = req.body;
    
    // Validar que vengan los datos necesarios
    if (!record) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se recibió información del ticket' 
      });
    }

    // 🏷️ FILTRO: Solo enviar email si el ticket tiene el tag "necesita_agente"
    const tags = record.tags || [];
    
    // 🔍 LOGS DETALLADOS DE DEBUGGING
    console.log('🔍 === DEBUGGING TAGS ===');
    console.log(`   tags raw:`, tags);
    console.log(`   tags type:`, typeof tags);
    console.log(`   tags is array:`, Array.isArray(tags));
    console.log(`   tags length:`, Array.isArray(tags) ? tags.length : 'N/A');
    console.log(`   tags JSON:`, JSON.stringify(tags));
    
    // Verificar si tiene el tag (mejorado para manejar diferentes formatos)
    let needsAgent = false;
    
    if (Array.isArray(tags)) {
      // Si es array, buscar "necesita_agente" en el array
      needsAgent = tags.includes('necesita_agente');
      console.log(`   🔍 Buscando en array:`, tags);
      console.log(`   🔍 Resultado includes:`, needsAgent);
    } else if (typeof tags === 'string') {
      // Si es string, verificar si contiene el tag
      needsAgent = tags === 'necesita_agente' || tags.includes('necesita_agente');
      console.log(`   🔍 Tag es string:`, tags);
      console.log(`   🔍 Resultado match:`, needsAgent);
    } else if (tags && typeof tags === 'object') {
      // Si es objeto, intentar diferentes formatos
      console.log(`   🔍 Tag es objeto:`, tags);
      needsAgent = false;
    }
    
    console.log(`   ✅ needsAgent final:`, needsAgent);
    console.log('========================');

    if (!needsAgent) {
      console.log('⏭️  Ticket sin tag "necesita_agente" - NO se enviará email');
      console.log(`   Tags recibidos: ${JSON.stringify(tags)}`);
      console.log(`   Tipo de tags: ${typeof tags}`);
      console.log(`   Es array: ${Array.isArray(tags)}`);
      return res.json({ 
        success: true, 
        message: 'Ticket recibido pero no requiere notificación (sin tag necesita_agente)',
        skipped: true,
        debug: {
          tags: tags,
          tagsType: typeof tags,
          isArray: Array.isArray(tags)
        }
      });
    }

    console.log('✅ Ticket tiene tag "necesita_agente" - Procesando email...');

    // Si no viene el email del usuario, no podemos enviar correo
    if (!user_email) {
      console.log('⚠️ No se proporcionó email del usuario, no se enviará correo');
      return res.json({ 
        success: true, 
        message: 'Ticket recibido pero sin email para notificar'
      });
    }

    // 🔥 MODO: Determinar email destino
    // En desarrollo, Resend solo permite enviar a tu email verificado
    // En producción, envía al email del usuario
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const devEmail = process.env.DEV_EMAIL || 'ianhdez2020@gmail.com'; // Tu email verificado desde .env
    
    let toEmail: string;
    let emailMode: string;
    
    if (isDevelopment) {
      // MODO DESARROLLO: Enviar a tu email pero mostrar el original
      toEmail = devEmail;
      emailMode = 'DESARROLLO';
      console.log(`📧 [${emailMode}] Email se enviará a: ${toEmail}`);
      console.log(`👤 Email original del ticket: ${user_email}`);
      console.log(`ℹ️  En producción se enviará a: ${user_email}`);
    } else {
      // MODO PRODUCCIÓN: Enviar al usuario real
      toEmail = user_email;
      emailMode = 'PRODUCCIÓN';
      console.log(`📧 [${emailMode}] Email se enviará a: ${toEmail}`);
    }


    // Mapear prioridades para el email
    const priorityMap: Record<string, string> = {
      'low': 'Baja',
      'baja': 'Baja',
      'medium': 'Media',
      'media': 'Media',
      'high': 'Alta',
      'alta': 'Alta',
      'urgent': 'Urgente',
      'urgente': 'Urgente'
    };

    // Mapear estados para el email
    const statusMap: Record<string, string> = {
      'open': 'Abierto',
      'abierto': 'Abierto',
      'in_progress': 'En Proceso',
      'en_proceso': 'En Proceso',
      'resolved': 'Resuelto',
      'resuelto': 'Resuelto',
      'closed': 'Cerrado',
      'cerrado': 'Cerrado'
    };

    // Mapear canales para el email
    const channelMap: Record<string, string> = {
      'telefono': 'Teléfono',
      'phone': 'Teléfono',
      'email': 'Email',
      'app': 'Aplicación',
      'presencial': 'Presencial',
      'web': 'Web'
    };

    // Extraer datos del ticket (SIN valores por defecto hardcodeados)
    const ticketNumber = record.folio || `TKT-${record.id}`;
    const description = record.descripcion || record.titulo || 'Sin descripción';
    const priority = priorityMap[record.priority] || record.priority || 'No especificada';
    const status = statusMap[record.status] || record.status || 'No especificado';
    const channel = channelMap[record.channel] || record.channel || 'No especificado';
    
    // Formatear fecha (viene del trigger de Supabase)
    let createdAt: string;
    try {
      const date = new Date(record.created_at);
      createdAt = date.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      createdAt = new Date().toLocaleString('es-MX');
    }

    console.log('📬 Preparando email con datos del ticket:');
    console.log(`   - Destinatario: ${toEmail} (${user_name || 'Sin nombre'})`);
    console.log(`   - Folio: ${ticketNumber}`);
    console.log(`   - Prioridad: ${priority}`);
    console.log(`   - Estado: ${status}`);
    console.log(`   - Canal: ${channel}`);
    console.log(`   - Fecha: ${createdAt}`);

    // Colores según prioridad (usando paleta de colores corporativa)
    const priorityColors: Record<string, { bg: string; text: string }> = {
      'Urgente': { bg: '#fa0000ff', text: '#fff' },    // Azul principal
      'Alta': { bg: '#e7460cff', text: '#fff' },       // Azul claro
      'Media': { bg: '#ffd000ff', text: '#fff' },      // Gris oscuro
      'Baja': { bg: '#17c72bff', text: '#111827' }     // Azul claro con texto oscuro
    };

    const priorityColor = priorityColors[priority] || { bg: '#2463EB', text: '#fff' };

    // Plantilla HTML del correo PARA ASESORES
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title> Se Requiere Asesor </title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2463EB 0%, #0CADE7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: 700;">
                  Usuario Requiere Atención
              </h1>
              <p style="margin: 10px 0 0; color: #fff; font-size: 16px; opacity: 0.9;">
                Ticket #${ticketNumber}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <p style="margin: 0 0 30px; color: #111827; font-size: 16px; line-height: 1.5;">
                Se ha creado un nuevo ticket que requiere tu atención. Por favor revisa los detalles y contacta al cliente a la brevedad:
              </p>

              ${customer_email || customer_name ? `
              <!-- Info del Cliente -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #EFF6FF; border-radius: 8px; overflow: hidden; margin-bottom: 20px; border-left: 4px solid #2463EB;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #1E40AF; font-size: 14px; font-weight: 600; padding-bottom: 10px;">
                          👤 Información del Cliente
                        </td>
                      </tr>
                      ${customer_name ? `
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding: 3px 0;">
                          Nombre:
                        </td>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 3px 0; text-align: right;">
                          ${customer_name}
                        </td>
                      </tr>
                      ` : ''}
                      ${customer_email ? `
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding: 3px 0;">
                          Email:
                        </td>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 3px 0; text-align: right;">
                          ${customer_email}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Ticket Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    
                    <!-- Número de Ticket -->
                    <table role="presentation" style="width: 100%; margin-bottom: 15px;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 5px;">
                          Número de Ticket
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 18px; font-weight: 600;">
                          ${ticketNumber}
                        </td>
                      </tr>
                    </table>

                    <!-- Descripción del Problema -->
                    <table role="presentation" style="width: 100%; margin-bottom: 15px; background-color: #FEF3C7; padding: 15px; border-radius: 6px; border-left: 4px solid #F59E0B;">
                      <tr>
                        <td style="color: #92400E; font-size: 14px; font-weight: 600; padding-bottom: 8px;">
                           Asunto
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 16px; line-height: 1.6;">
                          ${description}
                        </td>
                      </tr>
                    </table>

                    <!-- Prioridad -->
                    <table role="presentation" style="width: 100%; margin-bottom: 15px;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 5px;">
                           Prioridad
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="display: inline-block; padding: 6px 12px; background-color: ${priorityColor.bg}; color: ${priorityColor.text}; border-radius: 4px; font-size: 14px; font-weight: 600;">
                            ${priority}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Estado -->
                    <table role="presentation" style="width: 100%; margin-bottom: 15px;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 5px;">
                          Estado
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 16px;">
                          ${status}
                        </td>
                      </tr>
                    </table>

                    <!-- Canal -->
                    <table role="presentation" style="width: 100%; margin-bottom: 15px;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 5px;">
                           Canal de Contacto
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 16px;">
                          ${channel}
                        </td>
                      </tr>
                    </table>

                    <!-- Fecha -->
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 5px;">
                           Fecha de Creación
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 16px;">
                          ${createdAt}
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td style="text-align: center;">
                    <!-- Botón Ver Ticket -->
                    <a href="https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app/" 
                       style="display: inline-block; padding: 14px 32px; background: #2463EB; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 5px 10px 5px;">
                      Atender Ticket
                    </a>
                    
                    <!-- Botón Ver Conversación -->
                    <a href="https://chatwoot.fitcluv.com/app/accounts/3/conversations/46" 
                       style="display: inline-block; padding: 14px 32px; background: #0CADE7; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 5px 10px 5px;">
                      Abrir Chat
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5; font-style: italic; text-align: center;">
                 Por favor atiende este ticket lo antes posible según su nivel de prioridad.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #111827; padding: 30px; text-align: center; border-top: 1px solid #0CADE7;">
              <p style="margin: 0 0 10px; color: #fff; font-size: 14px;">
                CEA Querétaro - Sistema de Tickets
              </p>
              <p style="margin: 0; color: #0CADE7; font-size: 12px;">
                Este es un correo automático de notificación de tickets.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Texto plano como fallback
    const text = `
 Requiere Asesor - Ticket  - ${ticketNumber}

Hola ${user_name || 'Asesor'},

Se ha creado un nuevo ticket que requiere tu atención:

📋 Problema del Cliente:
${description}

📊 Detalles del Ticket:
• Número: ${ticketNumber}
• Prioridad: ${priority}
• Estado: ${status}
• Canal: ${channel}
• Fecha: ${createdAt}

Por favor accede al sistema para atender este ticket.

Enlaces rápidos:
 Ver Ticket: https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app/
 Chat: https://chatwoot.fitcluv.com

---
CEA Querétaro - Sistema de Notificaciones de Tickets
    `;

    console.log('📤 Intentando enviar email...');
    console.log(`   - From: CEA Querétaro <${gmailUser}>`);
    console.log(`   - To: ${toEmail}`);
    console.log(`   - Subject: 🚨 Nuevo Ticket Asignado #${ticketNumber} - Prioridad: ${priority}`);
    
    const mailOptions = {
      from: `"CEA Querétaro" <${gmailUser}>`,
      to: toEmail,
      subject: ` Requiere Asesor - Ticket #${ticketNumber} - Prioridad: ${priority}`,
      html,
      text,
    };

    const emailData = await transporter.sendMail(mailOptions);

    console.log('✅ Correo enviado exitosamente');
    console.log(`   - Message ID: ${emailData.messageId}`);
    console.log(`   - Enviado a: ${toEmail}`);
    console.log(`   - Respuesta completa de Nodemailer:`, JSON.stringify(emailData, null, 2));
    
    if (isDevelopment && user_email !== toEmail) {
      console.log(`   - ⚠️ MODO DEV: En producción se enviará a ${user_email}`);
    }

    res.json({ 
      success: true, 
      message: 'Correo enviado exitosamente',
      data: emailData,
      emailInfo: {
        sentTo: toEmail,
        originalEmail: user_email,
        mode: emailMode,
        ticketNumber: ticketNumber,
        messageId: emailData.messageId
      }
    });

  } catch (error: any) {
    console.error('❌ Error en webhook:', error);
    
    // Responder con 200 para que Supabase no reintente
    res.status(200).json({ 
      success: false, 
      error: error.message,
      message: 'Error procesado, no se reenviará'
    });
  }
});

export default router;
