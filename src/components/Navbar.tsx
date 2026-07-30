import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, Menu as MenuIcon, X, PackageSearch } from 'lucide-react';
import { useCart } from '@/lib/cart';

type NavbarProps = { page: string; onNavigate: (page: string) => void };

const links = [
  { label: 'Home', page: 'home', href: '#home' },
  { label: 'Menu', page: 'home', href: '#menu' },
  { label: 'Reviews', page: 'home', href: '#reviews' },
  { label: 'Contact', page: 'home', href: '#contact' },
];

export function Navbar({ page, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [count]);

  const handleLink = (href: string, targetPage: string) => {
    if (targetPage !== 'home') {
      onNavigate(targetPage);
    } else if (page !== 'home') {
      onNavigate('home');
      requestAnimationFrame(() => setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 60));
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  const handleOpenCart = () => {
    if (page !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        openCart();
        window.dispatchEvent(new Event('open-cart-drawer'));
      }, 100);
    } else {
      openCart();
      window.dispatchEvent(new Event('open-cart-drawer'));
    }
  };

  return (
    <header className={`relative inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-transparent backdrop-blur-md shadow-soft' : 'bg-transparent backdrop-blur-sm'}`}>
      {/* CONTAINER */}
      <div className="mx-auto max-w-6xl px-5 py-2 sm:px-8 flex flex-col items-center justify-center">
        
        {/* LOGO */}
        <button type="button" onClick={() => onNavigate('home')} className="flex items-center justify-center -mt-10 -mb-6">
          <img
            src="https://res.cloudinary.com/mxabywb7/image/upload/v1785447941/crustandcrumb3_xvxd6j.png"
            alt="Crust & Crumb"
            className="h-48 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
        </button>

        {/* BUTTONS */}
        <div className="flex items-center justify-between w-full max-w-4xl">
          
          <div className="w-10" />

          <ul className="hidden md:flex items-center gap-24">
            {links.map((l) => (
              <li key={l.label}>
                <button type="button" onClick={() => handleLink(l.href, l.page)} className="nav-link text-base font-bold text-espresso-700 transition-colors hover:text-sage-600">{l.label}</button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <button type="button" onClick={() => onNavigate('track')} className="hidden h-10 w-10 place-items-center text-espresso-700 transition-colors hover:bg-kraft-200/70 sm:grid" aria-label="Track order">
              <PackageSearch className="h-5 w-5" />
            </button>
            
            <button 
              type="button" 
              onClick={handleOpenCart} 
              className={`relative grid h-10 w-10 place-items-center text-espresso-700 transition-colors hover:bg-kraft-200/70 ${bump ? 'animate-bob' : ''}`} 
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="cc-notch animate-popIn absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center bg-mustard-500 px-1 font-receipt text-[11px] font-extrabold text-espresso-900 ring-2 ring-cream-100">{count}</span>
              )}
            </button>

            <button 
              type="button" 
              onClick={handleOpenCart} 
              className="hidden bg-sage-500 px-5 py-2.5 text-sm font-bold text-white md:inline-flex hover:bg-sage-600 transition-colors"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN - FIXED: changed md:hidden to sm:hidden */}
      {open && (
        <div className="sm:hidden border-t border-kraft-300/60 bg-cream-100/95 px-5 pb-5 pt-3 backdrop-blur-md">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.label}>
                <button type="button" onClick={() => handleLink(l.href, l.page)} className="block w-full px-3 py-3 text-left text-base font-bold text-espresso-700 hover:bg-kraft-200/70">{l.label}</button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => { onNavigate('track'); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-3 text-left text-base font-bold text-espresso-700 hover:bg-kraft-200/70">
                <PackageSearch className="h-4 w-4" /> Track Order
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}