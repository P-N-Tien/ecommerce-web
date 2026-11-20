import { http } from '@/lib/api';
import { USE_MOCK_API } from '@/lib/api/runtime';
import type { Order, OrderStatus } from '@/features/orders/types';
import { mockGetOrders, mockTransitionOrder } from './mock-orders-api';

type OrderResult = Order[] | { items: Order[] } | { data: Order[] | { items: Order[] } };
function list(result: OrderResult): Order[] {
  const outer = 'data' in result ? result.data : result;
  return Array.isArray(outer) ? outer : outer.items;
}
export async function getOrders(): Promise<Order[]> {
  if (USE_MOCK_API) return mockGetOrders();
  const { data } = await http.get<OrderResult>('/api/v1/orders', { params: { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' } });
  return list(data);
}
export async function transitionOrder(id: string | number, action: 'confirm' | 'process' | 'ship' | 'deliver' | 'cancel'): Promise<OrderStatus> {
  if (USE_MOCK_API) return mockTransitionOrder(id, action);
  const { data } = await http.patch<{ status: OrderStatus }>(`/api/v1/orders/${id}/${action}`);
  return data.status;
}
