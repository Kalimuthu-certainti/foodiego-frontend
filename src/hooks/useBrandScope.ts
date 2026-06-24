import { useParams } from 'react-router-dom';

export interface BrandScope {
  /** The brand id from the current route (`/brands/:id`), or undefined. */
  brandId: string | undefined;
  /** True when a brand is currently in scope. */
  hasBrand: boolean;
}

/**
 * Resolves the currently selected brand from the route param.
 * Used by brand-detail tabs (restaurants, branches, staff, menu, reports) to
 * scope their queries and mutations to the active brand.
 */
export function useBrandScope(): BrandScope {
  const { id } = useParams<{ id: string }>();
  return {
    brandId: id,
    hasBrand: Boolean(id),
  };
}
