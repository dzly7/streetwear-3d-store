import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderEmails } from './services/emailService.js';
import { getAllOrders, getOrderByNumber, saveOrder, updateOrderStatus } from './data/ordersStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. INICIALIZAR STRIPE
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// 2. INICIALIZAR SUPABASE SERVER (con Service Role Key para operaciones protegidas)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// 3. MIDDLEWARE
// Importante: El webhook de Stripe requiere el body en formato RAW (Buffer) para verificar la firma criptográfica
app.post(
  '/api/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (!stripe || !webhookSecret) {
      console.warn('[STRIPE WEBHOOK] Webhook llamado pero no configurado STRIPE_WEBHOOK_SECRET');
      return res.status(400).send('Webhook Secret no configurado');
    }

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[STRIPE WEBHOOK] Error de verificación de firma:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Procesar evento de compra exitosa
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`[STRIPE WEBHOOK] ★ Pago confirmado para la sesión: ${session.id}`);

      try {
        const metadata = session.metadata || {};
        const orderNumber = metadata.order_number;
        const items = JSON.parse(metadata.items_json || '[]');
        const customer = JSON.parse(metadata.customer_json || '{}');

        if (supabase && orderNumber) {
          // 1. Insertar orden en Supabase
          const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .insert({
              order_number: orderNumber,
              customer_email: session.customer_details?.email || customer.email || '',
              customer_name: session.customer_details?.name || customer.name || '',
              shipping_address: customer.address || '',
              shipping_city: customer.city || '',
              shipping_postal: customer.postalCode || '',
              shipping_country: customer.country || 'México',
              shipping_method: metadata.shipping_method || 'standard',
              shipping_cost: Number(metadata.shipping_cost || 0),
              subtotal: Number(metadata.subtotal || 0),
              discount_amount: Number(metadata.discount_amount || 0),
              applied_discount_code: metadata.discount_code || null,
              total: session.amount_total / 100, // Stripe almacena en centavos
              currency: (session.currency || 'usd').toUpperCase(),
              payment_method: 'stripe',
              payment_status: 'paid',
              fulfillment_status: 'processing',
              stripe_session_id: session.id,
              stripe_payment_intent: String(session.payment_intent || '')
            })
            .select()
            .single();

          if (orderErr) {
            console.error('[STRIPE WEBHOOK] Error al guardar orden en DB:', orderErr);
          } else if (orderData) {
            // 2. Insertar cada prenda en order_items
            const orderItemsPayload = items.map((item) => ({
              order_id: orderData.id,
              product_id: item.id,
              product_name: item.name,
              size: item.size,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity
            }));

            await supabase.from('order_items').insert(orderItemsPayload);

            // 3. Ejecutar función atómica para descontar stock en Postgres
            await supabase.rpc('process_order_paid', { p_order_id: orderData.id });
            console.log(`[STRIPE DB] Orden ${orderNumber} e inventario sincronizados al 100%!`);

            // 4. Enviar correos de confirmación
            await sendOrderEmails({
              orderNumber,
              customer,
              items,
              total: session.amount_total / 100,
              subtotal: Number(metadata.subtotal || 0),
              shippingCost: Number(metadata.shipping_cost || 0),
              shippingMethod: metadata.shipping_method || 'standard',
              discountAmount: Number(metadata.discount_amount || 0)
            });
          }
        }
      } catch (procErr) {
        console.error('[STRIPE WEBHOOK] Error en procesamiento de orden:', procErr);
      }
    }

    res.json({ received: true });
  }
);

// Body parser normal para las demás rutas
app.use(express.json());
app.use(cors({ origin: CLIENT_URL }));

// ==============================================================================
// 4. RUTAS DE LA API
// ==============================================================================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'SYNICAL API GATEWAY // V1.0',
    stripeConfigured: Boolean(stripe),
    supabaseConfigured: Boolean(supabase),
    clientUrl: CLIENT_URL
  });
});

