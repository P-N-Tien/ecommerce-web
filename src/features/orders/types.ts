export type OrderStatus = 'pending_payment' | 'payment_failed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type Order = {
  id: string | number;
  orderNumber: string;
  userId: string | number;
  userName: string | null;
  userEmail: string | null;
  status: OrderStatus;
  itemCount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items?: Array<{ title: string; quantity: number; unitPrice: number }>;
};
