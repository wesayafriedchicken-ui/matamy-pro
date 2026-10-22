export const ROLES_AND_USERS_SQL = `-- =========================================================================
-- Restaurant Operations Platform - Roles & Users Tables Migration
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- Project ID: ldbthhnykxrbpnhuvdxj
-- =========================================================================

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    description_ar TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    color TEXT NOT NULL DEFAULT 'brand',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create App Users Table
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    avatar TEXT,
    password TEXT,
    pin TEXT,
    last_login TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Access Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access on roles" ON public.roles;
    DROP POLICY IF EXISTS "Public access on app_users" ON public.app_users;
END $$;

CREATE POLICY "Public access on roles" ON public.roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Realtime Publications for live sync
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_users;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 6. Seed Default Roles
INSERT INTO public.roles (id, name, name_ar, description, description_ar, permissions, is_system, color)
VALUES
  ('role-admin', 'Super Admin', 'مدير النظام (Super Admin)', 'Full unrestricted access', 'صلاحيات كاملة وغير مقيدة على كافة أقسام النظام والتشغيل والماليات والمستخدمين', '["*"]'::jsonb, true, 'brand'),
  ('role-branch-manager', 'Branch Manager', 'مدير الفرع', 'Operational management', 'إدارة العمليات اليومية للفرع، الطلبات، الكاشير، المناديب، المخزون، والورديات', '["dashboard.view","orders.view","orders.create","orders.edit","kds.view","kds.manage","dispatch.view","dispatch.assign","dispatch.custody","menu.manage","inventory.view","inventory.manage","digital_store.manage","financials.view","financials.manage","shifts.manage"]'::jsonb, true, 'purple'),
  ('role-cashier', 'Cashier & POS', 'كاشير ومسؤول مبيعات', 'POS orders & billing', 'تسجيل طلبات العملاء الصالة والتيك أواي، استلام المدفوعات، وإدارة درج الكاشير', '["dashboard.view","orders.view","orders.create","orders.edit","financials.manage"]'::jsonb, true, 'blue'),
  ('role-kitchen-chef', 'Kitchen Chef', 'رئيس الطهاة والشيف', 'Kitchen ticket management', 'متابعة شاشة المطبخ KDS وتذاكر الطهي الحية، فحص وصفات ومكونات الأصناف', '["kds.view","kds.manage","inventory.view"]'::jsonb, true, 'warning'),
  ('role-dispatcher', 'Delivery Supervisor', 'مشرف التوصيل والمناديب', 'Fleet and dispatching', 'توزيع الطلبات على المناديب، تتبع خطوط السير، ومتابعة عهدة السائقين النقدية', '["orders.view","dispatch.view","dispatch.assign","dispatch.custody"]'::jsonb, true, 'success'),
  ('role-inventory-keeper', 'Inventory Specialist', 'أمين المخزن والمشتريات', 'Stock and raw materials', 'متابعة أرصدة المواد الخام بالمخزن، جرد الأصناف، وتسجيل أذون الوارد والصرف', '["inventory.view","inventory.manage"]'::jsonb, true, 'brand')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Default Users
INSERT INTO public.app_users (id, username, name, name_ar, email, phone, role_id, status, avatar, password, pin)
VALUES
  ('usr-1', 'admin', 'Omar Youssef', 'عمر يوسف', 'admin@matamy.com', '01001234567', 'role-admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '123', '1234'),
  ('usr-2', 'sara.cashier', 'Sara Ahmed', 'سارة أحمد', 'sara@matamy.com', '01112223344', 'role-cashier', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '123', '2233'),
  ('usr-3', 'chef.mahmoud', 'Mahmoud Saeed', 'محمود سعيد', 'chef@matamy.com', '01234567890', 'role-kitchen-chef', 'active', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150', '123', '3344'),
  ('usr-4', 'hani.dispatch', 'Hani Kamal', 'هاني كمال', 'dispatch@matamy.com', '01099887766', 'role-dispatcher', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '123', '4455'),
  ('usr-5', 'marwan.stock', 'Marwan Tarek', 'مروان طارق', 'marwan@matamy.com', '01556677889', 'role-inventory-keeper', 'suspended', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '123', '5566')
ON CONFLICT (id) DO NOTHING;
`;

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- Restaurant Operations Platform - Full PostgreSQL Database Schema
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

CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    description_ar TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    color TEXT NOT NULL DEFAULT 'brand',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    avatar TEXT,
    password TEXT,
    pin TEXT,
    last_login TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kds_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

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
    DROP POLICY IF EXISTS "Public access on roles" ON public.roles;
    DROP POLICY IF EXISTS "Public access on app_users" ON public.app_users;
END $$;

CREATE POLICY "Public access on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on riders" ON public.riders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on kds_tickets" ON public.kds_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on roles" ON public.roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

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
    ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_users;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Seed Initial Data
INSERT INTO public.roles (id, name, name_ar, description, description_ar, permissions, is_system, color)
VALUES
  ('role-admin', 'Super Admin', 'مدير النظام (Super Admin)', 'Full unrestricted access', 'صلاحيات كاملة وغير مقيدة على كافة أقسام النظام والتشغيل والماليات والمستخدمين', '["*"]'::jsonb, true, 'brand'),
  ('role-branch-manager', 'Branch Manager', 'مدير الفرع', 'Operational management', 'إدارة العمليات اليومية للفرع، الطلبات، الكاشير، المناديب، المخزون، والورديات', '["dashboard.view","orders.view","orders.create","orders.edit","kds.view","kds.manage","dispatch.view","dispatch.assign","dispatch.custody","menu.manage","inventory.view","inventory.manage","digital_store.manage","financials.view","financials.manage","shifts.manage"]'::jsonb, true, 'purple'),
  ('role-cashier', 'Cashier & POS', 'كاشير ومسؤول مبيعات', 'POS orders & billing', 'تسجيل طلبات العملاء الصالة والتيك أواي، استلام المدفوعات، وإدارة درج الكاشير', '["dashboard.view","orders.view","orders.create","orders.edit","financials.manage"]'::jsonb, true, 'blue'),
  ('role-kitchen-chef', 'Kitchen Chef', 'رئيس الطهاة والشيف', 'Kitchen ticket management', 'متابعة شاشة المطبخ KDS وتذاكر الطهي الحية، فحص وصفات ومكونات الأصناف', '["kds.view","kds.manage","inventory.view"]'::jsonb, true, 'warning'),
  ('role-dispatcher', 'Delivery Supervisor', 'مشرف التوصيل والمناديب', 'Fleet and dispatching', 'توزيع الطلبات على المناديب، تتبع خطوط السير، ومتابعة عهدة السائقين النقدية', '["orders.view","dispatch.view","dispatch.assign","dispatch.custody"]'::jsonb, true, 'success'),
  ('role-inventory-keeper', 'Inventory Specialist', 'أمين المخزن والمشتريات', 'Stock and raw materials', 'متابعة أرصدة المواد الخام بالمخزن، جرد الأصناف، وتسجيل أذون الوارد والصرف', '["inventory.view","inventory.manage"]'::jsonb, true, 'brand')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.app_users (id, username, name, name_ar, email, phone, role_id, status, avatar, password, pin)
VALUES
  ('usr-1', 'admin', 'Omar Youssef', 'عمر يوسف', 'admin@matamy.com', '01001234567', 'role-admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '123', '1234'),
  ('usr-2', 'sara.cashier', 'Sara Ahmed', 'سارة أحمد', 'sara@matamy.com', '01112223344', 'role-cashier', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '123', '2233'),
  ('usr-3', 'chef.mahmoud', 'Mahmoud Saeed', 'محمود سعيد', 'chef@matamy.com', '01234567890', 'role-kitchen-chef', 'active', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150', '123', '3344'),
  ('usr-4', 'hani.dispatch', 'Hani Kamal', 'هاني كمال', 'dispatch@matamy.com', '01099887766', 'role-dispatcher', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '123', '4455'),
  ('usr-5', 'marwan.stock', 'Marwan Tarek', 'مروان طارق', 'marwan@matamy.com', '01556677889', 'role-inventory-keeper', 'suspended', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '123', '5566')
ON CONFLICT (id) DO NOTHING;
`;
