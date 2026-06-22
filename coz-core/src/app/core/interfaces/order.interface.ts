
export interface OrderItem {
  product: {
    _id: string;
    name: string;
    slug: string;
  };
  variant: {
    _id: string;
    colorName: string;
    images: { url: string }[];
  };
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  governorate: string;
  country: string | 'Egypt';
  postalCode?: string | null;
  apartment?: string | null;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  notes: string;
  status: 'pending' |'completed' | 'cancelled';
  createdAt: string;
  user?: {
    _id: string;
    fullName: string;
  };
  guestId?: string;
}

export interface CreateOrderBody {
  shippingAddress: ShippingAddress;
  notes?: string;
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: {
    currentPage: number;
    totalOrders: number;
    totalPages: number;
    limit: number;
  };
}

export interface SingleOrderResponse {
  message: string;
  data: Order;
}

export interface UpdateOrderStatusBody {
  status: 'pending' |'completed' | 'cancelled';
}

export interface UpdateOrderStatusResponse {
  message: string;
  data: Order;
}


export interface AdminOrdersListResponse {
  message: string;
  data: Order[];
  pagination: {
    currentPage: number;
    totalOrders: number;
    totalPages: number;
    limit: number;
  };
}
