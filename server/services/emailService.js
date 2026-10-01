import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resendKey = process.env.RESEND_API_KEY || '';
const resend = resendKey ? new Resend(resendKey) : null;
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'admin@synical.store';
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@synical.store';

// Directorio local para previsualizar correos si aún no hay clave de Resend
const OUTBOX_DIR = path.resolve(process.cwd(), 'server', 'emails_outbox');
try {
  if (!fs.existsSync(OUTBOX_DIR)) {
    fs.mkdirSync(OUTBOX_DIR, { recursive: true });
  }
} catch {}

/**
 * Genera el template HTML de lujo Cyber-Goth / Dark Archive para el recibo del cliente
 */
export function buildCustomerReceiptHtml(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #222630;">
        <td style="padding: 16px 8px; color: #ffffff; font-family: monospace; font-size: 13px;">
          <strong style="display: block; font-size: 14px; text-transform: uppercase;">${item.name || item.product_name}</strong>
          <span style="color: #94a3b8; font-size: 11px;">TALLA: ${item.size} • CANTIDAD: ${item.quantity}</span>
        </td>
        <td style="padding: 16px 8px; text-align: right; color: #38bdf8; font-family: monospace; font-size: 14px; font-weight: bold;">
          $${((item.price || item.unit_price) * item.quantity).toFixed(2)} USD
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SYNICAL™ // CONFIRMACIÓN DE PEDIDO ${order.orderNumber || order.order_number}</title>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #080a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f121a; border: 1px solid #262c3a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
    
    <!-- Header -->
    <div style="padding: 35px 30px 25px; border-bottom: 1px solid #1e2433; text-align: center; background: linear-gradient(180deg, #141824 0%, #0f121a 100%);">
      <h1 style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 38px; letter-spacing: 4px; font-weight: normal; color: #ffffff;">
        Synical
      </h1>
      <p style="margin: 8px 0 0; font-family: monospace; font-size: 11px; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase;">
        ATELIER ARCHIVE // FW26 ORDER SPECIFICATION
      </p>
    </div>

    <!-- Status Box -->
    <div style="padding: 25px 30px; background-color: rgba(56, 189, 248, 0.05); border-bottom: 1px solid #1e2433; text-align: center;">
      <span style="display: inline-block; padding: 6px 16px; border-radius: 50px; background-color: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-family: monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px;">
        ★ PAGO CONFIRMADO & EN COLA DE CONFECCIÓN
      </span>
      <h2 style="margin: 15px 0 5px; font-size: 20px; font-family: monospace; color: #ffffff;">
        PEDIDO #${order.orderNumber || order.order_number}
      </h2>
      <p style="margin: 0; font-size: 12px; color: #94a3b8; font-family: monospace;">
        Gracias por tu compra, <strong>${order.customer?.name || order.customer_name || 'Cliente'}</strong>. Tus piezas ya están reservadas.
      </p>
    </div>

    <!-- Order Items Table -->
    <div style="padding: 25px 30px;">
      <h3 style="margin: 0 0 15px; font-family: monospace; font-size: 12px; letter-spacing: 2px; color: #64748b; text-transform: uppercase;">
        RESUMEN DE PRENDAS
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
      </table>
    </div>

    <!-- Financial Breakdown -->
    <div style="padding: 0 30px 25px; border-bottom: 1px solid #1e2433;">
      <div style="padding: 20px; background-color: #0a0d14; border: 1px solid #1e2433; border-radius: 14px; font-family: monospace; font-size: 12px; line-height: 1.8;">
        <div style="display: flex; justify-content: space-between; color: #94a3b8;">
          <span>SUBTOTAL:</span>
          <span style="color: #ffffff;">$${Number(order.subtotal || 0).toFixed(2)} USD</span>
        </div>
        ${
          order.discountAmount > 0
            ? `
        <div style="display: flex; justify-content: space-between; color: #a855f7;">
          <span>DESCUENTO APLICADO:</span>
          <span>-$${Number(order.discountAmount).toFixed(2)} USD</span>
        </div>`
            : ''
        }
        <div style="display: flex; justify-content: space-between; color: #94a3b8;">
          <span>MÉTODO DE ENVÍO:</span>
          <span style="color: #ffffff;">${order.shippingMethod || 'Estándar'} ($${Number(order.shippingCost || 0).toFixed(2)} USD)</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: #ffffff; font-size: 15px; font-weight: bold; border-top: 1px solid #222630; margin-top: 10px; padding-top: 10px;">
          <span style="color: #38bdf8;">TOTAL PAGADO:</span>
          <span style="color: #38bdf8;">$${Number(order.total || 0).toFixed(2)} USD</span>
        </div>
      </div>
    </div>

    <!-- Shipping Address & Logistics -->
    <div style="padding: 25px 30px; font-family: monospace; font-size: 12px; color: #94a3b8; line-height: 1.6;">
      <h3 style="margin: 0 0 10px; font-size: 12px; letter-spacing: 2px; color: #64748b; text-transform: uppercase;">
        DIRECCIÓN DE ENTREGA
      </h3>
      <p style="margin: 0; color: #ffffff;">
        ${order.customer?.address || order.shipping_address || 'Dirección registrada'}<br>
        ${order.customer?.city || order.shipping_city || ''}, CP ${order.customer?.postalCode || order.shipping_postal || ''}<br>
        ${order.customer?.country || order.shipping_country || 'México'}
      </p>
    </div>

    <!-- Live Tracking Call to Action -->
    <div style="padding: 10px 30px 35px; text-align: center;">
      <a href="http://localhost:5173" style="display: inline-block; padding: 14px 28px; background-color: #38bdf8; color: #080a0f; text-decoration: none; font-family: monospace; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-radius: 12px; box-shadow: 0 8px 20px rgba(56, 189, 248, 0.3);">
        📦 RASTREAR PEDIDO EN VIVO
      </a>
      <p style="margin: 15px 0 0; font-size: 10px; font-family: monospace; color: #64748b;">
        Código de seguimiento: <strong>${order.orderNumber || order.order_number}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 20px; background-color: #07090d; border-top: 1px solid #1a1e28; text-align: center; font-family: monospace; font-size: 10px; color: #475569;">
      SYNICAL™ ARCHIVE • TOKYO / LOS ANGELES • TODOS LOS DERECHOS RESERVADOS<br>
      Este es un correo automático oficial de confirmación transaccional.
    </div>

  </div>

</body>
</html>
  `;
}

/**
 * Envía la confirmación al cliente y la alerta de venta al dueño
 */
export async function sendOrderEmails(order) {
  const customerEmail = order.customer?.email || order.customer_email;
  const orderNumber = order.orderNumber || order.order_number;
  const total = Number(order.total || 0).toFixed(2);

  const htmlContent = buildCustomerReceiptHtml(order);

  // 1. Si no hay API KEY de Resend configurada aún, guardar preview local para ver el correo
  if (!resend) {
    const previewFileName = `email_receipt_${orderNumber}_${Date.now()}.html`;
    const previewPath = path.join(OUTBOX_DIR, previewFileName);
    try {
      fs.writeFileSync(previewPath, htmlContent, 'utf-8');
      console.log(`[EMAIL SIMULADOR] 📧 Correo transaccional generado para: ${customerEmail}`);
      console.log(`[EMAIL PREVIEW] 📁 Puedes abrir el correo en tu navegador: file:///${previewPath.replace(/\\/g, '/')}`);
    } catch (e) {
      console.error('[EMAIL SIMULADOR] Error al escribir preview:', e);
    }
    return {
      success: true,
      mode: 'simulation',
      previewFile: previewPath,
      message: 'Correo simulado y guardado en outbox (agrega RESEND_API_KEY en .env para envío real al inbox)'
    };
  }

  // 2. Si Resend está activo, disparar correo real
  try {
    const { data: customerData, error: custErr } = await resend.emails.send({
      from: `SYNICAL™ <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `SYNICAL™ // CONFIRMACIÓN DE PEDIDO #${orderNumber}`,
      html: htmlContent
    });

    if (custErr) {
      console.error('[RESEND ERROR] Error al enviar al cliente:', custErr);
    } else {
      console.log(`[RESEND OK] Correo de recibo enviado al cliente (${customerEmail}):`, customerData.id);
    }

    // Alerta al dueño de la tienda
    if (OWNER_EMAIL) {
      await resend.emails.send({
        from: `SYNICAL NOTIFIER <${FROM_EMAIL}>`,
        to: OWNER_EMAIL,
        subject: `🚨 NUEVA VENTA REGISTRADA: #${orderNumber} ($${total} USD)`,
        html: `
          <div style="font-family: monospace; padding: 20px; background: #0f121a; color: white;">
            <h2 style="color: #38bdf8;">★ NUEVA VENTA CONFIRMADA</h2>
            <p><strong>Pedido:</strong> ${orderNumber}</p>
            <p><strong>Cliente:</strong> ${order.customer?.name || order.customer_name} (${customerEmail})</p>
            <p><strong>Total:</strong> $${total} USD</p>
            <p><strong>Artículos:</strong> ${order.items?.length || 1} prendas</p>
          </div>
        `
      });
      console.log(`[RESEND OK] Notificación enviada al dueño (${OWNER_EMAIL})`);
    }

    return { success: true, mode: 'production', id: customerData?.id };
  } catch (err) {
    console.error('[RESEND EXCEPTION]:', err);
    return { success: false, error: err.message };
  }
}
