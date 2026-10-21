export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- Restaurant Operations Platform - Supabase PostgreSQL Database Schema
-- Schema & Seed Data for project: ldbthhnykxrbpnhuvdxj
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total NUMERIC NOT NULL DEFAULT 0,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new',
    delivery_type TEXT NOT NULL DEFAULT 'dine_in',
    channel TEXT NOT NULL DEFAULT 'pos',
    table_number TEXT,
    address TEXT,
    rider_id TEXT,
    rider_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    paid BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    category TEXT NOT NULL,
    category_ar TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    cost NUMERIC NOT NULL DEFAULT 0,
    image TEXT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    description_ar TEXT,
    recipe JSONB DEFAULT '[]'::jsonb,
    prep_time INTEGER NOT NULL DEFAULT 15,
    barcode TEXT,
    modifiers JSONB DEFAULT '[]'::jsonb,
    digital_channels JSONB DEFAULT '["website_app"]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_ar TEXT NOT NULL,
    cost_per_unit NUMERIC NOT NULL DEFAULT 0,
    current_stock NUMERIC NOT NULL DEFAULT 0,
    min_reorder_level NUMERIC NOT NULL DEFAULT 0,
    max_stock NUMERIC NOT NULL DEFAULT 0,
    supplier TEXT,
    last_restocked TIMESTAMPTZ DEFAULT NOW(),
    category TEXT NOT NULL,
    category_ar TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.riders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    current_orders INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC NOT NULL DEFAULT 5.0,
    zone TEXT NOT NULL,
    zone_ar TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.kds_tickets (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'preparing',
    priority BOOLEAN NOT NULL DEFAULT FALSE,
    station TEXT NOT NULL DEFAULT 'Grill',
    station_ar TEXT NOT NULL DEFAULT 'جريل ومشاوي'
);

