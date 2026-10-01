-- ==============================================================================
-- SYNICAL™ STREETWEAR ARCHIVE // SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- Copia y pega este script completo en el SQL Editor de tu proyecto en Supabase
-- https://supabase.com/dashboard/project/_/sql

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PRODUCTS (Catálogo de Prendas y Cápsulas)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    atmosphere_id TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    color TEXT NOT NULL,
    badge TEXT,
    accent_color TEXT DEFAULT '#38bdf8',
    description TEXT,
    details JSONB DEFAULT '[]'::jsonb,
    care JSONB DEFAULT '[]'::jsonb,
    measurements JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '{}'::jsonb,
    clean_graphics JSONB DEFAULT '{}'::jsonb,
    artwork_board TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: PRODUCT_INVENTORY (Stock en tiempo real por talla)
CREATE TABLE IF NOT EXISTS public.product_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL, -- 'S', 'M', 'L', 'XL'
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- 4. TABLA: DISCOUNT_CODES (Cupones y Descuentos)
CREATE TABLE IF NOT EXISTS public.discount_codes (
    code TEXT PRIMARY KEY,
    percent NUMERIC(5, 2) NOT NULL,
    label TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INT DEFAULT NULL,
    current_uses INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: ORDERS (Registro de Pedidos Reales)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- ej: SYN-789214
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_postal TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    shipping_method TEXT NOT NULL, -- 'standard' | 'express'
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    applied_discount_code TEXT,
    total NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL, -- 'stripe' | 'card' | 'apple_pay'
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
    fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled', -- 'unfulfilled' | 'processing' | 'shipped' | 'delivered'
    tracking_number TEXT,
    tracking_carrier TEXT, -- 'DHL' | 'FedEx' | 'Estafeta'
    stripe_session_id TEXT,
    stripe_payment_intent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: ORDER_ITEMS (Líneas de producto de cada pedido)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 7. FUNCIÓN ATÓMICA DE SEGURIDAD: DESCONTAR INVENTARIO TRAS PAGO
-- Evita overselling o condiciones de carrera concurrentes
CREATE OR REPLACE FUNCTION public.process_order_paid(
    p_order_id UUID
) RETURNS VOID AS $$
DECLARE
    item RECORD;
    available INT;
BEGIN
    -- Marcar la orden como pagada
    UPDATE public.orders
    SET payment_status = 'paid',
        fulfillment_status = 'processing',
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Descontar inventario de cada prenda de la orden
    FOR item IN
        SELECT product_id, size, quantity 
        FROM public.order_items 
        WHERE order_id = p_order_id
    LOOP
        -- Verificar stock actual
        SELECT stock_quantity INTO available
        FROM public.product_inventory
        WHERE product_id = item.product_id AND size = item.size
        FOR UPDATE;

        IF available < item.quantity THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto % en talla %', item.product_id, item.size;
        END IF;

        -- Descontar stock
        UPDATE public.product_inventory
        SET stock_quantity = stock_quantity - item.quantity,
            updated_at = NOW()
        WHERE product_id = item.product_id AND size = item.size;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Lectura pública para la tienda
CREATE POLICY "Permitir lectura publica de productos" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Permitir lectura publica de inventario" ON public.product_inventory FOR SELECT USING (TRUE);
CREATE POLICY "Permitir lectura publica de cupones" ON public.discount_codes FOR SELECT USING (is_active = TRUE);

-- Los clientes pueden consultar su propia orden por order_number
CREATE POLICY "Permitir lectura de ordenes por clave" ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Permitir lectura de items de orden" ON public.order_items FOR SELECT USING (TRUE);

-- Habilitar Realtime en productos e inventario (para que el frontend se actualice en vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ==============================================================================
-- 9. DATOS SEMILLA (INICIALIZACIÓN DEL CATÁLOGO DE PRODUCTOS E INVENTARIO)
-- ==============================================================================

-- Cupones
INSERT INTO public.discount_codes (code, percent, label) VALUES
('SYNICAL10', 10.0, '10% OFF BIENVENIDA ARCHIVE'),
('FIRSTDROP', 15.0, '15% OFF PRIMER DROP'),
('VIP20', 20.0, '20% OFF MIEMBRO DE LA CÁMARA')
ON CONFLICT (code) DO NOTHING;

-- Productos
INSERT INTO public.products (id, atmosphere_id, name, tagline, price, currency, color, badge, accent_color, description, images, clean_graphics, artwork_board) VALUES
('azure-horizon-zip-up', 'azure-day', 'AZURE HORIZON ZIP UP', 'Algodón Francés 480GSM // Edición Vuelo 32,000 FT', 110.00, 'USD', 'Azul Cielo Deslavado', 'ATMÓSFERA AZURE DAY', '#38bdf8', 'HOODIE CON CIERRE EN ALGODÓN FRANCÉS TERRY DE 480GSM CON LAVADO ARTESANAL STONE-WASH. BORDADO TÉCNICO DE COORDENADAS DE ALTITUD EN EL PECHO Y MONUMENTAL COMPOSICIÓN RENACENTISTA CELESTIAL EN TINTA DESGASTADA EN LA ESPALDA. HERRAJES DOBLES EN CROMO ESPEJO.', '{"front": "/hoodie_azure_front.png", "back": "/hoodie_azure_back.png"}', '{"front": "/artworks/clean_graphic_azure_front.png", "back": "/artworks/clean_graphic_azure_back.png"}', '/artworks/artwork_azure_horizon.png'),
('solar-eclipse-mineral-hoodie', 'golden-sunset', 'SOLAR ECLIPSE MINERAL HOODIE', 'Teñido Mineral Térmico 500GSM // Confección Brutalista', 115.00, 'USD', 'Tierra Cálida & Ámbar Mineral', 'ATMÓSFERA GOLDEN SUNSET', '#fb923c', 'HOODIE BRUTALISTA DE 500GSM HEAVYWEIGHT FLEECE TEÑIDO CON PIGMENTOS MINERALES TÉRMICOS. GRÁFICO ABSTRACTO DE ECLIPSE SOLAR EN SERIGRAFÍA DEGRADADA DE FUEGO A VIOLETA PROFUNDO Y DIAGRAMAS ASTROLÓGICOS. HERRAJES EN CROMO AHUMADO GUNMETAL.', '{"front": "/hoodie_sunset_front.png", "back": "/hoodie_sunset_back.png"}', '{"front": "/artworks/clean_graphic_sunset_front.png", "back": "/artworks/clean_graphic_sunset_back.png"}', '/artworks/artwork_solar_eclipse.png'),
('cyber-dusk-apex-zip-up', 'cyber-twilight', 'CYBER DUSK APEX ZIP UP', 'Bordado Reflectante 3M // Dagas en Cromo Líquido', 125.00, 'USD', 'Violeta Obsidiana Deslavado', '★ PRENDA INSIGNIA // CYBER DUSK', '#c084fc', 'NUESTRA PIEZA INSIGNIA DE ALTA INGENIERÍA. ALGODÓN TERRY PESADO DE 500GSM TRATADO CON PIGMENTO MINERAL VIOLETA OBSIDIANA. FRENTE CON DOBLE ESTRELLA CIBERNÉTICA EN CROMO LÍQUIDO Y ESPALDA CON UNA MONUMENTAL CRUZ DE DAGAS MEDIEVALES CRUZADAS EN CROMO ESPEJO 3D.', '{"front": "/hoodie_cyberdusk_front.png", "back": "/hoodie_cyberdusk_back.png"}', '{"front": "/artworks/clean_graphic_cyberdusk_front.png", "back": "/artworks/clean_graphic_cyberdusk_back.png"}', '/artworks/artwork_cyber_dusk.png'),
('void-phantom-heavy-hoodie', 'midnight-abyss', 'VOID PHANTOM HEAVY HOODIE', 'Negro Carbón Deslavado 500GSM // Gráficos Sigilism', 120.00, 'USD', 'Negro Carbón Washed', 'ATMÓSFERA MIDNIGHT ABYSS', '#0284c7', 'CONFECCIONADA EN PESADO FLEECE DE 500GSM TEÑIDO EN NEGRO CARBÓN MINERAL CON TRATAMIENTO DE ENVEJECIMIENTO ORGÁNICO. TIPOGRAFÍA BRUTALISTA SYNICAL EN EL PECHO Y CONSTELACIONES CELESTIALES RETROFUTURISTAS EN LA ESPALDA EN TINTA METÁLICA LUNAR.', '{"front": "/hoodie_void_front.png", "back": "/hoodie_void_back.png"}', '{"front": "/artworks/clean_graphic_void_front.png", "back": "/artworks/clean_graphic_void_back.png"}', '/artworks/artwork_void_phantom.png'),
('celestial-thorn-noir-hoodie', 'ethereal-rose', 'CELESTIAL THORN NOIR HOODIE', 'Rosa Carmesí en Relieve // Alas Angelicales en Cromo', 135.00, 'USD', 'Negro Carbón & Rosa Rubí', '★ EDICIÓN LIMITADA NOIR', '#f43f5e', 'EDICIÓN ESPECIAL MASTERPIECE. ALGODÓN DE MÁXIMA DENSIDAD 500GSM EN NEGRO DESLAVADO. EN EL PECHO, UNA ESCULTÓRICA ROSA EN ROJO CARMESÍ ATERCIOPELADO ENTRETEJIDA CON LA TIPOGRAFÍA GÓTICA SYNICAL Y ESPINAS CROMADAS. EN LA ESPALDA, MONUMENTALES ALAS ANGELICALES EN BLANCO PURO Y CROMO PLATINO.', '{"front": "/SYNICAL_HOODIE_NEGRA_ROSA_ROJA.png", "back": "/hoodie_celestial_noir_back.png"}', '{"front": "/artworks/clean_graphic_rose_front.png", "back": "/artworks/clean_graphic_rose_back.png"}', '/artworks/SYNICAL_HOODIE_NEGRA_ROSA_ROJA.png')
ON CONFLICT (id) DO NOTHING;

-- Inventario inicial
INSERT INTO public.product_inventory (product_id, size, stock_quantity) VALUES
('azure-horizon-zip-up', 'S', 3), ('azure-horizon-zip-up', 'M', 7), ('azure-horizon-zip-up', 'L', 4), ('azure-horizon-zip-up', 'XL', 2),
('solar-eclipse-mineral-hoodie', 'S', 2), ('solar-eclipse-mineral-hoodie', 'M', 5), ('solar-eclipse-mineral-hoodie', 'L', 3), ('solar-eclipse-mineral-hoodie', 'XL', 1),
('cyber-dusk-apex-zip-up', 'S', 5), ('cyber-dusk-apex-zip-up', 'M', 8), ('cyber-dusk-apex-zip-up', 'L', 6), ('cyber-dusk-apex-zip-up', 'XL', 3),
('void-phantom-heavy-hoodie', 'S', 4), ('void-phantom-heavy-hoodie', 'M', 6), ('void-phantom-heavy-hoodie', 'L', 5), ('void-phantom-heavy-hoodie', 'XL', 2),
('celestial-thorn-noir-hoodie', 'S', 3), ('celestial-thorn-noir-hoodie', 'M', 5), ('celestial-thorn-noir-hoodie', 'L', 4), ('celestial-thorn-noir-hoodie', 'XL', 2)
ON CONFLICT (product_id, size) DO NOTHING;
