import type { Order, OrderItem } from '@/types';

export interface PrintReceiptOptions {
  cashierName?: string;
  autoPrint?: boolean;
  mode?: 'both' | 'customer' | 'kitchen';
  guestsCount?: number;
  waiterName?: string;
}

// Official Nine Fries logo asset path (served via Vite from /public/assets/aistudio)
export const NINE_FRIES_LOGO_SRC = '/assets/aistudio/IMG_8139.JPG_4eb10de5.jpeg';

// Sample order matching the exact items in the attached real POS receipt photo for instant testing
export const sampleTestOrder: Order = {
  id: 'ord-test-sample-80mm',
  orderNumber: '10',
  customerName: 'طاولة 2',
  customerPhone: '01012345678',
  deliveryType: 'dine_in',
  channel: 'pos',
  tableNumber: '2',
  items: [
    {
      id: 'item-1',
      menuItemId: 'm-crinkle',
      name: 'CRINKLE TRAY',
      nameAr: 'تراي بطاطس كرينكل',
      quantity: 1,
      price: 75,
      modifiers: [],
      notes: 'بطاطس مقرمشة ساخنة',
    },
    {
      id: 'item-2',
      menuItemId: 'm-ketchup',
      name: 'KETCHUP',
      nameAr: 'كاتشب هاينز',
      quantity: 1,
      price: 10,
      modifiers: [],
    },
    {
      id: 'item-3',
      menuItemId: 'm-mayo',
      name: 'MAYO',
      nameAr: 'مايونيز مدخن',
      quantity: 1,
      price: 10,
      modifiers: [],
    },
    {
      id: 'item-4',
      menuItemId: 'm-tenders',
      name: 'CHICKEN TENDERS',
      nameAr: 'وجبة تشيكن تندرز',
      quantity: 1,
      price: 160,
      modifiers: ['سبايسي حار'],
      notes: 'تسوية مقرمشة إضافية',
    },
    {
      id: 'item-5',
      menuItemId: 'm-bbq',
      name: 'BBQ',
      nameAr: 'باربيكيو صوص فاخر',
      quantity: 1,
      price: 10,
      modifiers: [],
    },
  ],
  total: 265,
  subtotal: 265,
  tax: 0,
  deliveryFee: 0,
  status: 'new',
  paymentMethod: 'cash',
  paid: true,
  notes: 'العميل يفضل تقديم الصوصات في أكواب جانبية',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Format date for thermal receipt matching Nine Fries format: DD/MM/YYYY HH:MM ص/م
 */
export function formatReceiptDate(isoString?: string): string {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const isPm = hours >= 12;
    hours = hours % 12 || 12;
    const amPm = isPm ? 'م' : 'ص';
    return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${amPm}`;
  } catch {
    return '25/10/2026 11:52 م';
  }
}

/**
 * Clean extract order number token (e.g. #10 -> 10, #8835 -> 8835)
 */
export function getOrderToken(orderNumber: string): string {
  const clean = orderNumber.replace('#', '').trim();
  return clean || '1';
}

/**
 * Full Thermal Receipt CSS applied in both standalone prints and modal preview cards
 */
export const THERMAL_RECEIPT_CSS = `
  .receipt-ticket {
    width: 76mm;
    max-width: 100%;
    margin: 0 auto;
    padding: 2mm 1mm 6mm 1mm;
    background: #ffffff;
    color: #000000;
    font-family: 'Segoe UI', Tahoma, 'Arial', sans-serif;
    font-size: 11px;
    line-height: 1.3;
    text-align: right;
    direction: rtl;
    box-sizing: border-box;
  }

  .page-break {
    page-break-after: always;
    break-after: page;
    height: 1px;
  }

  /* 1. Header & Logo (Very small, compact, centered) */
  .receipt-header {
    text-align: center;
    margin: 0 auto 3px auto;
  }
  .thermal-logo-img {
    width: 50px !important;
    max-width: 50px !important;
    height: auto !important;
    max-height: 44px !important;
    margin: 0 auto 2px auto !important;
    display: block !important;
    filter: grayscale(100%) contrast(180%);
    object-fit: contain;
  }

  /* 2. Order Number Frame (Centered, Thin Black Border, Bold Font) */
  .order-frame-container {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 2px 0 3px 0 !important;
    text-align: center !important;
  }
  .order-frame {
    display: inline-flex !important;
    justify-content: center !important;
    align-items: center !important;
    border: 1px solid #000000 !important;
    border-radius: 4px !important;
    padding: 2px 14px !important;
    text-align: center !important;
    background: #ffffff !important;
    min-width: 54px !important;
  }
  .order-number {
    font-size: 22px !important;
    font-weight: 900 !important;
    font-family: 'Arial Black', Impact, monospace, sans-serif !important;
    line-height: 1.1 !important;
    letter-spacing: 0.5px !important;
    display: block !important;
    color: #000000 !important;
    text-align: center !important;
  }

  /* 3. Centered Date & Time */
  .order-datetime {
    text-align: center !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    font-family: 'Segoe UI', Tahoma, sans-serif !important;
    letter-spacing: 0.5px !important;
    margin: 2px 0 4px 0 !important;
    color: #000000 !important;
  }

  .kitchen-banner-tag {
    text-align: center !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    margin: 2px 0 3px 0 !important;
    letter-spacing: 0.5px !important;
  }

  /* 4. Metadata Details */
  .meta-section {
    border-top: 1px dashed #000000 !important;
    border-bottom: 1px dashed #000000 !important;
    padding: 3px 0 !important;
    margin: 3px 0 4px 0 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }
  .meta-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 1.5px !important;
  }
  .meta-col {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }
  .meta-col .lbl {
    font-weight: 800 !important;
  }
  .meta-col .val {
    font-weight: 900 !important;
    font-family: monospace !important;
  }
  .meta-address {
    font-size: 10px !important;
    font-weight: 700 !important;
    padding: 2px 0 1px 0 !important;
  }

  /* Clean dotted / dashed thermal line separator */
  .dotted-separator {
    border-bottom: 1px dashed #000000 !important;
    margin: 4px 0 !important;
    height: 0 !important;
    width: 100% !important;
  }

  /* 5. Unified Items Table (RTL Order) */
  .receipt-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 2px 0 !important;
    font-size: 11px !important;
    direction: rtl !important;
  }
  .table-header th {
    border-bottom: 1.5px solid #000000 !important;
    padding: 3px 1px !important;
    font-weight: 900 !important;
    font-size: 11px !important;
  }
  .item-row td {
    padding: 3px 1px !important;
    vertical-align: top !important;
    border-bottom: 1px dotted #dddddd !important;
  }
  /* Column 1 (Right): الكمية */
  .col-qty {
    text-align: right !important;
    width: 15% !important;
    font-weight: 900 !important;
    font-family: monospace !important;
    font-size: 11px !important;
  }
  /* Column 2 (Middle): اسم الصنف */
  .col-name {
    text-align: right !important;
    width: 47% !important;
    padding-left: 2px !important;
    padding-right: 2px !important;
  }
  .main-name {
    font-weight: 900 !important;
    font-size: 11.5px !important;
    line-height: 1.2 !important;
  }
  .sub-name {
    font-size: 9.5px !important;
    color: #222222 !important;
    font-weight: 700 !important;
  }
  .mod-name {
    font-size: 9px !important;
    font-style: italic !important;
    color: #333333 !important;
    margin-top: 1px !important;
    font-weight: 700 !important;
  }
  .note-name {
    font-size: 9px !important;
    font-weight: 800 !important;
    color: #000000 !important;
    margin-top: 1px !important;
  }
  /* Column 3 (Left): السعر */
  .col-price {
    text-align: left !important;
    width: 19% !important;
    font-family: monospace !important;
    font-weight: 800 !important;
    font-size: 11px !important;
    direction: ltr !important;
  }
  /* Column 4 (Far Left): الأجمالى */
  .col-total {
    text-align: left !important;
    width: 19% !important;
    font-weight: 900 !important;
    font-family: monospace !important;
    font-size: 11px !important;
    direction: ltr !important;
  }

  /* 6. Bold Financial Summary */
  .summary-section {
    padding: 3px 0 2px 0 !important;
    font-size: 11.5px !important;
  }
  .summary-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 2px !important;
    font-weight: 800 !important;
  }
  .summary-row .lbl {
    font-weight: 900 !important;
    text-align: right !important;
  }
  .summary-row .num {
    font-family: monospace !important;
    font-weight: 900 !important;
    font-size: 12px !important;
    text-align: left !important;
    direction: ltr !important;
  }

  /* 7. Highlighted Net Total with Dark Background & Bold Values on Left */
  .net-total-banner {
    background: #000000 !important;
    color: #ffffff !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 4px 7px !important;
    margin: 3px 0 4px 0 !important;
    font-weight: 900 !important;
    border-radius: 3px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .net-total-banner .net-lbl {
    font-size: 14px !important;
    font-weight: 900 !important;
    text-align: right !important;
    color: #ffffff !important;
  }
  .net-total-banner .net-num {
    font-family: monospace !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    text-align: left !important;
    direction: ltr !important;
    color: #ffffff !important;
  }

  /* 8. Payments Breakdown */
  .payments-section {
    padding: 2px 0 3px 0 !important;
    font-size: 11px !important;
  }
  .payment-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 1.5px !important;
    font-weight: 700 !important;
  }
  .payment-row .lbl {
    font-weight: 800 !important;
    text-align: right !important;
  }
  .payment-row .num {
    font-family: monospace !important;
    font-weight: 800 !important;
    text-align: left !important;
    direction: ltr !important;
  }

  /* 9. Receipt Footer */
  .receipt-footer {
    text-align: center !important;
    padding-top: 3px !important;
    border-top: 1px dotted #888888 !important;
    margin-top: 3px !important;
  }
  .footer-app {
    font-weight: 900 !important;
    font-size: 10px !important;
    letter-spacing: 0.5px !important;
    margin-bottom: 2px !important;
  }
  .footer-msg {
    font-weight: 800 !important;
    font-size: 9.5px !important;
    margin-bottom: 2px !important;
  }
  .footer-barcode {
    font-family: 'Courier New', monospace !important;
    font-size: 14px !important;
    letter-spacing: 2px !important;
    line-height: 0.8 !important;
    font-weight: 900 !important;
  }
  .footer-id {
    font-size: 9px !important;
    font-family: monospace !important;
    color: #333333 !important;
    margin-top: 1.5px !important;
    font-weight: 700 !important;
  }

  /* Kitchen Specifics */
  .general-order-note {
    background: #f0f0f0 !important;
    border: 1px dashed #000000 !important;
    padding: 3px 5px !important;
    font-size: 10.5px !important;
    font-weight: 800 !important;
    margin: 3px 0 !important;
    border-radius: 3px !important;
  }
  .kitchen-summary {
    padding-top: 3px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
  }
  .summary-flex {
    display: flex !important;
    justify-content: space-between !important;
    margin-bottom: 2px !important;
  }
  .kitchen-footer-stamp {
    text-align: center !important;
    font-size: 9px !important;
    color: #555555 !important;
    margin-top: 2px !important;
    font-weight: 700 !important;
  }