/**
 * Crear sesión de Checkout en Stripe
 */
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, customer, shippingMethod, discount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'La bolsa de compra está vacía' });
    }

    const orderNumber = `SYN-${Math.floor(100000 + Math.random() * 900000)}`;
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = discount?.percent ? (subtotal * discount.percent) / 100 : 0;
    const shippingCost = shippingMethod === 'express' ? 15.0 : 0.0;

    // Si Stripe no está configurado (modo simulación / test), devolver respuesta mock
    if (!stripe) {
      console.log(`[API MOCK] Stripe no configurado. Simulando sesión para orden ${orderNumber}`);
      const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);
      const simulatedOrder = {
        orderNumber,
        date: new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }),
        createdAt: new Date().toISOString(),
        customer: customer || {},
        items: items || [],
        subtotal,
        discountAmount,
        appliedDiscount: discount || null,
        shippingCost,
        shippingMethod: shippingMethod === 'express' ? 'Envío Express 24-48h' : 'Envío Estándar Asegurado (Gratis)',
        total: finalTotal,
        paymentStatus: 'paid',
        paymentMethod: 'Tarjeta de Prueba (Simulador)',
        fulfillment_status: 'processing',
        status: 'processing',
        trackingCarrier: 'Pendiente de Guía',
        trackingNumber: '',
        internalNotes: 'Pedido generado mediante simulador de pasarela local.'
      };
      saveOrder(simulatedOrder);

      return res.json({
        mock: true,
        orderNumber,
        message: 'Modo Simulación: Agrega STRIPE_SECRET_KEY en tu .env para pagos con tarjeta reales.',
        total: finalTotal
      });
    }

    // Construir line_items para Stripe
    const line_items = items.map((item) => {
      // Ajustar precio unitario si hay descuento aplicado
      const unitMultiplier = discount?.percent ? (1 - discount.percent / 100) : 1;
      const finalUnitPrice = Math.round(item.price * unitMultiplier * 100); // Stripe usa centavos

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `SYNICAL™ // ${item.name}`,
            description: `Talla: ${item.size} • Confección Heavyweight Fleece • Archivo Oficial`,
            images: item.image && item.image.startsWith('http') ? [item.image] : []
          },
          unit_amount: finalUnitPrice
        },
        quantity: item.quantity
      };
    });

    // Agregar costo de envío si aplica
    if (shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Envío Express Prioritario 24-48h',
            description: 'Entrega asegurada con seguimiento prioritario DHL / FedEx'
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }

    // Crear sesión oficial en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customer?.email || undefined,
      success_url: `${CLIENT_URL}/?order_success=true&session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`,
      cancel_url: `${CLIENT_URL}/?order_cancelled=true`,
      metadata: {
        order_number: orderNumber,
        shipping_method: shippingMethod || 'standard',
        shipping_cost: String(shippingCost),
        subtotal: String(subtotal),
        discount_amount: String(discountAmount),
        discount_code: discount?.code || '',
        items_json: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, size: i.size, quantity: i.quantity, price: i.price }))),
        customer_json: JSON.stringify(customer || {})
      }
    });

    res.json({
      url: session.url,
      sessionId: session.id,
      orderNumber
    });
  } catch (err) {
    console.error('[API STRIPE] Error al generar sesión:', err);
    res.status(500).json({ error: err.message || 'Error interno al procesar el pago' });
  }
});

/**
 * Consultar estatus de orden y rastreo (Soporta Supabase y Fallback Local)
 */
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const cleanNum = (orderNumber || '').trim().toUpperCase();

    // 1. Intentar buscar en Supabase si está disponible
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('order_number', cleanNum)
          .single();

        if (data && !error) {
          return res.json(data);
        }
      } catch (sbErr) {
        console.warn('[API ORDERS] Supabase falló, buscando en almacén local:', sbErr.message);
      }
    }

    // 2. Buscar en almacén de persistencia local
    const localOrder = getOrderByNumber(cleanNum);
    if (localOrder) {
      return res.json(localOrder);
    }

    return res.status(404).json({ error: `Orden ${cleanNum} no encontrada` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ==============================================================================
 * RUTAS DE ADMINISTRACIÓN (BACKOFFICE ATELIER)
 * ==============================================================================
 */

/**
 * Obtener todos los pedidos para el panel de administración
 */
app.get('/api/admin/orders', async (req, res) => {
  try {
    let ordersList = [];

    // Si Supabase está conectado, consultar órdenes reales
    if (supabase) {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          ordersList = data;
        }
      } catch (err) {
        console.warn('[ADMIN API] Error consultando Supabase, usando local:', err.message);
      }
    }

    // Combinar con órdenes del almacén local
    const localOrders = getAllOrders();
    const existingNums = new Set(ordersList.map(o => (o.order_number || o.orderNumber || '').toUpperCase()));

    for (const ord of localOrders) {
      const num = (ord.orderNumber || ord.order_number || '').toUpperCase();
      if (!existingNums.has(num)) {
        ordersList.push(ord);
      }
    }

    res.json(ordersList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Actualizar estatus de una orden, paquetería y número de guía
 */
app.patch('/api/admin/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status, trackingCarrier, trackingNumber, internalNotes } = req.body;

    const updated = updateOrderStatus(orderNumber, {
      status,
      trackingCarrier,
      trackingNumber,
      internalNotes
    });

    // Sincronizar también con Supabase si está disponible
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            fulfillment_status: status,
            notes: internalNotes || undefined
          })
          .eq('order_number', orderNumber.toUpperCase());
      } catch (sbErr) {
        console.warn('[ADMIN API] No se pudo sincronizar status en Supabase:', sbErr.message);
      }
    }

    if (!updated) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Guardar una nueva orden desde el front o crear orden manual
 */
app.post('/api/admin/orders', (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || (!orderData.orderNumber && !orderData.order_number)) {
      return res.status(400).json({ error: 'Falta número de orden' });
    }
    const saved = saveOrder(orderData);
    res.json({ success: true, order: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Enviar correos de confirmación (llamado desde checkout o simulación)
 */
app.post('/api/send-order-email', async (req, res) => {
  try {
    const order = req.body;
    if (!order || (!order.orderNumber && !order.order_number)) {
      return res.status(400).json({ error: 'Datos de orden incompletos' });
    }

    const result = await sendOrderEmails(order);
    res.json(result);
  } catch (err) {
    console.error('[API EMAIL] Error al procesar correo:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`
  ======================================================
  ⚡ SYNICAL™ BACKEND SERVER INICIADO EXITOSAMENTE
  ======================================================
  - URL Servidor:    http://localhost:${PORT}
  - Stripe Status:   ${stripeKey ? 'CONFIGURADO (PRODUCCIÓN/TEST)' : 'MODO SIMULACIÓN'}
  - Supabase Status: ${supabaseUrl ? 'CONECTADO' : 'MODO LOCAL'}
  - Origen Cliente:  ${CLIENT_URL}
  ======================================================
  `);
});
