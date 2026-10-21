import { supabase } from '@/lib/supabase';
import type { Order, MenuItem, InventoryItem, Rider, KdsTicket, Shift, Transaction } from '@/types';

type DbRow = Record<string, unknown>;

// ==========================================
// Orders
// ==========================================
export async function dbFetchOrders(): Promise<Order[] | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] Failed to fetch orders:', error.message);
    return null;
  }

  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    orderNumber: String(row.order_number),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    items: (row.items as Order['items']) || [],
    total: Number(row.total),
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    deliveryFee: Number(row.delivery_fee),
    status: row.status as Order['status'],
    deliveryType: row.delivery_type as Order['deliveryType'],
    channel: row.channel as Order['channel'],
    tableNumber: row.table_number ? String(row.table_number) : undefined,
    address: row.address ? String(row.address) : undefined,
    riderId: row.rider_id ? String(row.rider_id) : undefined,
    riderName: row.rider_name ? String(row.rider_name) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    notes: row.notes ? String(row.notes) : undefined,
    paymentMethod: row.payment_method as Order['paymentMethod'],
    paid: Boolean(row.paid),
  }));
}

export async function dbCreateOrder(order: Order): Promise<boolean> {
  const { error } = await supabase.from('orders').insert({
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    items: order.items,
    total: order.total,
    subtotal: order.subtotal,
    tax: order.tax,
    delivery_fee: order.deliveryFee,
    status: order.status,
    delivery_type: order.deliveryType,
    channel: order.channel,
    table_number: order.tableNumber || null,
    address: order.address || null,
    rider_id: order.riderId || null,
    rider_name: order.riderName || null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    notes: order.notes || null,
    payment_method: order.paymentMethod,
    paid: order.paid,
  });

  if (error) {
    console.warn('[Supabase] Failed to insert order:', error.message);
    return false;
  }
  return true;
}

export async function dbUpdateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    console.warn('[Supabase] Failed to update order status:', error.message);
    return false;
  }
  return true;
}

export async function dbAssignRider(orderId: string, riderId: string, riderName: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ rider_id: riderId, rider_name: riderName, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    console.warn('[Supabase] Failed to assign rider:', error.message);
    return false;
  }
  return true;
}

