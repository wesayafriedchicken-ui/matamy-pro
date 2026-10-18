export type OrderStatus =
  | 'new'
  | 'in_kitchen'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type DeliveryType = 'dine_in' | 'takeaway' | 'delivery';

export type OrderChannel = 'pos' | 'app' | 'website' | 'phone';

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
  unit: 'kg' | 'pcs' | 'liters' | 'grams';
  unitAr: string;
  costPerUnit: number;
  currentStock: number;
  minReorderLevel: number;
  maxStock: number;
  supplier: string;
  lastRestocked: string;
  category: string;
  categoryAr: string;
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

