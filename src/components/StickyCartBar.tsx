import { useCart } from '@/lib/cart';
import { ShoppingBag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function StickyCartBar() {
  const { items, isOpen } = useCart();
  const [visible, setVisible] = useState(false);
  const [isSlidingDown, setIsSlidingDown] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    };
  }, []);

  // Show button when items are added, but ONLY if drawer is closed
  useEffect(() => {
    if (totalItems > 0 && !isOpen) {
      setVisible(true);
      setIsSlidingDown(false);
    } else if (totalItems === 0) {
      setVisible(false);
    } else if (isOpen) {
      setVisible(false); // 👈 This kills the button immediately when drawer opens
    }
  }, [totalItems, isOpen]);

  // Handle drawer closing -> Slide UP after 300ms delay
  useEffect(() => {
    const handleDrawerClosed = () => {
      if (totalItems > 0) {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

        closeTimeoutRef.current = setTimeout(() => {
          if (!isOpen && totalItems > 0) {
            setVisible(true);
            setIsSlidingDown(false);
            setIsEntering(true);

            enterTimeoutRef.current = setTimeout(() => {
              setIsEntering(false);
            }, 10);
          }
        }, 300);
      }
    };

    window.addEventListener('cart-drawer-closed', handleDrawerClosed);
    return () => window.removeEventListener('cart-drawer-closed', handleDrawerClosed);
  }, [totalItems, isOpen]);

  // 🔥 THE FIX: Physically prevents rendering if drawer is open
  if (totalItems === 0 || isOpen || !visible) return null;

  const handleOpenDrawer = () => {
    setIsSlidingDown(true);

    setTimeout(() => {
      setVisible(false);
      window.dispatchEvent(new Event('open-cart-drawer'));
    }, 10);
  };

  const translateClass = isSlidingDown 
    ? 'translate-y-16 opacity-0 pointer-events-none' 
    : isEntering 
      ? 'translate-y-16 opacity-0' 
      : 'translate-y-0 opacity-100';

  return (
    <div 
      className={`fixed bottom-8 right-6 z-[9999] transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${translateClass}`}
    >
      <button
        onClick={handleOpenDrawer}
        className="flex items-center gap-3 rounded-full bg-mustard-500 px-5 py-3.5 shadow-press hover:bg-mustard-600 hover:-translate-y-1 transition-all duration-300"
      >
        <ShoppingBag className="h-5 w-5 text-espresso-900" />
        <span className="font-bold text-espresso-900 text-sm">
          {totalItems} item{totalItems > 1 ? 's' : ''} · ₱{totalPrice.toFixed(2)}
        </span>
      </button>
    </div>
  );
}