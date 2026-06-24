export type SortOption = 'rating' | 'delivery_time' | 'name' | '';

export interface Filters {
  cuisine_id: number | null;
  search: string;
  sort: SortOption;
  has_offers: boolean;
}
