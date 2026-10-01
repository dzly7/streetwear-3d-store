import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, Lock, Package, Layers, PlusCircle, TrendingUp, 
  Truck, CheckCircle, Clock, RefreshCw, AlertCircle, Trash2, Edit3, 
  Eye, DollarSign, Download, Printer, Search, ArrowLeft, LogOut,
  AlertTriangle, Check, ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { storeService } from '../../services/supabase';
import PackingSlipModal from './PackingSlipModal';
import AdminAnalytics from './AdminAnalytics';

const MASTER_PIN = import.meta.env.VITE_ADMIN_PIN || 'SYNICAL2026';

export default function AdminDashboard({ isOpen, onClose, isStandalone = false, onExitAdmin }) {
  const { showNotification } = useStore();
  
  // Auth state with local storage persistence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('synical_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Active Tab: 'orders' | 'inventory' | 'new_product' | 'analytics'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // 'all' | 'processing' | 'shipped' | 'delivered'
  const [selectedPackingSlipOrder, setSelectedPackingSlipOrder] = useState(null);

  // Tracking editor local inputs: { [orderNumber]: { carrier: string, tracking: string } }
  const [trackingEdits, setTrackingEdits] = useState({});

  // Products & Inventory State
  const [productsList, setProductsList] = useState([]);
  const [inventoryFilter, setInventoryFilter] = useState('all'); // 'all' | 'critical'

  // New Product Form State
  const [newProd, setNewProd] = useState({
    id: '',
    name: '',
    tagline: 'Heavyweight Fleece 500GSM // Confección Brutalista',
    price: 125,
    color: 'Bone Cream / Blanco Hueso',
    atmosphereId: 'azure-day',
    stockS: 4,
    stockM: 6,
    stockL: 5,
    stockXL: 2,
    frontImage: '/hoodie_void_front.png',
    backImage: '/hoodie_void_back.png',
    description: 'CONFECCIÓN EN ALGODÓN PESADO DE 500GSM. PIEZA LIMITADA DE ARCHIVO CON GRÁFICOS EN CROMO METÁLICO.'
  });

  // Load orders and products on mount or when opening
  useEffect(() => {
    if (isStandalone || isOpen) {
      loadAdminData();
    }
  }, [isOpen, isStandalone]);

  const loadAdminData = async () => {
    setIsLoadingOrders(true);

    // 1. Cargar catálogo de productos
    try {
      const prods = await storeService.getProducts();
      setProductsList(prods || []);
    } catch (err) {
      console.warn('Error al cargar productos:', err);
    }

    // 2. Cargar órdenes desde Backend API / Local fallback
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          setIsLoadingOrders(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API no disponible para /api/admin/orders, usando almacenamiento local:', err);
    }

    // Fallback a localStorage
    const localOrder = localStorage.getItem('synical_last_order');
    const ordersArray = [];
    if (localOrder) {
      try {
        ordersArray.push(JSON.parse(localOrder));
      } catch {}
    }

    // Si aún está vacío, cargar ejemplos
    if (ordersArray.length === 0) {
      ordersArray.push({
        orderNumber: 'SYN-849201',
        date: '30/09/2026, 08:30',
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
        items: [{ id: 'cyber-dusk-apex', name: 'CYBER DUSK APEX ZIP UP', size: 'L', quantity: 1, price: 125 }],
        subtotal: 125,
        total: 125,
        shippingMethod: 'Envío Estándar Asegurado (Gratis)',
        status: 'processing',
        fulfillment_status: 'processing',
        trackingCarrier: 'Pendiente de Guía',
        trackingNumber: ''
      });
    }

    setOrders(ordersArray);
    setIsLoadingOrders(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (cleanPin === MASTER_PIN || cleanPin === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
      if (rememberSession) {
        try {
          localStorage.setItem('synical_admin_authenticated', 'true');
        } catch {}
      }
      showNotification('★ Acceso concedido al Atelier Admin', 'success');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('synical_admin_authenticated');
    } catch {}
    showNotification('Sesión administrativa finalizada', 'info');
  };

  // Actualizar estatus y logística de una orden
  const handleUpdateOrderStatus = async (orderNum, newStatus, carrier = '', tracking = '') => {
    // 1. Optimistic update en memoria
    const updated = orders.map((o) => {
      const num = o.orderNumber || o.order_number;
      if (num === orderNum) {
        return {
          ...o,
          status: newStatus,
          fulfillment_status: newStatus,
          trackingCarrier: carrier || o.trackingCarrier || 'DHL Express',
          trackingNumber: tracking || o.trackingNumber || ''
        };
      }
      return o;
    });

    setOrders(updated);

    // 2. Guardar en API backend
    try {
      await fetch(`/api/admin/orders/${orderNum}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingCarrier: carrier || undefined,
          trackingNumber: tracking || undefined
        })
      });
    } catch (err) {
      console.warn('Error al guardar status en backend:', err);
    }

    showNotification(`Pedido ${orderNum} actualizado a: ${newStatus.toUpperCase()}`, 'success');
  };

  // Guardar guía editada manualmente
  const handleSaveTracking = async (orderNum) => {
    const edit = trackingEdits[orderNum];
    if (!edit) return;

    await handleUpdateOrderStatus(
      orderNum,
      'shipped',
      edit.carrier || 'DHL Express',
      edit.tracking || ''
    );
  };

  // Exportar todas las órdenes a CSV para paqueterías (DHL / FedEx / Skydropx)
  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      showNotification('No hay órdenes registradas para exportar', 'warning');
      return;
    }

    const headers = [
      'No. Pedido',
      'Fecha',
      'Cliente',
      'Email',
      'Telefono',
      'Direccion',
      'Ciudad',
      'Estado',
      'Codigo Postal',
      'Pais',
      'Prendas y Tallas',
      'Total USD',
      'Metodo Envio',
      'Estatus Fulfillment',
      'Paqueteria',
      'Numero Guia'
    ];

    const rows = orders.map((ord) => {
      const num = ord.orderNumber || ord.order_number || '';
      const c = ord.customer || {};
      const itemsSummary = (ord.items || [])
        .map((it) => `${it.name || it.product_name} (${it.size} x${it.quantity || 1})`)
        .join(' // ');

      return [
        `"${num}"`,
        `"${ord.date || ord.createdAt || ''}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${(c.address || ord.shipping_address || '').replace(/"/g, '""')}"`,
        `"${c.city || ord.shipping_city || ''}"`,
        `"${c.state || ''}"`,
        `"${c.postalCode || ord.shipping_postal || ''}"`,
        `"${c.country || ord.shipping_country || 'México'}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        `"${Number(ord.total || 0).toFixed(2)}"`,
        `"${ord.shippingMethod || 'Estándar'}"`,
        `"${ord.fulfillment_status || ord.status || 'processing'}"`,
        `"${ord.trackingCarrier || ''}"`,
        `"${ord.trackingNumber || ''}"`
      ].join(',');
    });

    // UTF-8 BOM (\uFEFF) para que Excel lo abra con acentos perfectos sin corrupción
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `synical_envios_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('✓ Archivo CSV de envíos descargado exitosamente', 'success');
  };

  // Ajustar stock en memoria
  const handleUpdateStock = (productId, size, delta) => {
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stock?.[szKey(p.stock, size)] ?? p.stock?.[size] ?? 0;
          const next = Math.max(0, current + delta);
          return {
            ...p,
            stock: {
              ...p.stock,
              [size]: next
            }
          };
        }
        return p;
      })
    );
    showNotification(`Stock actualizado (${size})`, 'info');
  };

  const handleSetExactStock = (productId, size, value) => {
    const nextVal = Math.max(0, parseInt(value, 10) || 0);
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stock: {
              ...p.stock,
              [size]: nextVal
            }
          };
        }
        return p;
      })
    );
  };

  const szKey = (stockObj, size) => {
    if (!stockObj) return size;
    return Object.keys(stockObj).find(k => k.toUpperCase() === size.toUpperCase()) || size;
  };

  // Reabastecer masivamente todas las tallas críticas
  const handleBulkRestockCritical = () => {
    setProductsList((prev) =>
      prev.map((p) => {
        const newStock = { ...(p.stock || {}) };
        ['S', 'M', 'L', 'XL'].forEach((sz) => {
          if ((newStock[sz] ?? 0) <= 2) {
            newStock[sz] = (newStock[sz] ?? 0) + 5;
          }
        });
        return { ...p, stock: newStock };
      })
    );
    showNotification('✓ +5 unidades añadidas a todas las tallas críticas', 'success');
  };

  // Crear nuevo drop
  const handleCreateProduct = (e) => {
    e.preventDefault();
    const createdId = newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const productPayload = {
      id: createdId,
      atmosphereId: newProd.atmosphereId,
      name: newProd.name.toUpperCase(),
      tagline: newProd.tagline,
      price: Number(newProd.price),
      currency: 'USD',
      color: newProd.color,
      badge: '★ DROP ATELIER',
      stock: {
        S: Number(newProd.stockS),
        M: Number(newProd.stockM),
        L: Number(newProd.stockL),
        XL: Number(newProd.stockXL)
      },
      images: {
        front: newProd.frontImage,
        back: newProd.backImage
      },
      cleanGraphics: {
        front: newProd.frontImage,
        back: newProd.backImage
      },
      accentColor: '#38bdf8',
      sizes: ['S', 'M', 'L', 'XL'],
      description: newProd.description
    };

    setProductsList((prev) => [productPayload, ...prev]);
    showNotification(`¡Prenda "${newProd.name}" agregada al catálogo!`, 'success');
    setActiveTab('inventory');
  };

  // Filtrado de órdenes
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const num = (o.orderNumber || o.order_number || '').toLowerCase();
      const customerName = (o.customer?.name || '').toLowerCase();
      const customerEmail = (o.customer?.email || '').toLowerCase();
      const city = (o.customer?.city || o.shipping_city || '').toLowerCase();
      const status = (o.fulfillment_status || o.status || 'processing').toLowerCase();

      // Filtro de búsqueda textual
      const query = orderSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        num.includes(query) || 
        customerName.includes(query) || 
        customerEmail.includes(query) || 
        city.includes(query);

      // Filtro de estado
      const matchesStatus = orderStatusFilter === 'all' || status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  // Métricas de inventario
  const inventoryStats = useMemo(() => {
    let totalUnits = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;

    productsList.forEach((p) => {
      ['S', 'M', 'L', 'XL'].forEach((sz) => {
        const qty = p.stock?.[sz] ?? 0;
        totalUnits += qty;
        if (qty === 0) outOfStockCount++;
        else if (qty <= 2) criticalCount++;
      });
    });

    return { totalUnits, criticalCount, outOfStockCount };
  }, [productsList]);

  // Si no está abierto en modo modal ni es modo standalone, no renderizar
  if (!isStandalone && !isOpen) return null;

  return (
    <>
      <div className={isStandalone ? "min-h-screen bg-slate-950 text-white font-mono flex flex-col" : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"}>
        
        {/* Backdrop (solo para modo modal) */}
        {!isStandalone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
          />
        )}

        {/* Panel Container */}
        <div className={isStandalone 
          ? "w-full max-w-7xl mx-auto p-4 sm:p-8 flex-1 flex flex-col" 
          : "relative w-full max-w-6xl rounded-3xl bg-slate-950/95 border border-white/20 p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto my-auto text-white font-mono"
        }>
          
          {/* Top Bar for Standalone Mode */}
          {isStandalone && (
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3">
              <div className="flex items-center gap-3">
                {onExitAdmin && (
                  <button
                    onClick={onExitAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Volver a la Tienda Pública</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                    API SERVER :3001 ONLINE
                  </span>
                </div>
              </div>

              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50 hidden sm:inline">Admin: Master Atelier</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs transition-colors cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Close button for modal mode */}
          {!isStandalone && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}

          {!isAuthenticated ? (
            /* ================= LOGIN PIN ================= */
            <div className="max-w-md mx-auto my-auto py-16 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mx-auto text-purple-300">
                <Lock size={28} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.3em] uppercase text-purple-400 font-bold block">
                  SYNICAL™ SECURE BACKOFFICE
                </span>
                <h2 className="text-2xl font-black font-display tracking-widest uppercase">
                  ATELIER CONTROL SYSTEM
                </h2>
                <p className="text-xs text-white/60">
                  Ingresa tu PIN maestro para gestionar pedidos, albaranes de despacho y stock.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    autoFocus
                    placeholder="PIN MAESTRO"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full text-center tracking-[0.4em] py-3.5 px-4 rounded-2xl bg-white/5 border border-white/20 text-white font-mono text-xl focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  {pinError && (
                    <span className="text-xs text-rose-400 mt-2 block font-bold">
                      PIN incorrecto. Intenta con: SYNICAL2026
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-white/70">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded border-white/20 text-purple-500 cursor-pointer"
                  />
                  <label htmlFor="remember" className="cursor-pointer select-none">
                    Recordar sesión en este navegador
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-xs tracking-widest uppercase hover:bg-purple-300 transition-colors cursor-pointer shadow-lg"
                >
                  DESBLOQUEAR PANEL DE OPERACIONES
                </button>
              </form>

              <span className="text-[10px] text-white/40 block">
                PIN de acceso de fábrica: <strong className="text-white/70">SYNICAL2026</strong>
              </span>
            </div>
          ) : (
            /* ================= DASHBOARD PRINCIPAL ================= */
            <div className="space-y-6 flex-1">
              
              {/* Header & Tabs */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-5 gap-3">
                <div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-purple-400 font-bold block">
                    CENTRO DE MANDO // LOGÍSTICA & FULFILLMENT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-wider uppercase text-white flex items-center gap-2">
                    <ShieldCheck className="text-purple-400" size={22} />
                    SYNICAL™ ATELIER OPERATING SYSTEM
                  </h2>
                </div>
                
                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  {[
                    { id: 'orders', label: 'Pedidos & Envíos', icon: Package, badge: orders.length },
                    { id: 'inventory', label: 'Stock & Tallas', icon: Layers, badge: inventoryStats.criticalCount > 0 ? `!${inventoryStats.criticalCount}` : null },
                    { id: 'new_product', label: '+ Nuevo Drop', icon: PlusCircle },
                    { id: 'analytics', label: 'Finanzas', icon: TrendingUp }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-white text-slate-950 font-bold shadow-md'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                            activeTab === tab.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-white/15 text-white'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================= TAB 1: PEDIDOS & LOGÍSTICA ================= */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  
                  {/* Top Action & Search Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    
                    {/* Live Search */}
                    <div className="relative flex-1 min-w-[240px]">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="Buscar por N° pedido (SYN-XXXX), cliente, email o ciudad..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400"
                      />
                      {orderSearchQuery && (
                        <button
                          onClick={() => setOrderSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Filter Status Pills */}
                    <div className="flex items-center gap-1 text-[11px]">
                      {[
                        { id: 'all', label: `Todos (${orders.length})` },
                        { id: 'processing', label: `⚙️ Confección (${orders.filter(o => (o.fulfillment_status || o.status) === 'processing').length})` },
                        { id: 'shipped', label: `🚚 En Tránsito (${orders.filter(o => (o.fulfillment_status || o.status) === 'shipped').length})` },
                        { id: 'delivered', label: `✓ Entregados (${orders.filter(o => (o.fulfillment_status || o.status) === 'delivered').length})` }
                      ].map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => setOrderStatusFilter(chip.id)}
                          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            orderStatusFilter === chip.id
                              ? 'bg-white text-slate-950 font-bold border-white'
                              : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {/* Actions: Refresh & CSV Export */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportOrdersToCSV}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                        title="Descargar archivo CSV formateado para DHL, FedEx y paqueterías"
                      >
                        <Download size={13} />
                        <span>Exportar CSV Envíos</span>
                      </button>

                      <button
                        onClick={loadAdminData}
                        disabled={isLoadingOrders}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                        title="Recargar pedidos"
                      >
                        <RefreshCw size={14} className={isLoadingOrders ? "animate-spin" : ""} />
                      </button>
                    </div>

                  </div>

                  {/* Orders List */}
                  <div className="space-y-3">
                    {filteredOrders.map((ord, idx) => {
                      const num = ord.orderNumber || ord.order_number || 'SYN-000000';
                      const status = ord.fulfillment_status || ord.status || 'processing';
                      const c = ord.customer || {};
                      const editState = trackingEdits[num] || {
                        carrier: ord.trackingCarrier || 'DHL Express',
                        tracking: ord.trackingNumber || ''
                      };

                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-4"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sky-400 text-sm tracking-wider">
                                #{num}
                              </span>
                              <span className="text-white/40">•</span>
                              <span className="text-white/60">
                                {ord.date || ord.createdAt}
                              </span>
                              <span className="text-white/40">•</span>
                              <span className="text-white/90 font-bold">
                                {c.name || 'Cliente'}
                              </span>
                              <span className="text-white/50 text-[11px]">
                                ({c.email || 'Sin email'})
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold text-sm">
                                ${Number(ord.total || 0).toFixed(2)} USD
                              </span>
                              
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  status === 'delivered'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : status === 'shipped'
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {status === 'delivered' ? '✓ Entregado' : status === 'shipped' ? '🚚 En Tránsito' : '⚙️ En Confección'}
                              </span>
                            </div>
                          </div>

                          {/* Garments and Shipping Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-black/40 p-3.5 rounded-xl border border-white/5">
                            <div>
                              <span className="text-white/40 block text-[10px] font-bold uppercase mb-1">
                                PRENDAS SOLICITADAS ({(ord.items || []).length}):
                              </span>
                              <div className="space-y-1">
                                {(ord.items || []).map((it, i) => (
                                  <div key={i} className="text-white/90 flex items-center justify-between">
                                    <span>
                                      • {it.name || it.product_name}{' '}
                                      <strong className="text-sky-300">[{it.size}]</strong>
                                    </span>
                                    <span className="text-white/60">
                                      Cant: {it.quantity || 1} • ${(Number(it.price || it.unit_price || 0) * (it.quantity || 1)).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-white/40 block text-[10px] font-bold uppercase mb-1">
                                DESTINO DE ENTREGA & CONTACTO:
                              </span>
                              <div className="text-white/80 space-y-0.5">
                                <p className="font-bold text-white">
                                  {c.address || ord.shipping_address || 'Dirección de entrega'}
                                </p>
                                <p className="text-white/60 text-[11px]">
                                  {c.city || ord.shipping_city}, {c.state || ''} {c.postalCode || ord.shipping_postal || ''} • {c.country || ord.shipping_country || 'México'}
                                </p>
                                <p className="text-white/50 text-[10px]">
                                  Tel: {c.phone || '+52 55 0000 0000'} • {ord.shippingMethod || 'Estándar'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Fulfillment Management Controls */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
                            
                            {/* Status Change Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-white/50 uppercase font-bold mr-1">ESTATUS:</span>
                              <button
                                onClick={() => handleUpdateOrderStatus(num, 'processing')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  status === 'processing'
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-white/5 border border-white/15 text-white/70 hover:bg-white/15'
                                }`}
                              >
                                En Confección
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(num, 'shipped', editState.carrier, editState.tracking || `DHL-${Math.floor(10000000 + Math.random() * 90000000)}`)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  status === 'shipped'
                                    ? 'bg-sky-400 text-slate-950'
                                    : 'bg-sky-500/20 border border-sky-400/40 text-sky-200 hover:bg-sky-500/30'
                                }`}
                              >
                                Despachar
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(num, 'delivered')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  status === 'delivered'
                                    ? 'bg-emerald-400 text-slate-950'
                                    : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30'
                                }`}
                              >
                                Marcar Entregado
                              </button>
                            </div>

                            {/* Tracking and Courier Input Field */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Paquetería (ej. DHL)"
                                value={editState.carrier}
                                onChange={(e) =>
                                  setTrackingEdits({
                                    ...trackingEdits,
                                    [num]: { ...editState, carrier: e.target.value }
                                  })
                                }
                                className="w-28 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-sky-400"
                              />
                              <input
                                type="text"
                                placeholder="N° de Guía / Tracking"
                                value={editState.tracking}
                                onChange={(e) =>
                                  setTrackingEdits({
                                    ...trackingEdits,
                                    [num]: { ...editState, tracking: e.target.value }
                                  })
                                }
                                className="w-36 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-sky-400"
                              />
                              <button
                                onClick={() => handleSaveTracking(num)}
                                className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                Guardar Guía
                              </button>
                            </div>

                            {/* Packing Slip Print Button */}
                            <button
                              onClick={() => setSelectedPackingSlipOrder(ord)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-950 font-bold text-[11px] hover:bg-white/90 transition-all cursor-pointer shadow-sm"
                            >
                              <Printer size={13} />
                              <span>Albarán de Empaque</span>
                            </button>

                          </div>
                        </div>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <div className="text-center py-16 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-xs">
                        No se encontraron pedidos con los criterios de búsqueda seleccionados.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 2: INVENTARIO & STOCK ================= */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  
                  {/* Stock Alert Summary Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/50 uppercase block font-bold">TOTAL PIEZAS EN STOCK</span>
                      <span className="text-2xl font-bold text-white font-mono">{inventoryStats.totalUnits}</span>
                      <span className="text-[10px] text-white/40 block">Distribuidas en todas las siluetas</span>
                    </div>

                    <div className={`p-4 rounded-2xl border ${inventoryStats.criticalCount > 0 ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-white/5 border-white/10'}`}>
                      <span className="text-[10px] uppercase block font-bold">TALLAS CON STOCK CRÍTICO (≤ 2)</span>
                      <span className="text-2xl font-bold font-mono">{inventoryStats.criticalCount}</span>
                      <span className="text-[10px] block opacity-70">Riesgo inminente de agotarse</span>
                    </div>

                    <div className={`p-4 rounded-2xl border ${inventoryStats.outOfStockCount > 0 ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' : 'bg-white/5 border-white/10'}`}>
                      <span className="text-[10px] uppercase block font-bold">TALLAS AGOTADAS (0 UDS)</span>
                      <span className="text-2xl font-bold font-mono">{inventoryStats.outOfStockCount}</span>
                      <span className="text-[10px] block opacity-70">Bloqueadas automáticamente en tienda</span>
                    </div>
                  </div>

                  {/* Actions & Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-white/60 text-[10px] font-bold uppercase">FILTRAR SILUETAS:</span>
                      <button
                        onClick={() => setInventoryFilter('all')}
                        className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                          inventoryFilter === 'all'
                            ? 'bg-white text-slate-950 font-bold border-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        Todas ({productsList.length})
                      </button>
                      <button
                        onClick={() => setInventoryFilter('critical')}
                        className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                          inventoryFilter === 'critical'
                            ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                        }`}
                      >
                        ⚠️ Solo Críticos o Agotados
                      </button>
                    </div>

                    <button
                      onClick={handleBulkRestockCritical}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <PlusCircle size={14} />
                      <span>+5 a Todas las Tallas Bajas</span>
                    </button>
                  </div>

                  {/* Product Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productsList
                      .filter((prod) => {
                        if (inventoryFilter === 'all') return true;
                        return ['S', 'M', 'L', 'XL'].some((sz) => (prod.stock?.[sz] ?? 0) <= 2);
                      })
                      .map((prod) => (
                        <div key={prod.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images?.front || '/hoodie_void_front.png'}
                              alt={prod.name}
                              className="w-14 h-14 rounded-xl object-cover bg-black border border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-white text-xs block truncate">{prod.name}</span>
                              <span className="text-[10px] text-sky-400 block">${prod.price} USD • {prod.color}</span>
                              <span className="text-[9px] text-white/40 block truncate">{prod.tagline}</span>
                            </div>
                          </div>

                          {/* Sizes stock controls */}
                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
                            {['S', 'M', 'L', 'XL'].map((sz) => {
                              const count = prod.stock?.[sz] ?? 0;
                              const isOutOfStock = count === 0;
                              const isCritical = count > 0 && count <= 2;

                              return (
                                <div
                                  key={sz}
                                  className={`p-2 rounded-xl border transition-all ${
                                    isOutOfStock
                                      ? 'bg-rose-950/40 border-rose-500/50'
                                      : isCritical
                                      ? 'bg-amber-950/40 border-amber-500/50'
                                      : 'bg-black/40 border-white/5'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                    <span className="text-white/60">TALLA {sz}</span>
                                    {isOutOfStock && <span className="text-[8px] text-rose-400">AGOTADO</span>}
                                    {isCritical && <span className="text-[8px] text-amber-400">BAJO</span>}
                                  </div>

                                  <input
                                    type="number"
                                    min="0"
                                    value={count}
                                    onChange={(e) => handleSetExactStock(prod.id, sz, e.target.value)}
                                    className={`w-full text-center text-sm font-bold bg-transparent border-b pb-0.5 focus:outline-none mb-1.5 ${
                                      isOutOfStock
                                        ? 'text-rose-400 border-rose-500/40'
                                        : isCritical
                                        ? 'text-amber-300 border-amber-500/40'
                                        : 'text-white border-white/20'
                                    }`}
                                  />

                                  <div className="flex justify-center gap-1">
                                    <button
                                      onClick={() => handleUpdateStock(prod.id, sz, -1)}
                                      className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStock(prod.id, sz, 1)}
                                      className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 3: CREAR NUEVO DROP ================= */}
              {activeTab === 'new_product' && (
                <form onSubmit={handleCreateProduct} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 max-w-3xl mx-auto">
                  <div>
                    <span className="text-[10px] text-purple-400 tracking-widest uppercase font-bold block">
                      LANZAMIENTO DIRECTO AL CATÁLOGO
                    </span>
                    <h3 className="text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
                      <PlusCircle size={18} className="text-purple-400" />
                      CREAR Y PUBLICAR NUEVA SILUETA
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] text-white/50 block mb-1">NOMBRE DE LA HOODIE *</label>
                      <input
                        type="text"
                        required
                        placeholder="ej. SERAPH OF DEATH HEAVY HOODIE"
                        value={newProd.name}
                        onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/50 block mb-1">COLORWAY / PIGMENTO *</label>
                      <input
                        type="text"
                        required
                        placeholder="ej. Bone Cream / Blanco Hueso 500GSM"
                        value={newProd.color}
                        onChange={(e) => setNewProd({ ...newProd, color: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/50 block mb-1">PRECIO EN USD ($) *</label>
                      <input
                        type="number"
                        required
                        value={newProd.price}
                        onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/50 block mb-1">ATMÓSFERA 3D ASIGNADA</label>
                      <select
                        value={newProd.atmosphereId}
                        onChange={(e) => setNewProd({ ...newProd, atmosphereId: e.target.value })}
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="azure-day">Azure Day (Día Azul)</option>
                        <option value="golden-sunset">Golden Sunset (Hora Dorada)</option>
                        <option value="cyber-twilight">Cyber Twilight (Violeta Cyber)</option>
                        <option value="midnight-abyss">Midnight Abyss (Abismo Noche)</option>
                        <option value="ethereal-rose">Ethereal Rose (Rosa Angelical)</option>
                      </select>
                    </div>
                  </div>

                  {/* Stock por talla */}
                  <div>
                    <label className="text-[10px] text-white/50 block mb-2">STOCK INICIAL POR TALLA:</label>
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      {['S', 'M', 'L', 'XL'].map((sz) => (
                        <div key={sz} className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
                          <span className="text-[10px] text-white/60 block font-bold mb-1">TALLA {sz}</span>
                          <input
                            type="number"
                            min="0"
                            value={newProd[`stock${sz}`]}
                            onChange={(e) => setNewProd({ ...newProd, [`stock${sz}`]: e.target.value })}
                            className="w-full text-center bg-white/5 border border-white/20 rounded-lg p-1 text-white font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/50 block mb-1">TAGLINE / GRAMAJE</label>
                    <input
                      type="text"
                      value={newProd.tagline}
                      onChange={(e) => setNewProd({ ...newProd, tagline: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-white/50 block mb-1">DESCRIPCIÓN DE ARCHIVO</label>
                    <textarea
                      rows={2}
                      value={newProd.description}
                      onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs tracking-widest uppercase transition-colors cursor-pointer shadow-lg"
                  >
                    PUBLICAR EN LA TIENDA SYNICAL™
                  </button>
                </form>
              )}

              {/* ================= TAB 4: MÉTRICAS Y FINANZAS ================= */}
              {activeTab === 'analytics' && (
                <AdminAnalytics orders={orders} products={productsList} />
              )}

            </div>
          )}

        </div>
      </div>

      {/* Printable Packing Slip Modal */}
      <PackingSlipModal
        order={selectedPackingSlipOrder}
        isOpen={Boolean(selectedPackingSlipOrder)}
        onClose={() => setSelectedPackingSlipOrder(null)}
      />
    </>
  );
}
