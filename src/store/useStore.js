import { create } from 'zustand';
import { audio } from '../services/audioService';
import { DISCOUNT_CODES } from '../data/products';

// Safe localStorage helpers
const loadCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('synical_cart_v2');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('synical_cart_v2', JSON.stringify(cart));
  } catch {}
};

const loadSoundPref = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('synical_sound_pref') === 'true';
  } catch {
    return false;
  }
};

const loadSkyIndex = () => {
  if (typeof window === 'undefined') return 2;
  try {
    const saved = localStorage.getItem('synical_sky_index');
    return saved !== null ? Number(saved) : 2;
  } catch {
    return 2;
  }
};

export const useStore = create((set, get) => ({
  // Cart state - loaded from localStorage, default empty
  cart: loadCart(),
  isCartOpen: false,

  // Selected product modal (PDP)
  selectedProduct: null,
  isProductModalOpen: false,

  // Modals state
  isSearchOpen: false,
  openSearch: () => {
    audio.playClickSound();
    set({ isSearchOpen: true });
  },
  closeSearch: () => set({ isSearchOpen: false }),

  isSizeGuideOpen: false,
  openSizeGuide: () => {
    audio.playClickSound();
    set({ isSizeGuideOpen: true });
  },
  closeSizeGuide: () => set({ isSizeGuideOpen: false }),

  isCheckoutOpen: false,
  openCheckout: () => {
    audio.playClickSound();
    set({ isCheckoutOpen: true, isCartOpen: false });
  },
  closeCheckout: () => set({ isCheckoutOpen: false }),

  orderReceipt: null,
  setOrderReceipt: (receipt) => {
    audio.playPurchaseSound();
    saveCart([]);
    set({ orderReceipt: receipt, isCheckoutOpen: false, cart: [] });
  },
  clearOrderReceipt: () => set({ orderReceipt: null }),

  policyModal: null, // 'shipping' | 'returns' | 'contact' | 'sizing'
  openPolicyModal: (type) => {
    audio.playClickSound();
    set({ policyModal: type });
  },
  closePolicyModal: () => set({ policyModal: null }),

  // VIP Concierge / Vault Modal
  isVaultOpen: false,
  openVault: () => {
    audio.playClickSound();
    set({ isVaultOpen: true });
  },
  closeVault: () => set({ isVaultOpen: false }),

  // Toast notification system
  notification: null,
  showNotification: (msg, type = 'info') => {
    set({ notification: { msg, type, id: Date.now() } });
    setTimeout(() => {
      set((s) => (s.notification?.msg === msg ? { notification: null } : {}));
    }, 3500);
  },
  clearNotification: () => set({ notification: null }),

  // Discounts
  discountCode: '',
  appliedDiscount: null,
  discountError: '',
  applyDiscount: (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      set({ discountError: 'Ingresa un código de descuento' });
      return;
    }
    const match = DISCOUNT_CODES[cleanCode];
    if (match) {
      audio.playAddToCartSound();
      set({
        discountCode: cleanCode,
        appliedDiscount: { code: cleanCode, percent: match.percent, label: match.label },
        discountError: ''
      });
    } else {
      set({ discountError: 'Código no válido o expirado' });
    }
  },
  removeDiscount: () => set({ discountCode: '', appliedDiscount: null, discountError: '' }),

  // Audio system state with persistence
  isSoundEnabled: loadSoundPref(),
  toggleSound: () => set((state) => {
    const nextState = !state.isSoundEnabled;
    try { localStorage.setItem('synical_sound_pref', String(nextState)); } catch {}
    audio.setMuted(!nextState);
    audio.toggleAmbient(nextState);
    if (nextState) audio.playClickSound();
    return { isSoundEnabled: nextState };
  }),

  // 3D WebGL Atmosphere Presets
  skyPresetIndex: loadSkyIndex(),
  skyPresets: [
    {
      id: 'azure-day',
      name: 'Azure Day',
      badge: 'DÍA AZUR',
      skyZenith: '#0284c7',
      skyHorizon: '#bae6fd',
      cloudSunColor: '#ffffff',
      cloudShadowColor: '#93c5fd',
      sunColor: '#ffffff',
      ambientColor: '#e0f2fe',
      ambientIntensity: 1.8,
      sunIntensity: 3.4,
      sunPosition: [12, 18, 10],
      fogColor: '#bae6fd',
      stars: false,
    },
    {
      id: 'golden-sunset',
      name: 'Golden Sunset',
      badge: 'HORA DORADA',
      skyZenith: '#312e81',
      skyHorizon: '#fb923c',
      cloudSunColor: '#fef08a',
      cloudShadowColor: '#581c87',
      sunColor: '#f97316',
      ambientColor: '#fed7aa',
      ambientIntensity: 1.5,
      sunIntensity: 3.6,
      sunPosition: [22, 6, -15],
      fogColor: '#ea580c',
      stars: false,
    },
    {
      id: 'cyber-twilight',
      name: 'Cyber Twilight',
      badge: 'CYBER DUSK',
      skyZenith: '#0f172a',
      skyHorizon: '#a855f7',
      cloudSunColor: '#f472b6',
      cloudShadowColor: '#1e1b4b',
      sunColor: '#c084fc',
      ambientColor: '#818cf8',
      ambientIntensity: 1.3,
      sunIntensity: 2.8,
      sunPosition: [-15, 8, -10],
      fogColor: '#6b21a8',
      stars: false,
    },
    {
      id: 'midnight-abyss',
      name: 'Midnight Abyss',
      badge: 'ABISMO NOCHE',
      skyZenith: '#030712',
      skyHorizon: '#0369a1',
      cloudSunColor: '#cbd5e1',
      cloudShadowColor: '#020617',
      sunColor: '#38bdf8',
      ambientColor: '#0f172a',
      ambientIntensity: 0.9,
      sunIntensity: 2.4,
      sunPosition: [0, 20, 10],
      fogColor: '#0c4a6e',
      stars: true,
    },
    {
      id: 'ethereal-rose',
      name: 'Ethereal Rose',
      badge: 'ROSA ANGELICAL',
      skyZenith: '#4c1d95',
      skyHorizon: '#fb7185',
      cloudSunColor: '#fff1f2',
      cloudShadowColor: '#4a044e',
      sunColor: '#fda4af',
      ambientColor: '#fecdd3',
      ambientIntensity: 1.5,
      sunIntensity: 3.2,
      sunPosition: [12, 14, 10],
      fogColor: '#f43f5e',
      stars: false,
    },
  ],

  setSkyPresetIndex: (index) => {
    try { localStorage.setItem('synical_sky_index', String(index)); } catch {}
    set({ skyPresetIndex: index });
  },
  setSkyPresetById: (atmosphereId) => {
    const presets = get().skyPresets;
    const index = presets.findIndex((p) => p.id === atmosphereId);
    if (index !== -1) {
      audio.playClickSound();
      try { localStorage.setItem('synical_sky_index', String(index)); } catch {}
      set({ skyPresetIndex: index });
    }
  },
  nextSkyPreset: () => {
    audio.playClickSound();
    set((state) => {
      const nextIdx = (state.skyPresetIndex + 1) % state.skyPresets.length;
      try { localStorage.setItem('synical_sky_index', String(nextIdx)); } catch {}
      return { skyPresetIndex: nextIdx };
    });
  },

  // Cart actions with real stock limits
  toggleCart: () => {
    audio.playClickSound();
    set((state) => ({ isCartOpen: !state.isCartOpen }));
  },
  openCart: () => {
    audio.playClickSound();
    set({ isCartOpen: true });
  },
  closeCart: () => set({ isCartOpen: false }),

  addToCart: (product, size = 'L') => {
    const state = get();
    const availableStock = product.stock?.[size] ?? 99;
    const existingIndex = state.cart.findIndex(
      (item) => item.id === product.id && item.size === size
    );
    const currentQty = existingIndex > -1 ? state.cart[existingIndex].quantity : 0;

    if (currentQty >= availableStock) {
      audio.playClickSound();
      get().showNotification(`Solo hay ${availableStock} unidades disponibles en talla ${size}`, 'warning');
      return { success: false, reason: 'out_of_stock' };
    }

    audio.playAddToCartSound();
    let newCart;
    if (existingIndex > -1) {
      newCart = [...state.cart];
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + 1,
        maxStock: availableStock
      };
    } else {
      newCart = [
        ...state.cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          size: size || 'L',
          image: product.images?.front || '',
          quantity: 1,
          maxStock: availableStock
        }
      ];
    }

    saveCart(newCart);
    set({ cart: newCart, isCartOpen: true });
    get().showNotification(`¡Añadido a la bolsa! ${product.name} (Talla ${size})`, 'success');
    return { success: true };
  },

  removeFromCart: (index) => {
    audio.playClickSound();
    const removedItem = get().cart[index];
    const newCart = get().cart.filter((_, i) => i !== index);
    saveCart(newCart);
    set({ cart: newCart });
    if (removedItem) {
      get().showNotification(`Se eliminó ${removedItem.name} de la bolsa`, 'info');
    }
  },

  updateQuantity: (index, delta) => {
    audio.playClickSound();
    const currentCart = get().cart;
    const item = currentCart[index];
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      const newCart = currentCart.filter((_, i) => i !== index);
      saveCart(newCart);
      set({ cart: newCart });
      return;
    }

    if (item.maxStock && newQty > item.maxStock) {
      get().showNotification(`No puedes agregar más: solo quedan ${item.maxStock} unidades en stock`, 'warning');
      return;
    }

    const newCart = [...currentCart];
    newCart[index] = { ...item, quantity: newQty };
    saveCart(newCart);
    set({ cart: newCart });
  },

  // Modal actions
  productModalInitialThumb: 'front',
  openProductModal: (product, initialThumb = 'front') => {
    audio.playClickSound();
    set({ 
      selectedProduct: product, 
      productModalInitialThumb: initialThumb,
      isProductModalOpen: true 
    });
  },
  setSelectedProduct: (product) => set({
    selectedProduct: product
  }),
  closeProductModal: () => set({ 
    selectedProduct: null, 
    isProductModalOpen: false 
  }),
}));
