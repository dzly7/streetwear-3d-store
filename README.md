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

---

## 🛠️ Stack Tecnológico

* **Frontend**: React 19, Vite 8
* **Gráficos 3D & Shaders**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Postprocessing (`@react-three/postprocessing`)
* **Animaciones UI**: Framer Motion, Canvas Confetti
* **Estilos & Diseño**: Tailwind CSS, PostCSS, Lucide React
* **Estado Global**: Zustand con persistencia en `localStorage`

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

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📄 Licencia y Derechos de Autor
Proyecto desarrollado con fines académicos y de portafolio de diseño interactivo. Todas las marcas, siluetas y conceptos visuales pertenecen a **SYNICAL™ Atelier**.