`;

/**
 * Shared unified items table generator for both Customer Receipt and Kitchen Ticket (KDS)
 * Exact column names required by user:
 * العمود الأول (أقصى اليمين): الكمية (1.00 ، 2.00...)
 * العمود الثاني (الوسط): اسم الصنف (مع الإضافات، الأحجام، ودرجات الحار والملاحظات)
 * العمود الثالث (اليسار): السعر
 * العمود الرابع اليسار : الأجمالى محاذاة لليسار بخط مونو فائق الوضوح
 */
export function buildUnifiedItemsTableHtml(items: OrderItem[]): string {
  const rows = items
    .map((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      const unitPrice = item.price.toFixed(2);
      const qty = item.quantity.toFixed(2);
      const hasModifiers = item.modifiers && item.modifiers.length > 0;
      const hasNotes = Boolean(item.notes);

      return `
        <tr class="item-row">
          <td class="col-qty" style="text-align: right; width: 15%; font-weight: 900; font-family: monospace;">${qty}</td>
          <td class="col-name" style="text-align: right; width: 47%;">
            <div class="main-name" style="font-weight: 900; font-size: 11.5px; line-height: 1.2;">${item.name || item.nameAr}</div>
            ${item.nameAr && item.name ? `<div class="sub-name" style="font-size: 9.5px; color: #222222; font-weight: 700;">${item.nameAr}</div>` : ''}
            ${hasModifiers ? `<div class="mod-name" style="font-size: 9px; font-style: italic; color: #333333; margin-top: 1px;">+ ${item.modifiers!.join('، ')}</div>` : ''}
            ${hasNotes ? `<div class="note-name" style="font-size: 9px; font-weight: 800; color: #000000; margin-top: 1px;">* ${item.notes}</div>` : ''}
          </td>
          <td class="col-price" style="text-align: left; width: 19%; font-family: monospace; font-weight: 800; direction: ltr;">${unitPrice}</td>
          <td class="col-total" style="text-align: left; width: 19%; font-weight: 900; font-family: monospace; direction: ltr;">${itemTotal}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table class="receipt-table" style="width: 100%; border-collapse: collapse; margin: 2px 0; font-size: 11px; direction: rtl;">
      <thead>
        <tr class="table-header">
          <th class="col-qty" style="border-bottom: 1.5px solid #000; padding: 3px 1px; font-weight: 900; text-align: right;">الكمية</th>
          <th class="col-name" style="border-bottom: 1.5px solid #000; padding: 3px 1px; font-weight: 900; text-align: right;">اسم الصنف</th>
          <th class="col-price" style="border-bottom: 1.5px solid #000; padding: 3px 1px; font-weight: 900; text-align: left; direction: ltr;">السعر</th>
          <th class="col-total" style="border-bottom: 1.5px solid #000; padding: 3px 1px; font-weight: 900; text-align: left; direction: ltr;">الأجمالى</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Build Customer & Cashier Receipt HTML (80mm / 58mm compatible)
 */
