export interface CartItem {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Cart {
  items: CartItem[];
  restaurant_id: number | null;
  restaurant_name: string | null;
}