export async function dbUpdateOrder(order: Order): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      items: order.items,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      delivery_fee: order.deliveryFee,
      status: order.status,
      delivery_type: order.deliveryType,
      channel: order.channel,
      table_number: order.tableNumber || null,
      address: order.address || null,
      rider_id: order.riderId || null,
      rider_name: order.riderName || null,
      updated_at: new Date().toISOString(),
      notes: order.notes || null,
      payment_method: order.paymentMethod,
      paid: order.paid,
    })
    .eq('id', order.id);

  if (error) {
    console.warn('[Supabase] Failed to update order:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteOrder(orderId: string): Promise<boolean> {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) {
    console.warn('[Supabase] Failed to delete order:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Menu Items
// ==========================================
export async function dbFetchMenuItems(): Promise<MenuItem[] | null> {
  const { data, error } = await supabase.from('menu_items').select('*').order('name_ar');
  if (error) {
    console.warn('[Supabase] Failed to fetch menu items:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    name: String(row.name),
    nameAr: String(row.name_ar),
    category: String(row.category),
    categoryAr: String(row.category_ar),
    price: Number(row.price),
    cost: Number(row.cost),
    image: String(row.image || ''),
    available: Boolean(row.available),
    description: String(row.description || ''),
    descriptionAr: String(row.description_ar || ''),
    recipe: (row.recipe as MenuItem['recipe']) || [],
    prepTime: Number(row.prep_time || 15),
    barcode: String(row.barcode || ''),
    modifiers: (row.modifiers as MenuItem['modifiers']) || [],
    digitalChannels: (row.digital_channels as MenuItem['digitalChannels']) || ['website_app'],
  }));
}

export async function dbUpsertMenuItem(item: MenuItem): Promise<boolean> {
  const { error } = await supabase.from('menu_items').upsert({
    id: item.id,
    name: item.name,
    name_ar: item.nameAr,
    category: item.category,
    category_ar: item.categoryAr,
    price: item.price,
    cost: item.cost,
    image: item.image,
    available: item.available,
    description: item.description,
    description_ar: item.descriptionAr,
    recipe: item.recipe,
    prep_time: item.prepTime,
    barcode: item.barcode,
    modifiers: item.modifiers,
    digital_channels: item.digitalChannels,
  });
  if (error) {
    console.warn('[Supabase] Failed to upsert menu item:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteMenuItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete menu item:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Inventory Items
// ==========================================
export async function dbFetchInventory(): Promise<InventoryItem[] | null> {
  const { data, error } = await supabase.from('inventory_items').select('*').order('name_ar');
  if (error) {
    console.warn('[Supabase] Failed to fetch inventory:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    nameAr: String(row.name_ar),
    unit: row.unit as InventoryItem['unit'],
    unitAr: String(row.unit_ar),
    costPerUnit: Number(row.cost_per_unit),
    currentStock: Number(row.current_stock),
    minReorderLevel: Number(row.min_reorder_level),
    maxStock: Number(row.max_stock),
    supplier: String(row.supplier || ''),
    lastRestocked: String(row.last_restocked || ''),
    category: String(row.category),
    categoryAr: String(row.category_ar),
  }));
}

export async function dbUpsertInventoryItem(item: InventoryItem): Promise<boolean> {
  const { error } = await supabase.from('inventory_items').upsert({
    id: item.id,
    sku: item.sku,
    name: item.name,
    name_ar: item.nameAr,
    unit: item.unit,
    unit_ar: item.unitAr,
    cost_per_unit: item.costPerUnit,
    current_stock: item.currentStock,
    min_reorder_level: item.minReorderLevel,
    max_stock: item.maxStock,
    supplier: item.supplier,
    last_restocked: item.lastRestocked,
    category: item.category,
    category_ar: item.categoryAr,
  });
  if (error) {
    console.warn('[Supabase] Failed to upsert inventory item:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteInventoryItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete inventory item:', error.message);
    return false;
  }
  return true;
}

export async function dbAdjustStock(id: string, newStock: number): Promise<boolean> {
  const { error } = await supabase
    .from('inventory_items')
    .update({ current_stock: newStock, last_restocked: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to adjust stock:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Riders
// ==========================================
export async function dbFetchRiders(): Promise<Rider[] | null> {
  const { data, error } = await supabase.from('riders').select('*').order('name_ar');
  if (error) {
    console.warn('[Supabase] Failed to fetch riders:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    name: String(row.name),
    nameAr: String(row.name_ar),
    phone: String(row.phone),
    status: row.status as Rider['status'],
    currentOrders: Number(row.current_orders),
    rating: Number(row.rating),
    zone: String(row.zone),
    zoneAr: String(row.zone_ar),
  }));
}

export async function dbCreateRider(rider: Rider): Promise<boolean> {
  const { error } = await supabase.from('riders').upsert({
    id: rider.id,
    name: rider.name,
    name_ar: rider.nameAr,
    phone: rider.phone,
    status: rider.status,
    current_orders: rider.currentOrders,
    rating: rider.rating,
    zone: rider.zone,
    zone_ar: rider.zoneAr,
  });
  if (error) {
    console.warn('[Supabase] Failed to upsert rider:', error.message);
    return false;
  }
  return true;
}

export async function dbUpdateRider(rider: Rider): Promise<boolean> {
  const { error } = await supabase.from('riders').upsert({
    id: rider.id,
    name: rider.name,
    name_ar: rider.nameAr,
    phone: rider.phone,
    status: rider.status,
    current_orders: rider.currentOrders,
    rating: rider.rating,
    zone: rider.zone,
    zone_ar: rider.zoneAr,
  });
  if (error) {
    console.warn('[Supabase] Failed to update rider:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteRider(id: string): Promise<boolean> {
  const { error } = await supabase.from('riders').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete rider:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// KDS Tickets
// ==========================================
export async function dbFetchKdsTickets(): Promise<KdsTicket[] | null> {
  const { data, error } = await supabase.from('kds_tickets').select('*').order('created_at', { ascending: true });
  if (error) {
    console.warn('[Supabase] Failed to fetch KDS tickets:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    orderNumber: String(row.order_number),
    items: (row.items as KdsTicket['items']) || [],
    createdAt: String(row.created_at),
    status: row.status as KdsTicket['status'],
    priority: Boolean(row.priority),
    station: String(row.station),
    stationAr: String(row.station_ar),
  }));
}

export async function dbAdvanceKdsTicket(ticketId: string): Promise<boolean> {
  const { error } = await supabase.from('kds_tickets').delete().eq('id', ticketId);
  if (error) {
    console.warn('[Supabase] Failed to advance KDS ticket:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Shifts & Transactions
// ==========================================
export async function dbFetchShifts(): Promise<Shift[] | null> {
  const { data, error } = await supabase.from('shifts').select('*').order('date', { ascending: false });
  if (error) return null;
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    employeeName: String(row.employee_name),
    employeeNameAr: String(row.employee_name_ar),
    role: String(row.role),
    roleAr: String(row.role_ar),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    status: row.status as Shift['status'],
    date: String(row.date),
  }));
}

export async function dbFetchTransactions(): Promise<Transaction[] | null> {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
  if (error) return null;
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    type: row.type as Transaction['type'],
    category: String(row.category),
    categoryAr: String(row.category_ar),
    amount: Number(row.amount),
    description: String(row.description || ''),
    descriptionAr: String(row.description_ar || ''),
    date: String(row.date),
    method: row.method as Transaction['method'],
  }));
}
