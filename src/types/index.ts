export type OrderStatus =
  | 'new'
  | 'in_kitchen'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type DeliveryType = 'dine_in' | 'takeaway' | 'delivery' | 'talabat';

export type OrderChannel = 'pos' | 'app' | 'website' | 'phone' | 'talabat';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  nameAr: string;
  quantity: number;
  price: number;
  notes?: string;
  modifiers?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  channel: OrderChannel;
  tableNumber?: string;
  address?: string;
  deliveryZoneId?: string;
  deliveryZoneCode?: string;
  deliveryZoneAr?: string;
  deliveryEstimatedTime?: string;
  deliveryDistanceKm?: string;
  riderId?: string;
  riderName?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'online';
  paid: boolean;
}

export type ModifierType = 'single' | 'multi';

export interface ModifierOption {
  id: string;
  nameAr: string;
  price: number;
}

export interface Modifier {
  id: string;
  nameAr: string;
  type: ModifierType;
  required: boolean;
  options: ModifierOption[];
}

export type DigitalChannel = 'website_app' | 'dine_in_only' | 'delivery_only';

export interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  price: number;
  cost: number;
  image: string;
  available: boolean;
  description: string;
  descriptionAr: string;
  recipe: RecipeIngredient[];
  prepTime: number;
  barcode: string;
  modifiers: Modifier[];
  digitalChannels: DigitalChannel[];
}

export interface RecipeIngredient {
  inventoryId: string;
  name: string;
  nameAr: string;
  quantity: number;
  unit: string;
  unitAr: string;
  cost: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  nameAr: string;

  // وحدة الشراء والتخزين بالمخزن (Purchase / Storage Unit)
  purchaseUnit?: string;
  purchaseUnitAr?: string;
  costPerPurchaseUnit?: number;

  // وحدة الاستهلاك والوصفات (Recipe / Base Unit)
  recipeUnit?: string;
  recipeUnitAr?: string;
  conversionFactor?: number; // كم وحدة استهلاك داخل وحدة الشراء
  costPerRecipeUnit?: number; // تكلفة وحدة الاستهلاك (تحسب تلقائياً)

  // التوافق العام مع أجزاء النظام
  unit: string;
  unitAr: string;
  costPerUnit: number;
  currentStock: number;
  minReorderLevel: number;
  maxStock: number;
  supplier: string;
  lastRestocked: string;
  category: string;
  categoryAr: string;
  packageDetails?: string;
}

export interface InventoryLogDiff {
  field: string;
  fieldAr: string;
  oldVal: string | number;
  newVal: string | number;
}

export interface InventoryLog {
  id: string;
  inventoryId: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType: 'update' | 'adjust' | 'restock' | 'price_change' | 'create' | 'note';
  title: string;
  details: string;
  diff?: InventoryLogDiff[];
}

export interface Rider {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentOrders: number;
  rating: number;
  zone: string;
  zoneAr: string;
  vehicleType?: 'motorcycle' | 'car' | 'bicycle' | 'scooter';
  plateNumber?: string;
  vehicleModel?: string;
  custodyLimit?: number;
  currentCustody?: number;
  avatarUrl?: string;
  team?: string;
  provider?: string;
  hiringDate?: string;
  nationalId?: string;
  enrollId?: string;
}

export interface KdsTicket {
  id: string;
  orderNumber: string;
  items: {
    nameAr: string;
    quantity: number;
    notes?: string;
    modifiers?: string[];
  }[];
  createdAt: string;
  status: 'preparing' | 'ready';
  priority: boolean;
  station: string;
  stationAr: string;
}

export type PageId =
  | 'dashboard'
  | 'live-orders'
  | 'kds'
  | 'dispatch'
  | 'menu'
  | 'inventory'
  | 'digital-store'
  | 'financials'
  | 'hr';

export interface Shift {
  id: string;
  employeeName: string;
  employeeNameAr: string;
  role: string;
  roleAr: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'absent';
  date: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  categoryAr: string;
  amount: number;
  description: string;
  descriptionAr: string;
  date: string;
  method: 'cash' | 'card' | 'online';
}

export interface AppNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'order' | 'delivery' | 'inventory' | 'kds' | 'finance' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface OfficialDeliveryZone {
  id: string;
  zoneCode: string; // '01', '02', etc.
  zoneNumber: number; // 1, 2, etc.
  areaNameAr: string; // e.g. 'شارع 9 - محيط الفرع'
  areaNameEn: string;
  deliveryFee: number; // in EGP
  deliveryTimeAr: string; // 'غير محدد'
  distanceKm: string; // e.g. '0 - 1'
  distanceMinKm: number;
  distanceMaxKm: number;
  isActive: boolean;
  notes?: string;
}

// ==========================================
// Users & Roles Permissions
// ==========================================
export type PermissionModule =
  | 'dashboard'
  | 'orders'
  | 'kds'
  | 'dispatch'
  | 'menu'
  | 'inventory'
  | 'digital_store'
  | 'financials'
  | 'shifts'
  | 'users_roles';

export interface PermissionDefinition {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  module: PermissionModule;
  descriptionAr: string;
}

export interface Role {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  permissions: string[]; // List of permission codes
  isSystem?: boolean;
  color?: 'brand' | 'blue' | 'purple' | 'success' | 'warning' | 'danger';
  createdAt: string;
  updatedAt?: string;
}

export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  roleId: string;
  status: UserStatus;
  avatar?: string;
  password?: string;
  pin?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

