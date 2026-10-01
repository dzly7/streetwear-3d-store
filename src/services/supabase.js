import { createClient } from '@supabase/supabase-js';
import { PRODUCTS, DISCOUNT_CODES } from '../data/products';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// SYNICAL DATA ACCESS LAYER (CON FALLBACK AUTOMÁTICO)
// ==============================================================================

export const storeService = {
  /**
   * Obtiene todos los productos activos y sus inventarios en tiempo real
   */
  async getProducts() {
    if (!isSupabaseConfigured) {
      // Fallback a los datos locales
      return PRODUCTS;
    }

    try {
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          product_inventory (
            size,
            stock_quantity
          )
        `)
        .eq('is_active', true);

      if (error || !dbProducts || dbProducts.length === 0) {
        console.warn('[SYNICAL DB] Usando catálogo local por fallback:', error?.message);
        return PRODUCTS;
      }

      // Mapear la estructura relacional de Supabase al formato que espera la UI
      return dbProducts.map((p) => {
        const stockMap = {};
        if (p.product_inventory && Array.isArray(p.product_inventory)) {
          p.product_inventory.forEach((inv) => {
            stockMap[inv.size] = inv.stock_quantity;
          });
        }

        return {
          id: p.id,
          atmosphereId: p.atmosphere_id,
          name: p.name,
          tagline: p.tagline,
          price: Number(p.price),
          currency: p.currency || 'USD',
          color: p.color,
          badge: p.badge,
          stock: Object.keys(stockMap).length > 0 ? stockMap : { S: 3, M: 5, L: 4, XL: 2 },
          images: p.images || {},
          cleanGraphics: p.clean_graphics || {},
          artworkBoard: p.artwork_board,
          accentColor: p.accent_color,
          sizes: ['S', 'M', 'L', 'XL'],
          description: p.description,
          details: Array.isArray(p.details) ? p.details : [],
          care: Array.isArray(p.care) ? p.care : [],
          measurements: p.measurements || {}
        };
      });
    } catch (err) {
      console.error('[SYNICAL DB] Error al consultar productos:', err);
      return PRODUCTS;
    }
  },

  /**
   * Consulta el estado de una orden por su código SYN-XXXXXX
   */
  async getOrderByNumber(orderNumber) {
    const cleanNumber = (orderNumber || '').trim().toUpperCase();
    if (!cleanNumber) return null;

    if (!isSupabaseConfigured) {
      // Búsqueda en historial de localStorage
      try {
        const localReceipt = localStorage.getItem('synical_last_order');
        if (localReceipt) {
          const parsed = JSON.parse(localReceipt);
          if (parsed.orderNumber === cleanNumber) return parsed;
        }
      } catch {}
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_number', cleanNumber)
        .single();

      if (error || !data) return null;
      return data;
    } catch (err) {
      console.error('[SYNICAL DB] Error al buscar orden:', err);
      return null;
    }
  },

  /**
   * Valida un cupón de descuento en la base de datos
   */
  async validateDiscount(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return null;

    if (!isSupabaseConfigured) {
      const localMatch = DISCOUNT_CODES[cleanCode];
      return localMatch ? { code: cleanCode, percent: localMatch.percent, label: localMatch.label } : null;
    }

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;
      return { code: data.code, percent: Number(data.percent), label: data.label };
    } catch {
      return null;
    }
  },

  /**
   * Suscribe al cliente a cambios de stock en tiempo real
   */
  subscribeToInventory(onInventoryUpdate) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const channel = supabase
      .channel('realtime_inventory')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'product_inventory' },
        (payload) => {
          if (onInventoryUpdate) onInventoryUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
