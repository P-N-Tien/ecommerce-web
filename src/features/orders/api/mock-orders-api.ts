import type { Order, OrderStatus } from '@/features/orders/types';
import { mockDelay, mockNotFound, readMockList, writeMockList } from '@/services/mock/storage';

const KEY = 'ecommerce-admin.demo-orders';
const seed: Order[] = [
  { id: 'order-2401', orderNumber: 'ORD-2026-2401', userId: 21, userName: 'Mai Nguyen', userEmail: 'mai@example.com', status: 'pending_payment', itemCount: 2, totalAmount: 198.5, currency: 'USD', createdAt: '2026-11-18T08:20:00.000Z', items: [{ title: 'Wireless Headphones', quantity: 1, unitPrice: 129.99 }, { title: 'Everyday Backpack', quantity: 1, unitPrice: 68.51 }] },
  { id: 'order-2400', orderNumber: 'ORD-2026-2400', userId: 18, userName: 'Alex Tran', userEmail: 'alex@example.com', status: 'processing', itemCount: 1, totalAmount: 42.5, currency: 'USD', createdAt: '2026-11-17T12:05:00.000Z', items: [{ title: 'Desk Lamp', quantity: 1, unitPrice: 42.5 }] },
  { id: 'order-2399', orderNumber: 'ORD-2026-2399', userId: 16, userName: 'Sam Lee', userEmail: 'sam@example.com', status: 'shipped', itemCount: 3, totalAmount: 296.75, currency: 'USD', createdAt: '2026-11-16T15:10:00.000Z', items: [{ title: 'Wireless Headphones', quantity: 2, unitPrice: 129.99 }, { title: 'Desk Lamp', quantity: 1, unitPrice: 36.77 }] },
  { id: 'order-2398', orderNumber: 'ORD-2026-2398', userId: 12, userName: 'Linh Pham', userEmail: 'linh@example.com', status: 'delivered', itemCount: 1, totalAmount: 68, currency: 'USD', createdAt: '2026-11-14T10:20:00.000Z', items: [{ title: 'Everyday Backpack', quantity: 1, unitPrice: 68 }] },
];

export async function mockGetOrders() { await mockDelay(); return readMockList(KEY, seed); }
export async function mockTransitionOrder(id: string | number, action: 'confirm' | 'process' | 'ship' | 'deliver' | 'cancel'): Promise<OrderStatus> {
  await mockDelay();
  const orders = readMockList(KEY, seed);
  const current = orders.find((order) => String(order.id) === String(id));
  if (!current) throw mockNotFound('Order');
  const next: Record<typeof action, OrderStatus> = { confirm: 'confirmed', process: 'processing', ship: 'shipped', deliver: 'delivered', cancel: 'cancelled' };
  writeMockList(KEY, orders.map((order) => String(order.id) === String(id) ? { ...order, status: next[action] } : order));
  return next[action];
}
