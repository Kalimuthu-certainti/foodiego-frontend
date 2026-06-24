import { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { LocationDisplay } from './LocationDisplay';
import { HeaderSearchBar } from './HeaderSearchBar';
import { CartIcon } from './CartIcon';
import { ProfileIcon } from './ProfileIcon';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full h-[88px] z-[100] transition-all duration-300 shadow-nav ${
        scrolled ? 'glass-effect' : 'bg-surface'
      }`}
    >
      <div className="flex items-center justify-between px-[40px] max-w-[1280px] mx-auto w-full h-full gap-6">
        {/* Brand */}
        <div className="flex items-center gap-8 shrink-0">
          <Logo />
          <LocationDisplay />
        </div>

        {/* Search */}
        <div className="flex-1 flex justify-center">
          <HeaderSearchBar />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-6 shrink-0">
          <CartIcon />
          <ProfileIcon />
        </div>
      </div>
    </header>
  );
};
