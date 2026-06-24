export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  cuisine_id: number;
  rating: number;
  review_count: number;
  delivery_time_min: number;
  delivery_time_max: number;
  price_range: '$' | '$$' | '$$$';
  image_url: string;
  has_offer: boolean;
  offer_text: string | null;
  is_open: boolean;
  location_ids: number[];
  tags: string[];
  description: string;
}
