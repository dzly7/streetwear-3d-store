import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname);
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Pre-seeded demo orders showing different stages of logistics
const INITIAL_ORDERS = [
  {
    orderNumber: 'SYN-849201',
    date: '30/09/2026, 08:30',
    createdAt: new Date('2026-09-30T08:30:00Z').toISOString(),
    customer: {
      name: 'Mateo Valdés',
      email: 'mateo@streetwear.mx',
      phone: '+52 55 8192 4819',
      address: 'Campos Elíseos 204, Int 5B',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '11560',
      country: 'México'
    },
    items: [
      { id: 'cyber-dusk-apex', name: 'CYBER DUSK APEX ZIP UP', size: 'L', quantity: 1, price: 125, sku: 'SYN-CDA-L' }
    ],
    subtotal: 125,
    shippingCost: 0,
    shippingMethod: 'Envío Estándar Asegurado (Gratis)',
    discountAmount: 0,
    total: 125,
    paymentStatus: 'paid',
    paymentMethod: 'Tarjeta Stripe •••• 4242',
    fulfillment_status: 'processing',
    status: 'processing',
    trackingCarrier: 'Pendiente de Guía',
    trackingNumber: '',
    internalNotes: 'Prenda en fase de planchado y empaque de archivo.'
  },
  {
    orderNumber: 'SYN-739182',
    date: '29/09/2026, 17:15',
    createdAt: new Date('2026-09-29T17:15:00Z').toISOString(),
    customer: {
      name: 'Camila Rossi',
      email: 'camila.rossi@outlook.com',
      phone: '+52 33 1290 8821',
      address: 'Av. Paseo Andares 5030, Depto 12',
      city: 'Guadalajara',
      state: 'Jalisco',
      postalCode: '45116',
      country: 'México'
    },
    items: [
      { id: 'celestial-thorn-noir', name: 'CELESTIAL THORN NOIR HOODIE', size: 'M', quantity: 1, price: 135, sku: 'SYN-CTN-M' },
      { id: 'solar-flare-acid', name: 'SOLAR FLARE ACID OVERSIZED', size: 'XL', quantity: 1, price: 120, sku: 'SYN-SFA-XL' }
    ],
    subtotal: 255,
    shippingCost: 15,
    shippingMethod: 'Envío Express 24-48h',
    discountAmount: 25.5,
    appliedDiscount: { code: 'SYNICAL10', percent: 10 },
    total: 244.5,
    paymentStatus: 'paid',
    paymentMethod: 'Apple Pay',
    fulfillment_status: 'shipped',
    status: 'shipped',
    trackingCarrier: 'DHL Express',
    trackingNumber: 'MX-982149182',
    shippedAt: '2026-09-30T09:00:00Z',
    internalNotes: 'Despachado en sucursal DHL Andares.'
  },
  {
    orderNumber: 'SYN-610294',
    date: '28/09/2026, 14:02',
    createdAt: new Date('2026-09-28T14:02:00Z').toISOString(),
    customer: {
      name: 'Iker Santillán',
      email: 'iker.s@techcorp.io',
      phone: '+52 81 2940 1029',
      address: 'Calzada San Pedro 108',
      city: 'Monterrey',
      state: 'Nuevo León',
      postalCode: '66220',
      country: 'México'
    },
    items: [
      { id: 'abyssal-rift-heavy', name: 'ABYSSAL RIFT HEAVY HOODIE', size: 'S', quantity: 1, price: 130, sku: 'SYN-ARH-S' }
    ],
    subtotal: 130,
    shippingCost: 0,
    shippingMethod: 'Envío Estándar Asegurado (Gratis)',
    discountAmount: 0,
    total: 130,
    paymentStatus: 'paid',
    paymentMethod: 'Tarjeta Stripe •••• 1881',
    fulfillment_status: 'delivered',
    status: 'delivered',
    trackingCarrier: 'FedEx Express',
    trackingNumber: 'FDX-7749102948',
    deliveredAt: '2026-09-29T18:40:00Z',
    internalNotes: 'Entregado en recepción con firma.'
  }
];

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(INITIAL_ORDERS, null, 2), 'utf-8');
  }
}

export function getAllOrders() {
  ensureFile();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[ORDERS STORE] Error leyendo archivo de órdenes:', err);
    return INITIAL_ORDERS;
  }
}

export function getOrderByNumber(orderNumber) {
  const orders = getAllOrders();
  const search = orderNumber.trim().toUpperCase();
  return orders.find(
    (o) => (o.orderNumber || o.order_number || '').toUpperCase() === search
  );
}

export function saveOrder(order) {
  ensureFile();
  const orders = getAllOrders();
  const orderNum = order.orderNumber || order.order_number;
  
  // Si ya existe, actualizarla
  const idx = orders.findIndex(
    (o) => (o.orderNumber || o.order_number) === orderNum
  );

  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...order };
  } else {
    orders.unshift(order);
  }

  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return order;
  } catch (err) {
    console.error('[ORDERS STORE] Error guardando orden:', err);
    throw err;
  }
}

export function updateOrderStatus(orderNumber, { status, trackingCarrier, trackingNumber, internalNotes }) {
  ensureFile();
  const orders = getAllOrders();
  const idx = orders.findIndex(
    (o) => (o.orderNumber || o.order_number || '').toUpperCase() === orderNumber.toUpperCase()
  );

  if (idx < 0) {
    return null;
  }

  if (status) {
    orders[idx].status = status;
    orders[idx].fulfillment_status = status;
  }
  if (trackingCarrier !== undefined) {
    orders[idx].trackingCarrier = trackingCarrier;
  }
  if (trackingNumber !== undefined) {
    orders[idx].trackingNumber = trackingNumber;
  }
  if (internalNotes !== undefined) {
    orders[idx].internalNotes = internalNotes;
  }

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return orders[idx];
}