export function buildCustomerReceiptHtml(order: Order, options?: PrintReceiptOptions): string {
  const token = getOrderToken(order.orderNumber);
  const formattedDate = formatReceiptDate(order.createdAt);
  const cashier = options?.cashierName || 'احمد';
  const waiter = options?.waiterName || cashier;
  const guests = options?.guestsCount ?? (order.deliveryType === 'dine_in' ? 2 : 0);

  const isCash = order.paymentMethod === 'cash';
  const isCard = order.paymentMethod === 'card' || order.paymentMethod === 'online';

  const orderTypeLabel =
    order.deliveryType === 'dine_in'
      ? `الترابيزة : ${order.tableNumber || '2'}`
      : order.deliveryType === 'takeaway'
      ? 'سفري / تيك أوي'
      : order.deliveryType === 'talabat'
      ? 'أبلكيشن طلبات (Talabat)'
      : `توصيل منازل: ${order.customerName || 'عميل'}`;

  return `
    <div class="receipt-ticket customer-ticket">
      <!-- 1. Very small compact centered logo without text -->
      <div class="receipt-header" style="text-align: center; margin-bottom: 2px;">
        <img src="${NINE_FRIES_LOGO_SRC}" alt="Nine Fries" class="thermal-logo-img" style="width: 50px; max-width: 50px; height: auto; max-height: 44px; margin: 0 auto 2px auto; display: block; object-fit: contain;" />
      </div>

      <!-- 2. Order Number in center with thin black border & bold font -->
      <div class="order-frame-container" style="display: flex; justify-content: center; align-items: center; margin: 2px 0 3px 0; text-align: center;">
        <div class="order-frame" style="display: inline-flex; justify-content: center; align-items: center; border: 1px solid #000000; border-radius: 4px; padding: 2px 14px; text-align: center; background: #ffffff; min-width: 54px;">
          <span class="order-number" style="font-size: 22px; font-weight: 900; font-family: 'Arial Black', Impact, monospace, sans-serif; line-height: 1.1; letter-spacing: 0.5px; color: #000000; text-align: center; display: block;">${token}</span>
        </div>
      </div>

      <!-- 3. Centered Date & Time right below frame -->
      <div class="order-datetime" style="text-align: center; font-size: 11px; font-weight: 800; margin: 2px 0 4px 0; color: #000000;">${formattedDate}</div>

      <!-- 4. Metadata Details (Table, Guests, Waiter, Cashier) -->
      <div class="meta-section" style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 3px 0; margin: 3px 0 4px 0; font-size: 11px; font-weight: 700;">
        <div class="meta-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px;">
          <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
            <span class="lbl" style="font-weight: 800;">الترابيزة :</span>
            <span class="val" style="font-weight: 900; font-family: monospace;">${order.deliveryType === 'dine_in' ? (order.tableNumber || '2') : orderTypeLabel}</span>
          </div>
          ${order.deliveryType === 'dine_in' ? `
            <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
              <span class="lbl" style="font-weight: 800;">عدد الأفراد :</span>
              <span class="val" style="font-weight: 900; font-family: monospace;">${guests}</span>
            </div>
          ` : ''}
        </div>
        <div class="meta-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px;">
          <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
            <span class="lbl" style="font-weight: 800;">الويتر :</span>
            <span class="val" style="font-weight: 900; font-family: monospace;">${waiter}</span>
          </div>
          <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
            <span class="lbl" style="font-weight: 800;">كاشير :</span>
            <span class="val" style="font-weight: 900; font-family: monospace;">${cashier}</span>
          </div>
        </div>
        ${order.deliveryType === 'delivery' && order.address ? `
          <div class="meta-address" style="font-size: 10px; font-weight: 700; padding: 2px 0 1px 0;">العنوان: ${order.address} ${order.customerPhone ? `(${order.customerPhone})` : ''}</div>
        ` : ''}
        ${order.deliveryType === 'talabat' ? `
          <div class="meta-address" style="font-size: 10px; font-weight: 700; padding: 2px 0 1px 0;">مصدر الطلب: كابتن أبلكيشن طلبات</div>
        ` : ''}
      </div>

      <!-- Dotted Separator Line -->
      <div class="dotted-separator" style="border-bottom: 1px dashed #000; margin: 4px 0; height: 0;"></div>

      <!-- 5. Unified Items Table -->
      ${buildUnifiedItemsTableHtml(order.items)}

      <!-- Dotted Separator Line -->
      <div class="dotted-separator" style="border-bottom: 1px dashed #000; margin: 4px 0; height: 0;"></div>

      <!-- 6. Bold Financial Summary with values on left -->
      <div class="summary-section" style="padding: 3px 0 2px 0; font-size: 11.5px;">
        <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; font-weight: 800;">
          <span class="lbl" style="font-weight: 900;">الأجمالى</span>
          <span class="num" style="font-family: monospace; font-weight: 900; font-size: 12px; direction: ltr;">${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; font-weight: 800;">
          <span class="lbl" style="font-weight: 900;">الخصم</span>
          <span class="num" style="font-family: monospace; font-weight: 900; font-size: 12px; direction: ltr;">${(order.discount || 0).toFixed(2)}</span>
        </div>
        <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; font-weight: 800;">
          <span class="lbl" style="font-weight: 900;">الضريبة</span>
          <span class="num" style="font-family: monospace; font-weight: 900; font-size: 12px; direction: ltr;">${(order.tax || 0).toFixed(2)}</span>
        </div>
        <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; font-weight: 800;">
          <span class="lbl" style="font-weight: 900;">${order.deliveryType === 'delivery' ? 'خدمة التوصيل' : 'خدمة الصالة'}</span>
          <span class="num" style="font-family: monospace; font-weight: 900; font-size: 12px; direction: ltr;">${(order.deliveryFee || 0).toFixed(2)}</span>
        </div>
      </div>

      <!-- 7. Highlighted Net Total with Dark Background & Bold Values on Left -->
      <div class="net-total-banner" style="background: #000000; color: #ffffff; display: flex; justify-content: space-between; align-items: center; padding: 4px 7px; margin: 3px 0 4px 0; font-weight: 900; border-radius: 3px;">
        <span class="net-lbl" style="font-size: 14px; font-weight: 900; color: #ffffff;">الصافى</span>
        <span class="net-num" style="font-family: monospace; font-size: 16px; font-weight: 900; direction: ltr; color: #ffffff;">${order.total.toFixed(2)}</span>
      </div>

      <!-- 8. Payment Breakdown Section -->
      <div class="payments-section" style="padding: 2px 0 3px 0; font-size: 11px;">
        <div class="payment-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px; font-weight: 700;">
          <span class="lbl" style="font-weight: 800;">نقدى</span>
          <span class="num" style="font-family: monospace; font-weight: 800; direction: ltr;">${isCash ? order.total.toFixed(2) : '.00'}</span>
        </div>
        <div class="payment-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px; font-weight: 700;">
          <span class="lbl" style="font-weight: 800;">فيزا</span>
          <span class="num" style="font-family: monospace; font-weight: 800; direction: ltr;">${isCard ? order.total.toFixed(2) : '.00'}</span>
        </div>
        <div class="payment-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px; font-weight: 700;">
          <span class="lbl" style="font-weight: 800;">فيزا تيبس</span>
          <span class="num" style="font-family: monospace; font-weight: 800; direction: ltr;">.00</span>
        </div>
      </div>

      <!-- 9. Receipt Footer Branding & Reference -->
      <div class="receipt-footer" style="text-align: center; padding-top: 3px; border-top: 1px dotted #888888; margin-top: 3px;">
        <div class="footer-app" style="font-weight: 900; font-size: 10px; letter-spacing: 0.5px; margin-bottom: 2px;">Intouch Application</div>
        <div class="footer-msg" style="font-weight: 800; font-size: 9.5px; margin-bottom: 2px;">شكراً لزيارتكم ناين فرايز - نتمنى لكم وجبة شهية!</div>
        <div class="footer-barcode" style="font-family: 'Courier New', monospace; font-size: 14px; letter-spacing: 2px; line-height: 0.8; font-weight: 900;">||||| | |||| |||||| |||| | |||||</div>
        <div class="footer-id" style="font-size: 9px; font-family: monospace; color: #333333; margin-top: 1.5px; font-weight: 700;">${order.orderNumber}</div>
      </div>
    </div>
  `;
}

