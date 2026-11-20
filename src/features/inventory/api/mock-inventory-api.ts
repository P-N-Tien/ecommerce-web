import type { InventoryItem } from '@/features/inventory/types';
import { mockDelay, mockNotFound, readMockList, writeMockList } from '@/services/mock/storage';

const KEY = 'ecommerce-admin.demo-inventory';
const seed: InventoryItem[] = [
  { id: 'stock-101', productId: 'product-101', sku: 'ELEC-ANC-001', productTitle: 'Wireless Headphones', availableQuantity: 18, reservedQuantity: 3, totalQuantity: 21, lowStockThreshold: 8, updatedAt: new Date().toISOString() },
  { id: 'stock-102', productId: 'product-102', sku: 'ACC-BAG-014', productTitle: 'Everyday Backpack', availableQuantity: 4, reservedQuantity: 1, totalQuantity: 5, lowStockThreshold: 10, updatedAt: new Date().toISOString() },
  { id: 'stock-103', productId: 'product-103', sku: 'HOME-LIGHT-009', productTitle: 'Desk Lamp', availableQuantity: 32, reservedQuantity: 0, totalQuantity: 32, lowStockThreshold: 10, updatedAt: new Date().toISOString() },
];

export async function mockGetInventory() { await mockDelay(); return readMockList(KEY, seed); }
export async function mockAdjustStock(productId: string | number, input: { quantity: number; type: 'ADD' | 'SUBTRACT' | 'SET'; reason?: string }) {
  await mockDelay();
  const items = readMockList(KEY, seed);
  const current = items.find((item) => String(item.productId) === String(productId));
  if (!current) throw mockNotFound('Inventory record');
  const availableQuantity = input.type === 'SET' ? input.quantity : current.availableQuantity + (input.type === 'ADD' ? input.quantity : -input.quantity);
  if (availableQuantity < 0) throw Object.assign(new Error('Stock cannot be less than zero.'), { statusCode: 400 });
  writeMockList(KEY, items.map((item) => String(item.productId) === String(productId) ? { ...item, availableQuantity, totalQuantity: availableQuantity + item.reservedQuantity, updatedAt: new Date().toISOString() } : item));
}
