# 🪐 SYNICAL™ — Experiencia E-Commerce 3D & Colección Streetwear

> **Plataforma interactiva de comercio electrónico de alta gama inspirada en la moda urbana de archivo, shaders atmosféricos procedurales en tiempo real y tipografía ciber-gótica en cromo líquido.**

---

## 🌟 Características Principales

### 1. 🌌 Motor Atmosférico 3D Procedural (Three.js & React Three Fiber)
* Vuelo infinito sobre un océano de nubes procedurales generado mediante **Fractal Brownian Motion (FBM)** en shaders GLSL.
* **5 Atmósferas Dinámicas Conmutables en Tiempo Real**:
  1. **Azure Day**: Cielo diurno lúcido con nubes de alta dispersión.
  2. **Golden Sunset**: Hora dorada incandescente con gradientes ámbar y térmicos.
  3. **Cyber Twilight**: Crepúsculo violeta de archivo con matices magenta.
  4. **Midnight Abyss**: Noche profunda con mapa estelar y niebla abisal.
  5. **Ethereal Rose**: Atmósfera rosada angelical y matices cuarzo.
* **Emblema Gótico 3D Central**: Geometría extruida con reflexiones HDRI en cromo pulido y post-procesamiento con efecto **Bloom** cinematográfico.

### 2. 🧥 Colección Cápsula SYNICAL (5 Siluetas Heavyweight)
Cada silueta está vinculada conceptualmente a una de las 5 atmósferas 3D:
* **AZURE HORIZON ZIP UP** (480 GSM French Terry // Lavado vintage stone-wash y nubes celestiales)
* **SOLAR ECLIPSE MINERAL HOODIE** (500 GSM Heavyweight Fleece // Teñido mineral térmico y corona de eclipse)
* **CYBER DUSK APEX ZIP UP** (480 GSM French Terry // Bordado 3M reflectante y dagas góticas cromadas)
* **VOID PHANTOM HEAVYWEIGHT** (500 GSM Brushed Terry // Logotipo en silicona líquida Black Gel 3D y mapa de constelaciones)
* **CELESTIAL THORN ZIP UP** (460 GSM Dune Fleece // Rosa bordada en seda vino tinto, corona de espinas y alas cyber-góticas)

### 3. 🔬 Inspector de Prenda & Lupa Macro HD (PDP)
* **3 Modos de Inspección Interactiva**:
  * `PRENDA`: Mockups frontales y traseros de alta definición.
  * `DISEÑO PURO 1:1`: Serigrafía y bordados aislados en transparencia con retícula de calibración milimétrica.
  * `LÁMINA HD`: Tech-pack técnico completo con macros de capucha, frente, espalda y manga.
* **Lupa Macro Dinámica 2X**: Inspección en tiempo real de texturas textiles con paneo continuo según la posición del cursor.
* **Control de Inventario**: Validación de stock por talla, deshabilitación de compras en tallas agotadas (`SOLD OUT`) y alertas de escasez.

### 4. 🛒 Flujo E-Commerce Robusto & Seguro
* **Bolsa de Compras (CartDrawer)** con persistencia en `localStorage` (cero pérdida de datos al recargar la pestaña).
* Barra de progreso interactiva para **Envío Gratis**.
* Sistema de cupones con validación de descuentos (`SYNICAL10`, `VIP20`, `DROP01`, `SYNICAL-VAULT`).
* **Pasarela de Checkout Simulada** con validación estricta de formulario (regex de correo electrónico, formato de tarjeta en bloques de 4 dígitos, fecha MM/AA, CVC).
* Generador de recibo digital de orden con número de guía oficial y animación de confeti.
* **Drop Vault Secreto**: Bóveda protegida por clave de acceso VIP con desbloqueo interactivo.

### 5. 🎧 Audio Inmersivo Procedural
* Motor de audio Web Audio API (cero latencia y sin dependencias externas pesadas) que sintetiza clics metálicos táctiles, arpegios armónicos al añadir al carrito y fanfarrias de compra segura.

### 6. 💼 Portal de Administración & Business Intelligence (`#/admin`)
* **Acceso Seguro por PIN Maestro**: Protección de interfaz administrativa con autenticación por PIN configurable (`VITE_ADMIN_PIN` o valor demo `SYNICAL2026`) y atajo de teclado rápido (`Ctrl + Shift + A`).
* **Gestión Integral de Órdenes & Fulfillment**:
  * Visualización de pedidos con filtros por estatus (*En Cola*, *En Proceso*, *Enviado*, *Entregado*).
  * Asignación en tiempo real de paqueterías (DHL Express, FedEx Priority, Estafeta) y números de guía oficiales con persistencia dual (API REST + Local Storage).
  * Generador e impresión térmica de **Albaranes de Empaque (Packing Slips)** con códigos de barras y desglose de prendas.
  * Exportación de manifiestos logísticos para couriers.
* **Control de Inventario en Tiempo Real**:
  * Monitor de existencias por talla (S, M, L, XL) con alertas de stock crítico (≤ 2 unidades).
  * Ajuste instantáneo de stock con un clic (+ / -).
  * Formulario de alta para nuevas cápsulas textiles.
* **Módulo de Analítica y Finanzas**:
  * 6 KPIs ejecutivos: Facturación Bruta (GMV), Volumen de Pedidos, Ticket Promedio (AOV), Tasa de Conversión (CR), Margen de Confección y SLA de Despacho.
  * Gráfica de ingresos diarios y cumplimiento de metas comerciales.
  * Curva de rotación de tallas y ranking de siluetas más vendidas.
  * Desglose geográfico de demanda y desempeño comparativo de couriers.

### 7. 📦 Rastreador de Envíos en Tiempo Real
* Modal público de seguimiento accesible desde el Navbar y Footer (`SYN-XXXXXX`).
* Barra de progreso en 4 fases logísticas: *Orden Recibida*, *En Confección*, *En Tránsito*, *Entregado*.
* Visualización directa de la paquetería y número de guía asignados desde el panel de administración.

---

## 🛠️ Stack Tecnológico

* **Frontend**: React 19, Vite 8
* **Gráficos 3D & Shaders**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Postprocessing (`@react-three/postprocessing`)
* **Backend & API**: Node.js, Express 5, CORS, Dotenv, Stripe SDK
* **Base de Datos & Realtime**: Supabase (PostgreSQL), Row Level Security (RLS), Triggers atómicos de inventario
* **Animaciones UI**: Framer Motion, Canvas Confetti
* **Estilos & Diseño**: Tailwind CSS, PostCSS, Lucide React
* **Estado Global**: Zustand con persistencia en `localStorage` y arquitectura resiliente de fallback

---

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/dzly7/streetwear-3d-store.git
   cd streetwear-3d-store
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (Opcional):**
   ```bash
   cp .env.example .env
   ```
   *(El proyecto incluye fallback automático para operar al 100% de manera local sin necesidad de configurar servicios externos)*.

4. **Iniciar en desarrollo:**
   * **Frontend + API Backend simultáneo:**
     ```bash
     npm run dev:all
     ```
   * **Solo Frontend:**
     ```bash
     npm run dev
     ```
   * **Solo API Server:**
     ```bash
     npm run server
     ```
   Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.
   Para acceder al panel de administración entra a [http://localhost:5173/#/admin](http://localhost:5173/#/admin) o presiona `Ctrl + Shift + A` (PIN demo: `SYNICAL2026`).

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📄 Licencia y Derechos de Autor
Proyecto desarrollado con fines académicos y de portafolio de diseño interactivo. Todas las marcas, siluetas y conceptos visuales pertenecen a **SYNICAL™ Atelier**.
