import { http } from '@/lib/api';
import { USE_MOCK_API } from '@/lib/api/runtime';
import type { InventoryItem } from '@/features/inventory/types';
import { mockAdjustStock, mockGetInventory } from './mock-inventory-api';

type InventoryResult = InventoryItem[] | { items: InventoryItem[] } | { data: InventoryItem[] | { items: InventoryItem[] } };
function getRows(result: InventoryResult): InventoryItem[] {
  const outer = 'data' in result ? result.data : result;
  return Array.isArray(outer) ? outer : outer.items;
}

export async function getInventory(): Promise<InventoryItem[]> {
  if (USE_MOCK_API) return mockGetInventory();
  const { data } = await http.get<InventoryResult>('/api/v1/inventory', { params: { page: 1, limit: 100 } });
  return getRows(data);
}

export async function adjustStock(productId: string | number, input: { quantity: number; type: 'ADD' | 'SUBTRACT' | 'SET'; reason?: string }): Promise<void> {
  if (USE_MOCK_API) return mockAdjustStock(productId, input);
  await http.post(`/api/v1/inventory/products/${productId}/adjust`, input);
}