/**
 * Build Kitchen Order Ticket HTML (80mm / 58mm compatible)
 * Unified items table with exact 4 columns
 */
export function buildKitchenTicketHtml(order: Order, options?: PrintReceiptOptions): string {
  const token = getOrderToken(order.orderNumber);
  const formattedDate = formatReceiptDate(order.createdAt);
  const cashier = options?.cashierName || 'احمد';
  const waiter = options?.waiterName || cashier;
  const guests = options?.guestsCount ?? (order.deliveryType === 'dine_in' ? 2 : 0);

  const orderTypeTag =
    order.deliveryType === 'dine_in'
      ? `صالة - طاولة ${order.tableNumber || '2'}`
      : order.deliveryType === 'takeaway'
      ? 'سفري / تيك أوي'
      : order.deliveryType === 'talabat'
      ? 'أبلكيشن طلبات (Talabat)'
      : 'توصيل منزلي';

  return `
    <div class="receipt-ticket kitchen-ticket">
      <!-- 1. Very small compact centered logo without text -->
      <div class="receipt-header" style="text-align: center; margin-bottom: 2px;">
        <img src="${NINE_FRIES_LOGO_SRC}" alt="Nine Fries" class="thermal-logo-img" style="width: 50px; max-width: 50px; height: auto; max-height: 44px; margin: 0 auto 2px auto; display: block; object-fit: contain;" />
      </div>

      <!-- 2. Order Number in center with thin black border & bold font -->
      <div class="order-frame-container" style="display: flex; justify-content: center; align-items: center; margin: 2px 0 3px 0; text-align: center;">
        <div class="order-frame" style="display: inline-flex; justify-content: center; align-items: center; border: 1px solid #000000; border-radius: 4px; padding: 2px 14px; text-align: center; background: #ffffff; min-width: 54px;">
          <span class="order-number" style="font-size: 22px; font-weight: 900; font-family: 'Arial Black', Impact, monospace, sans-serif; line-height: 1.1; letter-spacing: 0.5px; color: #000000; text-align: center; display: block;">${token}</span>
        </div>
      </div>

      <!-- 3. Centered Date & Time right below frame -->
      <div class="order-datetime" style="text-align: center; font-size: 11px; font-weight: 800; margin: 2px 0 4px 0; color: #000000;">${formattedDate}</div>

      <!-- Kitchen Tag -->
      <div class="kitchen-banner-tag" style="text-align: center; font-size: 12px; font-weight: 900; margin: 2px 0 3px 0; letter-spacing: 0.5px;">*** أمر تشغيل المطبخ (KDS) ***</div>

      <!-- 4. Metadata Details -->
      <div class="meta-section" style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 3px 0; margin: 3px 0 4px 0; font-size: 11px; font-weight: 700;">
        <div class="meta-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px;">
          <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
            <span class="lbl" style="font-weight: 800;">نوع الطلب :</span>
            <span class="val font-bold" style="font-weight: 900;">${orderTypeTag}</span>
          </div>
          <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
            <span class="lbl" style="font-weight: 800;">كاشير :</span>
            <span class="val" style="font-weight: 900; font-family: monospace;">${cashier}</span>
          </div>
        </div>
        ${order.deliveryType === 'dine_in' ? `
          <div class="meta-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px;">
            <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
              <span class="lbl" style="font-weight: 800;">الترابيزة :</span>
              <span class="val" style="font-weight: 900; font-family: monospace;">${order.tableNumber || '2'}</span>
            </div>
            <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
              <span class="lbl" style="font-weight: 800;">عدد الأفراد :</span>
              <span class="val" style="font-weight: 900; font-family: monospace;">${guests}</span>
            </div>
          </div>
        ` : ''}
        ${waiter && waiter !== cashier ? `
          <div class="meta-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5px;">
            <div class="meta-col" style="display: flex; align-items: center; gap: 6px;">
              <span class="lbl" style="font-weight: 800;">الويتر :</span>
              <span class="val" style="font-weight: 900; font-family: monospace;">${waiter}</span>
            </div>
          </div>
        ` : ''}
      </div>

      ${order.notes ? `
        <div class="general-order-note" style="background: #f0f0f0; border: 1px dashed #000; padding: 3px 5px; font-size: 10.5px; font-weight: 800; margin: 3px 0; border-radius: 3px;">
          ⚠️ ملاحظة عامة: ${order.notes}
        </div>
      ` : ''}

      <!-- Dotted Separator Line -->
      <div class="dotted-separator" style="border-bottom: 1px dashed #000; margin: 4px 0; height: 0;"></div>

      <!-- 5. Unified Items Table (Identical to Customer Receipt) -->
      ${buildUnifiedItemsTableHtml(order.items)}

      <!-- Dotted Separator Line -->
      <div class="dotted-separator" style="border-bottom: 1px dashed #000; margin: 4px 0; height: 0;"></div>

      <!-- 6. Kitchen Summary Footer -->
      <div class="kitchen-summary" style="padding-top: 3px; font-size: 11px; font-weight: 800;">
        <div class="summary-flex" style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>إجمالي الأصناف: ${order.items.reduce((acc, i) => acc + i.quantity, 0)} قطعة</span>
          <span>رقم الطلب: ${order.orderNumber}</span>
        </div>
        <div class="kitchen-footer-stamp" style="text-align: center; font-size: 9px; color: #555555; margin-top: 2px; font-weight: 700;">
          وقت إرسال التذكرة: ${new Date().toLocaleTimeString('ar-EG')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns full standalone HTML document with 80mm ESC/POS styling
 */
export function generateFullReceiptDocument(order: Order, options?: PrintReceiptOptions): string {
  const mode = options?.mode || 'both';
  let bodyContent = '';

  if (mode === 'both') {
    bodyContent = `
      ${buildCustomerReceiptHtml(order, options)}
      <div class="page-break"></div>
      ${buildKitchenTicketHtml(order, options)}
    `;
  } else if (mode === 'customer') {
    bodyContent = buildCustomerReceiptHtml(order, options);
  } else {
    bodyContent = buildKitchenTicketHtml(order, options);
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Nine Fries - Receipt ${order.orderNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      width: 80mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: 'Segoe UI', Tahoma, 'Arial', sans-serif;
      font-size: 11px;
      line-height: 1.3;
      text-align: right;
      direction: rtl;
    }

    ${THERMAL_RECEIPT_CSS}

    @media print {
      body {
        width: 80mm;
      }
      .receipt-ticket {
        width: 80mm;
        padding: 2mm 1mm;
      }
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

/**
 * Standard exported printOrderReceipt function requested by specification
 * Automatically prints dual thermal receipts (Kitchen & Cashier) for 80mm ESC/POS printers
 */
export function printOrderReceipt(order: Order, options?: PrintReceiptOptions): void {
  const fullHtml = generateFullReceiptDocument(order, options);

  // Remove any previously created print iframe
  const existingFrame = document.getElementById('thermal-print-iframe');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'thermal-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '80mm';
  iframe.style.height = '100px';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    console.error('Cannot access iframe document for printing');
    return;
  }

  doc.open();
  doc.write(fullHtml);
  doc.close();

  // Allow image and styling to paint before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Failed to print via iframe, falling back to window.print:', e);
      window.print();
    }
  }, 350);
}

// Retain alias for existing callers
export const printThermalReceipts = printOrderReceipt;