CREATE TABLE IF NOT EXISTS public.shifts (
    id TEXT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    employee_name_ar TEXT NOT NULL,
    role TEXT NOT NULL,
    role_ar TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    category_ar TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    description_ar TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    method TEXT NOT NULL DEFAULT 'cash'
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kds_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any and re-create public access policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access on orders" ON public.orders;
    DROP POLICY IF EXISTS "Public access on menu_items" ON public.menu_items;
    DROP POLICY IF EXISTS "Public access on inventory_items" ON public.inventory_items;
    DROP POLICY IF EXISTS "Public access on riders" ON public.riders;
    DROP POLICY IF EXISTS "Public access on kds_tickets" ON public.kds_tickets;
    DROP POLICY IF EXISTS "Public access on shifts" ON public.shifts;
    DROP POLICY IF EXISTS "Public access on transactions" ON public.transactions;
END $$;

CREATE POLICY "Public access on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on riders" ON public.riders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on kds_tickets" ON public.kds_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable Realtime Publications for live sync
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kds_tickets;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Seed Initial Data
INSERT INTO public.riders (id, name, name_ar, phone, status, current_orders, rating, zone, zone_ar)
VALUES 
  ('r1', 'Hassan Mahmoud', 'حسن محمود', '01011112222', 'busy', 2, 4.8, 'Nasr City', 'مدينة نصر'),
  ('r2', 'Khaled Ibrahim', 'خالد إبراهيم', '01033334444', 'available', 0, 4.9, 'Heliopolis', 'مصر الجديدة'),
  ('r3', 'Tamer Youssef', 'تامر يوسف', '01055556666', 'busy', 1, 4.6, 'Maadi', 'المعادي'),
  ('r4', 'Amr Mostafa', 'عمرو مصطفى', '01077778888', 'offline', 0, 4.7, 'New Cairo', 'التجمع الخامس')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_items (id, name, name_ar, category, category_ar, price, cost, image, available, description, description_ar, prep_time, barcode, recipe, modifiers, digital_channels)
VALUES
  ('m1', 'Classic Burger', 'برجر كلاسيك', 'burgers', 'برجر وساندوتشات', 85, 38, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', true, 'Juicy beef patty with fresh lettuce, tomatoes, and secret sauce', 'شريحة لحم بقري طازجة مع الخس والطماطم وصوص الشيف الخاص', 12, '62210001', '[{"inventoryId":"inv-1","name":"Beef Patty","nameAr":"لحم بقري مفروم","quantity":0.15,"unit":"kg","unitAr":"كجم","cost":27},{"inventoryId":"inv-2","name":"Burger Buns","nameAr":"خبز برجر","quantity":1,"unit":"pcs","unitAr":"قطعة","cost":4},{"inventoryId":"inv-4","name":"Cheddar Cheese","nameAr":"جبنة شيدر","quantity":0.03,"unit":"kg","unitAr":"كجم","cost":7}]', '[{"id":"mod-1","nameAr":"إضافات البرجر","type":"multi","required":false,"options":[{"id":"opt-1","nameAr":"اكسترا جبنة","price":15},{"id":"opt-2","nameAr":"اكسترا صوص","price":10},{"id":"opt-3","nameAr":"بيكون بقري","price":25}]}]', '["website_app","dine_in_only","delivery_only"]'),
  ('m2', 'Chicken Shawarma', 'شاورما دجاج', 'shawarma', 'شاورما', 55, 22, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', true, 'Marinated spiced chicken slices with garlic paste and pickles in saj bread', 'شرائح دجاج متبلة مع صوص الثومية والمخلل في خبز الصاج الطازج', 8, '62210002', '[{"inventoryId":"inv-3","name":"Chicken Breast","nameAr":"صدور دجاج","quantity":0.18,"unit":"kg","unitAr":"كجم","cost":18},{"inventoryId":"inv-5","name":"Garlic Sauce","nameAr":"ثومية","quantity":0.05,"unit":"kg","unitAr":"كجم","cost":4}]', '[{"id":"mod-2","nameAr":"نوع الخبز","type":"single","required":true,"options":[{"id":"opt-4","nameAr":"خبز صاج","price":0},{"id":"opt-5","nameAr":"خبز سوري كبير","price":10}]}]', '["website_app","dine_in_only","delivery_only"]'),
  ('m3', 'French Fries', 'بطاطس مقلية', 'sides', 'مقبلات وأطباق جانبية', 35, 12, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400', true, 'Golden crispy french fries seasoned with our house spice mix', 'بطاطس مقرمشة ذهبية متبلة ببهاراتنا الخاصة', 6, '62210003', '[]', '[]', '["website_app","dine_in_only","delivery_only"]'),
  ('m4', 'Caesar Salad', 'سلطة سيزر', 'salads', 'سلطات ومقبلات خضراء', 60, 24, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', true, 'Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing', 'خس روماني طازج مع جبن البارميزان ومكعبات الخبز المحمص وصوص السيزر', 7, '62210004', '[]', '[]', '["website_app","dine_in_only","delivery_only"]'),
  ('m5', 'Cola', 'كولا', 'drinks', 'مشروبات باردة', 20, 11, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', true, 'Refreshing chilled cola 330ml can', 'مشروب غازي منعش 330 مل بارد', 1, '62210005', '[]', '[]', '["website_app","dine_in_only","delivery_only"]'),
  ('m6', 'Pizza Margherita', 'بيتزا مارجريتا', 'pizza', 'بيتزا إيطالية', 120, 48, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400', true, 'Classic Neapolitan pizza with mozzarella, tomato sauce, and basil', 'بيتزا نابوليتان كلاسيكية مع جبن الموزاريلا وصلصة الطماطم الإيطالية والريحان', 15, '62210006', '[]', '[]', '["website_app","dine_in_only","delivery_only"]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.inventory_items (id, sku, name, name_ar, unit, unit_ar, cost_per_unit, current_stock, min_reorder_level, max_stock, supplier, last_restocked, category, category_ar)
VALUES
  ('inv-1', 'SP-001', 'Fries Seasoning - 1kg', 'توابل فرايز – كيلو', 'kg', 'كيلو', 250, 25, 5, 50, 'بيور ميكس', NOW() - INTERVAL '6 hours', 'spices', 'التوابل'),
  ('inv-2', 'SP-002', 'Original Seasoning - 1kg', 'توابل اوريجينال – كيلو', 'kg', 'كيلو', 250, 20, 5, 50, 'بيور ميكس', NOW() - INTERVAL '6 hours', 'spices', 'التوابل'),
  ('inv-3', 'SP-003', 'Burger Seasoning - 1kg', 'توابل برجر – كيلو', 'kg', 'كيلو', 250, 30, 5, 60, 'بيور ميكس', NOW() - INTERVAL '6 hours', 'spices', 'التوابل'),
  ('inv-4', 'SAU-001', 'Texas Sauce - Gallon 3kg', 'تكساس – جالون 3 كجم', 'gallon', 'جالون 3 كجم', 450, 12, 3, 30, 'جود فرنسا', NOW() - INTERVAL '8 hours', 'sauces', 'الصوصات'),
  ('inv-5', 'SAU-002', 'Cheddar Milkana - Bag 900g', 'شيدر ميلكانا – كيس 900 جم', 'bag', 'كيس 900 جم', 210, 25, 6, 50, 'كانا', NOW() - INTERVAL '10 hours', 'sauces', 'الصوصات'),
  ('inv-6', 'SAU-003', 'Ranch Sauce - Gallon', 'رانش – جالون', 'gallon', 'جالون', 635, 8, 2, 20, 'GSF', NOW() - INTERVAL '12 hours', 'sauces', 'الصوصات'),
  ('inv-7', 'SAU-004', 'Mayonnaise - Gallon 3kg', 'مايونيز – جالون 3 كجم', 'gallon', 'جالون 3 كجم', 260, 18, 4, 40, 'هاينز', NOW() - INTERVAL '8 hours', 'sauces', 'الصوصات'),
  ('inv-8', 'SAU-005', 'Ketchup - Gallon 3kg', 'كاتشب – جالون 3 كجم', 'gallon', 'جالون 3 كجم', 220, 15, 4, 40, 'هاينز', NOW() - INTERVAL '8 hours', 'sauces', 'الصوصات'),
  ('inv-9', 'SAU-006', 'Honey Mustard - Pack 3.4kg', 'هاني ماستر – عبوه 3.4 كجم', 'pack', 'عبوه 3.4 كجم', 340, 10, 3, 25, 'جود فرنسا', NOW() - INTERVAL '13 hours', 'sauces', 'الصوصات'),
  ('inv-10', 'SAU-007', 'Sweet Chili - Pack 3.4kg', 'سويت تشيلي – عبوه 3.4 كجم', 'pack', 'عبوه 3.4 كجم', 260, 8, 2, 25, 'كانا', NOW() - INTERVAL '13 hours', 'sauces', 'الصوصات'),
  ('inv-11', 'SAU-008', 'BBQ Sauce - 4kg', 'باربكيو – 4 كجم', 'pack', 'عبوه 4 كجم', 400, 12, 3, 30, 'GSF', NOW() - INTERVAL '12 hours', 'sauces', 'الصوصات'),
  ('inv-12', 'SAU-009', 'Pickled Cucumber - Gallon', 'خيار مخلل – جالون', 'gallon', 'جالون', 550, 14, 3, 30, 'إنرو', NOW() - INTERVAL '10 hours', 'sauces', 'الصوصات'),
  ('inv-13', 'BRD-001', 'Tortilla Bread - Bag 25 pcs', 'تورتيلا – كيس 25 قطعه', 'bag', 'كيس 25 قطعه', 50, 40, 10, 100, 'ريتش باك', NOW() - INTERVAL '4 hours', 'bread', 'العيش'),
  ('inv-14', 'BRD-002', 'Rich Bun 5 Inch - Basket 24 pcs', 'عيش ريتش 5 بوصه – باسكت 24 قطعه', 'basket', 'باسكت 24 قطعه', 174, 28, 8, 70, 'ريتش باك', NOW() - INTERVAL '4 hours', 'bread', 'العيش'),
  ('inv-15', 'BRD-003', 'Fino Bread - Basket 10 pcs', 'عيش فينا – باسكت 10 قطع', 'basket', 'باسكت 10 قطع', 50, 22, 6, 60, 'بري بور', NOW() - INTERVAL '4 hours', 'bread', 'العيش'),
  ('inv-16', 'BRD-004', 'Meal Bread - Basket 100 pcs', 'عيش الوجبات – باسكت 100 قطعه', 'basket', 'باسكت 100 قطعه', 325, 15, 5, 50, 'ريتش باك', NOW() - INTERVAL '4 hours', 'bread', 'العيش'),
  ('inv-17', 'BRD-005', 'Brioche Bun 4.5 Inch - Basket 24 pcs', 'بريوش 4.5 بوصه للفطار – باسكت 24 قطعه', 'basket', 'باسكت 24 قطعه', 195, 20, 6, 60, 'ريتش باك', NOW() - INTERVAL '4 hours', 'bread', 'العيش'),
  ('inv-18', 'PRT-001', 'Hot Dog - Bag', 'هوت دوج – كيس', 'bag', 'كيس', 170, 30, 8, 70, 'هوت دوج مجمد', NOW() - INTERVAL '6 hours', 'proteins', 'البروتينات'),
  ('inv-19', 'PRT-002', 'Raw Pane - 1kg', 'بانيه خام – كيلو', 'kg', 'كيلو', 220, 45, 12, 100, 'مورد غير معروف', NOW() - INTERVAL '6 hours', 'proteins', 'البروتينات'),
  ('inv-20', 'PRT-003', 'Turkey - Bag 1kg', 'تركي – كيس 1 كجم', 'bag', 'كيس 1 كجم', 280, 16, 5, 40, 'روز', NOW() - INTERVAL '8 hours', 'proteins', 'البروتينات'),
  ('inv-21', 'PRT-004', 'Bacon - 1kg', 'بيكون – كيلو', 'kg', 'كيلو', 450, 14, 4, 35, 'سمارت فود', NOW() - INTERVAL '8 hours', 'proteins', 'البروتينات'),
  ('inv-22', 'PRT-005', 'Meat - 1kg', 'لحمه – كيلو', 'kg', 'كيلو', 450, 35, 10, 90, 'غير محدد حاليًا', NOW() - INTERVAL '6 hours', 'proteins', 'البروتينات'),
  ('inv-23', 'PRT-006', 'Burger - 1kg', 'برجر – كيلو', 'kg', 'كيلو', 400, 40, 10, 100, 'غير محدد حاليًا', NOW() - INTERVAL '6 hours', 'proteins', 'البروتينات'),
  ('inv-24', 'PRT-007', 'Sausage - 1kg', 'سجق – كيلو', 'kg', 'كيلو', 400, 25, 6, 60, 'أسواق الغنيمي', NOW() - INTERVAL '6 hours', 'proteins', 'البروتينات'),
  ('inv-25', 'DRY-001', 'Cheddar Cheese', 'جبنه شيدر', 'kg', 'كيلو', 0, 20, 5, 50, 'مورد عطاره', NOW() - INTERVAL '8 hours', 'dairy', 'الألبان والجبن'),
  ('inv-26', 'DRY-002', 'Milk - 1kg', 'لبن – كيلو', 'kg', 'كيلو', 45, 30, 10, 80, 'بخيرو', NOW() - INTERVAL '5 hours', 'dairy', 'الألبان والجبن'),
  ('inv-27', 'DRY-003', 'Butter - 1 piece', 'زبده – واحده', 'pcs', 'واحده', 220, 18, 5, 50, 'غير محدد حاليًا', NOW() - INTERVAL '8 hours', 'dairy', 'الألبان والجبن'),
  ('inv-28', 'DRY-004', 'Roumy Cheese - 1kg', 'جبنة رومي – كيلو', 'kg', 'كيلو', 300, 15, 4, 40, 'مورد عطارة', NOW() - INTERVAL '8 hours', 'dairy', 'الألبان والجبن'),
  ('inv-29', 'DRY-005', 'Egg - 1 piece', 'بيضه – واحده', 'pcs', 'واحده', 6, 150, 30, 400, 'غير محدد حاليًا', NOW() - INTERVAL '3 hours', 'dairy', 'الألبان والجبن'),
  ('inv-30', 'VEG-001', 'Potatoes - Carton 10kg', 'بطاطس – كرتونه 10 كجم', 'carton', 'كرتونه 10 كجم', 570, 25, 6, 70, 'هوت كريسبي – كرينكل', NOW() - INTERVAL '4 hours', 'vegetables', 'الخضار والإضافات'),
  ('inv-31', 'VEG-002', 'Mushroom - Can', 'مشروم – علبه', 'can', 'علبه', 75, 35, 10, 90, 'توليدو', NOW() - INTERVAL '10 hours', 'vegetables', 'الخضار والإضافات'),
  ('inv-32', 'VEG-003', 'Lettuce - 1 unit', 'خس – وحده', 'pcs', 'وحده', 5, 50, 15, 120, 'مورد خضروات', NOW() - INTERVAL '3 hours', 'vegetables', 'الخضار والإضافات'),
  ('inv-33', 'VEG-004', 'Onion - 1kg', 'بصل – كيلو', 'kg', 'كيلو', 20, 40, 10, 100, 'مورد خضروات', NOW() - INTERVAL '3 hours', 'vegetables', 'الخضار والإضافات'),
  ('inv-34', 'VEG-005', 'Pepper - 1kg', 'فلفل – كيلو', 'kg', 'كيلو', 40, 28, 8, 70, 'مورد خضروات', NOW() - INTERVAL '3 hours', 'vegetables', 'الخضار والإضافات'),
  ('inv-35', 'VEG-006', 'Cooking Oil - Jerrycan 20L', 'زيت – جيركن 20 لتر', 'jerrycan', 'جيركن 20 لتر', 1650, 12, 3, 35, 'زيت الندى', NOW() - INTERVAL '7 hours', 'vegetables', 'الخضار والإضافات'),
  ('inv-36', 'RAW-001', 'Pasta - 1kg', 'مكرونه – كيلو', 'kg', 'كيلو', 40, 50, 15, 120, 'مورد عطاره', NOW() - INTERVAL '12 hours', 'raw_materials', 'الخامات'),
  ('inv-37', 'RAW-002', 'Pastrami - 1kg', 'بسطرمه – كيلو', 'kg', 'كيلو', 400, 10, 3, 30, 'غير محدد حاليًا', NOW() - INTERVAL '12 hours', 'raw_materials', 'الخامات'),
  ('inv-38', 'PKG-001', 'Butter Paper - 1 sheet', 'ورقه زبده – ورقه', 'sheet', 'ورقه', 1, 2000, 400, 5000, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل'),
  ('inv-39', 'PKG-002', 'Silver Foil Sheet - 1 sheet', 'ورقه سيلفر – ورقه', 'sheet', 'ورقه', 2, 1500, 300, 4000, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل'),
  ('inv-40', 'PKG-003', 'Packaging Box - 1 unit', 'علبه – واحده', 'pcs', 'واحده', 7, 500, 100, 1500, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل'),
  ('inv-41', 'PKG-004', 'Fibra Roll - 1 roll', 'بكره فيبرا – بكره', 'roll', 'بكره', 330, 15, 4, 45, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل'),
  ('inv-42', 'PKG-005', 'Cashier Roll - 1 roll', 'بكره كاشير – بكره', 'roll', 'بكره', 25, 50, 10, 120, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل'),
  ('inv-43', 'PKG-006', 'Fork - 1 unit', 'شوكه – واحده', 'pcs', 'واحده', 0.75, 1000, 250, 3000, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل'),
  ('inv-44', 'PKG-007', 'Water Cup/Bottle - 1 unit', 'علبه مياه – واحده', 'pcs', 'واحده', 5, 220, 50, 600, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل'),
  ('inv-45', 'PKG-008', 'Fries Basket - 1 unit', 'باسكت فرايز – واحده', 'pcs', 'واحده', 7, 350, 80, 1000, 'تاين', NOW() - INTERVAL '24 hours', 'packaging', 'الباكينج ومستلزمات التشغيل')
ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  unit = EXCLUDED.unit,
  unit_ar = EXCLUDED.unit_ar,
  cost_per_unit = EXCLUDED.cost_per_unit,
  current_stock = EXCLUDED.current_stock,
  min_reorder_level = EXCLUDED.min_reorder_level,
  max_stock = EXCLUDED.max_stock,
  supplier = EXCLUDED.supplier,
  category = EXCLUDED.category,
  category_ar = EXCLUDED.category_ar;

INSERT INTO public.orders (id, order_number, customer_name, customer_phone, total, subtotal, tax, delivery_fee, status, delivery_type, channel, table_number, address, rider_id, rider_name, created_at, updated_at, payment_method, paid, items)
VALUES
  ('ord-1', '#1042', 'أحمد محمد', '01012345678', 267, 245, 22, 0, 'new', 'dine_in', 'pos', '5', NULL, NULL, NULL, NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes', 'cash', false, '[{"id":"i1","menuItemId":"m1","name":"Classic Burger","nameAr":"برجر كلاسيك","quantity":2,"price":85,"notes":"بدون بصل","modifiers":["اكسترا صوص"]},{"id":"i2","menuItemId":"m3","name":"French Fries","nameAr":"بطاطس مقلية","quantity":1,"price":35},{"id":"i3","menuItemId":"m5","name":"Cola","nameAr":"كولا","quantity":2,"price":20}]'),
  ('ord-2', '#1043', 'سارة علي', '01098765432', 248, 225, 23, 0, 'new', 'takeaway', 'app', NULL, NULL, NULL, NULL, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes', 'online', true, '[{"id":"i4","menuItemId":"m2","name":"Chicken Shawarma","nameAr":"شاورما دجاج","quantity":3,"price":55,"modifiers":["سبايسي"]},{"id":"i5","menuItemId":"m4","name":"Caesar Salad","nameAr":"سلطة سيزر","quantity":1,"price":60}]'),
  ('ord-3', '#1044', 'محمود إبراهيم', '01122334455', 233, 205, 18, 10, 'in_kitchen', 'delivery', 'website', NULL, 'مدينة نصر، شارع عباس العقاد', NULL, NULL, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '12 minutes', 'card', true, '[{"id":"i6","menuItemId":"m1","name":"Classic Burger","nameAr":"برجر كلاسيك","quantity":1,"price":85,"notes":"بدون بصل","modifiers":["اكسترا جبنة"]},{"id":"i7","menuItemId":"m6","name":"Pizza Margherita","nameAr":"بيتزا مارجريتا","quantity":1,"price":120}]'),
  ('ord-5', '#1046', 'عمر شريف', '01044556677', 315, 285, 20, 10, 'out_for_delivery', 'delivery', 'phone', NULL, 'مصر الجديدة، ميدان الحجاز', 'r1', 'حسن محمود', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '10 minutes', 'cash', false, '[{"id":"i10","menuItemId":"m1","name":"Classic Burger","nameAr":"برجر كلاسيك","quantity":2,"price":85},{"id":"i11","menuItemId":"m6","name":"Pizza Margherita","nameAr":"بيتزا مارجريتا","quantity":1,"price":120}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kds_tickets (id, order_number, status, priority, station, station_ar, created_at, items)
VALUES
  ('kds-1', '#1044', 'preparing', true, 'Grill', 'جريل ومشاوي', NOW() - INTERVAL '15 minutes', '[{"nameAr":"برجر كلاسيك","quantity":1,"notes":"بدون بصل","modifiers":["اكسترا جبنة"]},{"nameAr":"بيتزا مارجريتا","quantity":1}]'),
  ('kds-2', '#1045', 'preparing', false, 'Shawarma', 'محطة الشاورما', NOW() - INTERVAL '10 minutes', '[{"nameAr":"شاورما دجاج","quantity":2},{"nameAr":"بطاطس مقلية","quantity":2,"modifiers":["كبير"]}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.shifts (id, employee_name, employee_name_ar, role, role_ar, start_time, end_time, status, date)
VALUES
  ('sh-1', 'Mahmoud Saeed', 'محمود سعيد', 'Head Chef', 'رئيس الطهاة', '08:00', '16:00', 'active', CURRENT_DATE::text),
  ('sh-2', 'Kareem Tarek', 'كريم طارق', 'Sous Chef', 'طاهي مساعد', '08:00', '16:00', 'active', CURRENT_DATE::text),
  ('sh-3', 'Nader Samy', 'نادر سامي', 'Cashier', 'كاشير رئيسي', '09:00', '17:00', 'active', CURRENT_DATE::text),
  ('sh-4', 'Hassan Mahmoud', 'حسن محمود', 'Delivery Rider', 'سائق توصيل', '10:00', '18:00', 'active', CURRENT_DATE::text)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transactions (id, type, category, category_ar, amount, description, description_ar, date, method)
VALUES
  ('tx-1', 'income', 'sales', 'مبيعات طلبات', 2670, 'POS & Online Orders Batch #1', 'مبيعات الكاشير والطلبات الإلكترونية', NOW() - INTERVAL '2 hours', 'cash'),
  ('tx-2', 'expense', 'inventory', 'مشتريات مخزون', 850, 'Fresh Poultry Batch Restock', 'شراء دفعة دواجن طازجة', NOW() - INTERVAL '4 hours', 'online'),
  ('tx-3', 'income', 'sales', 'مبيعات طلبات', 1890, 'POS Lunch Rush Sales', 'مبيعات طلبات الغداء', NOW() - INTERVAL '1 hour', 'card')
ON CONFLICT (id) DO NOTHING;
`;
