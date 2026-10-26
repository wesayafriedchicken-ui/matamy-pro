import { supabase } from '@/lib/supabase';
import type { Order, MenuItem, InventoryItem, Rider, KdsTicket, Shift, Transaction, Role, AppUser, UserStatus, Employee, ShiftTask, PayrollRecord } from '@/types';

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
// ==========================================
// Employees
// ==========================================
export async function dbFetchEmployees(): Promise<Employee[] | null> {
  const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
  if (error) {
    console.warn('[Supabase] Failed to fetch employees:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    employeeNumber: String(row.employee_number || ''),
    name: String(row.name || ''),
    nameAr: String(row.name_ar || ''),
    phone: String(row.phone || ''),
    nationalId: row.national_id ? String(row.national_id) : undefined,
    roleId: row.role_id ? String(row.role_id) : undefined,
    role: String(row.role || ''),
    roleAr: String(row.role_ar || ''),
    department: row.department ? String(row.department) : undefined,
    contractType: (row.contract_type as Employee['contractType']) || 'full_time',
    hireDate: String(row.hire_date || ''),
    baseSalary: Number(row.base_salary || 0),
    hourlyRate: Number(row.hourly_rate || 0),
    overtimeRate: Number(row.overtime_rate || 0),
    monthlyIncentives: row.monthly_incentives !== null && row.monthly_incentives !== undefined ? Number(row.monthly_incentives) : 0,
    status: (row.status as Employee['status']) || 'active',
    bankAccount: row.bank_account ? String(row.bank_account) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  }));
}

