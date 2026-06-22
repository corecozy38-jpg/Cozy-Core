export interface CartItem {
  itemId: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number
  };
  color: {
    id: string;
    name: string
  };
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
  note: string;
  maxQuantity: number;
  isAvailable: boolean;
}

export interface CartI {
  items: CartItem[];
  totalPrice: number;
  removedItems: boolean;
}

