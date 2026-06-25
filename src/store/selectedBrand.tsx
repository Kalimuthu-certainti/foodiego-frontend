import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SelectedBrandCtx {
  brandId: string | null;
  selectBrand: (id: string) => void;
  clearBrand: () => void;
}

const Ctx = createContext<SelectedBrandCtx>({
  brandId: null,
  selectBrand: () => {},
  clearBrand: () => {},
});

const KEY = 'fg_selected_brand';

export function SelectedBrandProvider({ children }: { children: ReactNode }) {
  const [brandId, setBrandId] = useState<string | null>(
    () => sessionStorage.getItem(KEY),
  );

  const selectBrand = (id: string) => {
    sessionStorage.setItem(KEY, id);
    setBrandId(id);
  };

  const clearBrand = () => {
    sessionStorage.removeItem(KEY);
    setBrandId(null);
  };

  return <Ctx.Provider value={{ brandId, selectBrand, clearBrand }}>{children}</Ctx.Provider>;
}

export function useSelectedBrand() {
  return useContext(Ctx);
}
