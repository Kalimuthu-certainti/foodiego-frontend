import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelectedBrand } from '../store/selectedBrand';
import * as brandApi from '../services/brandApi';
import { QUERY_KEYS } from '../utils/constants';

export interface BrandScope {
  brandId: string | undefined;
  hasBrand: boolean;
  isLoading: boolean;
}

export function useBrandScope(): BrandScope {
  const { brandId, selectBrand } = useSelectedBrand();

  const { data: brands = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: brandApi.list,
  });

  useEffect(() => {
    if (!brandId && brands.length === 1) {
      selectBrand(brands[0].id);
    }
  }, [brands, brandId, selectBrand]);

  return {
    brandId: brandId ?? undefined,
    hasBrand: Boolean(brandId),
    isLoading: isLoading && !brandId,
  };
}