export async function dbUpsertEmployee(emp: Employee): Promise<boolean> {
  const { error } = await supabase.from('employees').upsert({
    id: emp.id,
    employee_number: emp.employeeNumber,
    name: emp.name,
    name_ar: emp.nameAr,
    phone: emp.phone,
    national_id: emp.nationalId || null,
    role_id: emp.roleId || null,
    role: emp.role,
    role_ar: emp.roleAr,
    department: emp.department || null,
    contract_type: emp.contractType,
    hire_date: emp.hireDate,
    base_salary: emp.baseSalary,
    hourly_rate: emp.hourlyRate,
    overtime_rate: emp.overtimeRate,
    monthly_incentives: emp.monthlyIncentives || 0,
    status: emp.status,
    bank_account: emp.bankAccount || null,
    notes: emp.notes || null,
    avatar_url: emp.avatarUrl || null,
    created_at: emp.createdAt,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn('[Supabase] Failed to upsert employee:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteEmployee(id: string): Promise<boolean> {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete employee:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Shifts & Attendance
// ==========================================
export async function dbFetchShifts(): Promise<Shift[] | null> {
  const { data, error } = await supabase.from('shifts').select('*').order('date', { ascending: false });
  if (error) return null;
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    employeeId: row.employee_id ? String(row.employee_id) : undefined,
    employeeName: String(row.employee_name || ''),
    employeeNameAr: String(row.employee_name_ar || ''),
    role: String(row.role || ''),
    roleAr: String(row.role_ar || ''),
    startTime: String(row.start_time || ''),
    endTime: String(row.end_time || ''),
    status: row.status as Shift['status'],
    date: String(row.date || ''),
    checkIn: row.check_in ? String(row.check_in) : undefined,
    checkOut: row.check_out ? String(row.check_out) : undefined,
    hoursWorked: row.hours_worked !== null && row.hours_worked !== undefined ? Number(row.hours_worked) : undefined,
    overtimeHours: row.overtime_hours !== null && row.overtime_hours !== undefined ? Number(row.overtime_hours) : undefined,
    geofenceStatus: (row.geofence_status as Shift['geofenceStatus']) || undefined,
    notes: row.notes ? String(row.notes) : undefined,
  }));
}

export async function dbCreateShift(shift: Shift): Promise<boolean> {
  const { error } = await supabase.from('shifts').upsert({
    id: shift.id,
    employee_id: shift.employeeId || null,
    employee_name: shift.employeeName,
    employee_name_ar: shift.employeeNameAr,
    role: shift.role,
    role_ar: shift.roleAr,
    start_time: shift.startTime,
    end_time: shift.endTime,
    status: shift.status,
    date: shift.date,
    check_in: shift.checkIn || null,
    check_out: shift.checkOut || null,
    hours_worked: shift.hoursWorked || null,
    overtime_hours: shift.overtimeHours || null,
    geofence_status: shift.geofenceStatus || null,
    notes: shift.notes || null,
  });

  if (error) {
    console.warn('[Supabase] Failed to upsert shift:', error.message);
    return false;
  }
  return true;
}

export async function dbUpdateShift(shift: Shift): Promise<boolean> {
  return dbCreateShift(shift);
}

export async function dbDeleteShift(id: string): Promise<boolean> {
  const { error } = await supabase.from('shifts').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete shift:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Shift Tasks
// ==========================================
export async function dbFetchShiftTasks(): Promise<ShiftTask[] | null> {
  const { data, error } = await supabase.from('shift_tasks').select('*').order('deadline', { ascending: true });
  if (error) {
    console.warn('[Supabase] Failed to fetch shift tasks:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    bucket: row.bucket as ShiftTask['bucket'],
    labelAr: String(row.label_ar || ''),
    assignedTo: String(row.assigned_to || ''),
    employeeId: row.employee_id ? String(row.employee_id) : undefined,
    deadline: String(row.deadline || ''),
    completed: Boolean(row.completed),
    hasProof: Boolean(row.has_proof),
    note: row.note ? String(row.note) : undefined,
    date: row.date ? String(row.date) : undefined,
    proofUrl: row.proof_url ? String(row.proof_url) : undefined,
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
  }));
}

export async function dbUpsertShiftTask(task: ShiftTask): Promise<boolean> {
  const { error } = await supabase.from('shift_tasks').upsert({
    id: task.id,
    bucket: task.bucket,
    label_ar: task.labelAr,
    assigned_to: task.assignedTo,
    employee_id: task.employeeId || null,
    deadline: task.deadline,
    completed: task.completed,
    has_proof: task.hasProof,
    note: task.note || null,
    date: task.date || null,
    proof_url: task.proofUrl || null,
    completed_at: task.completedAt || null,
  });

  if (error) {
    console.warn('[Supabase] Failed to upsert shift task:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteShiftTask(id: string): Promise<boolean> {
  const { error } = await supabase.from('shift_tasks').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete shift task:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Payroll Records
// ==========================================
export async function dbFetchPayrollRecords(): Promise<PayrollRecord[] | null> {
  const { data, error } = await supabase.from('payroll_records').select('*').order('period', { ascending: false });
  if (error) {
    console.warn('[Supabase] Failed to fetch payroll records:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    employeeId: String(row.employee_id),
    employeeNameAr: String(row.employee_name_ar),
    roleAr: String(row.role_ar),
    period: String(row.period),
    baseSalary: Number(row.base_salary || 0),
    totalHours: Number(row.total_hours || 0),
    overtimeHours: Number(row.overtime_hours || 0),
    deductions: Number(row.deductions || 0),
    incentives: Number(row.incentives || 0),
    netSalary: Number(row.net_salary || 0),
    paid: Boolean(row.paid),
    paidAt: row.paid_at ? String(row.paid_at) : undefined,
    paymentMethod: (row.payment_method as PayrollRecord['paymentMethod']) || 'cash',
  }));
}

export async function dbUpsertPayrollRecord(record: PayrollRecord): Promise<boolean> {
  const { error } = await supabase.from('payroll_records').upsert({
    id: record.id,
    employee_id: record.employeeId,
    employee_name_ar: record.employeeNameAr,
    role_ar: record.roleAr,
    period: record.period,
    base_salary: record.baseSalary,
    total_hours: record.totalHours,
    overtime_hours: record.overtimeHours,
    deductions: record.deductions,
    incentives: record.incentives,
    net_salary: record.netSalary,
    paid: record.paid,
    paid_at: record.paidAt || null,
    payment_method: record.paymentMethod || 'cash',
  });

  if (error) {
    console.warn('[Supabase] Failed to upsert payroll record:', error.message);
    return false;
  }
  return true;
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

export async function dbCreateTransaction(tx: Transaction): Promise<boolean> {
  const { error } = await supabase.from('transactions').insert({
    id: tx.id,
    type: tx.type,
    category: tx.category,
    category_ar: tx.categoryAr,
    amount: tx.amount,
    description: tx.description || null,
    description_ar: tx.descriptionAr || null,
    date: tx.date || new Date().toISOString(),
    method: tx.method,
  });
  if (error) {
    console.warn('[Supabase] Failed to insert transaction:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteTransaction(id: string): Promise<boolean> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete transaction:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// Roles & Permissions
// ==========================================
export async function dbFetchRoles(): Promise<Role[] | null> {
  const { data, error } = await supabase.from('roles').select('*').order('created_at', { ascending: true });
  if (error) {
    console.warn('[Supabase] Failed to fetch roles:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    name: String(row.name),
    nameAr: String(row.name_ar),
    description: String(row.description || ''),
    descriptionAr: String(row.description_ar || ''),
    permissions: (row.permissions as string[]) || [],
    isSystem: Boolean(row.is_system),
    color: (row.color as Role['color']) || 'brand',
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  }));
}

export async function dbUpsertRole(role: Role): Promise<boolean> {
  const { error } = await supabase.from('roles').upsert({
    id: role.id,
    name: role.name,
    name_ar: role.nameAr,
    description: role.description,
    description_ar: role.descriptionAr,
    permissions: role.permissions,
    is_system: role.isSystem ?? false,
    color: role.color || 'brand',
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn('[Supabase] Failed to upsert role:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteRole(id: string): Promise<boolean> {
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete role:', error.message);
    return false;
  }
  return true;
}

// ==========================================
// System Users (Accounts)
// ==========================================
export async function dbFetchUsers(): Promise<AppUser[] | null> {
  const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: true });
  if (error) {
    console.warn('[Supabase] Failed to fetch users:', error.message);
    return null;
  }
  return (data || []).map((row: DbRow) => ({
    id: String(row.id),
    username: String(row.username),
    name: String(row.name),
    nameAr: String(row.name_ar),
    email: String(row.email),
    phone: String(row.phone || ''),
    roleId: String(row.role_id),
    status: row.status as UserStatus,
    avatar: row.avatar ? String(row.avatar) : undefined,
    password: row.password ? String(row.password) : undefined,
    pin: row.pin ? String(row.pin) : undefined,
    lastLogin: row.last_login ? String(row.last_login) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  }));
}

export async function dbUpsertUser(user: AppUser): Promise<boolean> {
  const { error } = await supabase.from('app_users').upsert({
    id: user.id,
    username: user.username,
    name: user.name,
    name_ar: user.nameAr,
    email: user.email,
    phone: user.phone,
    role_id: user.roleId,
    status: user.status,
    avatar: user.avatar || null,
    password: user.password || null,
    pin: user.pin || null,
    last_login: user.lastLogin || null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn('[Supabase] Failed to upsert user:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from('app_users').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to delete user:', error.message);
    return false;
  }
  return true;
}

export async function dbToggleUserStatus(id: string, status: UserStatus): Promise<boolean> {
  const { error } = await supabase
    .from('app_users')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.warn('[Supabase] Failed to update user status:', error.message);
    return false;
  }
  return true;
}

