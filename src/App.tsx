import { LoadingScreen } from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { CartProvider } from '@/lib/cart';
import { AdminProvider, useAdmin } from '@/lib/admin';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Ticker } from '@/components/Ticker';
import { MenuSection } from '@/components/MenuSection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { TrackOrder } from '@/components/TrackOrder';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { StickyCartBar } from '@/components/StickyCartBar';

type Page = 'home' | 'track' | 'admin-login' | 'admin';

function AppShell() {
  const [page, setPage] = useState<Page>('home');
  const [trackCode, setTrackCode] = useState<string | undefined>(undefined);
  const { session, loading } = useAdmin();

  useEffect(() => {
    if (page === 'admin-login' && !loading && session) {
      setPage('admin');
    }
    if (page === 'admin' && !loading && !session) {
      setPage('admin-login');
    }
  }, [page, session, loading]);

  useEffect(() => {
    const handler = (e: Event) => {
      const code = (e as CustomEvent<string>).detail;
      setTrackCode(code);
      setPage('track');
    };
    window.addEventListener('cc-track', handler as EventListener);
    return () => window.removeEventListener('cc-track', handler as EventListener);
  }, []);

  const goOrder = () => {
    if (page !== 'home') {
      setPage('home');
      requestAnimationFrame(() => setTimeout(() => scrollToMenu(), 80));
    } else {
      scrollToMenu();
    }
  };

  const scrollToMenu = () => {
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (page === 'admin-login' || page === 'admin') {
    if (loading) return null;
    if (page === 'admin' && session) {
      return <AdminDashboard onExit={() => setPage('home')} />;
    }
    return <AdminLogin onBack={() => setPage('home')} onSuccess={() => setPage('admin')} />;
  }

  if (page === 'track') {
    return (
      <div className="animate-fadeInUp transition-all duration-500 ease-in-out">
        <Navbar page={page} onNavigate={(p) => setPage(p as Page)} />
        <TrackOrder initialCode={trackCode} onBack={() => setPage('home')} />
        <Footer onAdmin={() => setPage('admin-login')} />
      </div>
    );
  }

  return (
    <>
      <LoadingScreen />
      <Navbar page={page} onNavigate={(p) => setPage(p as Page)} />
      
      <div className="animate-on-load">
        <div className="transition-all duration-500 ease-in-out animate-fadeInUp">
          <main className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #fcf9f5 0%, #ede0d4 100%)' }}>
            <Hero onOrder={goOrder} />
            <Ticker />
            <MenuSection />
            <ReviewsSection />
            <ContactSection onOrder={goOrder} />
          </main>
          <Footer onAdmin={() => setPage('admin-login')} />
        </div>
      </div>

      {/* MOVED OUTSIDE THE WRAPPER SO IT NEVER GETS BLOCKED */}
      <CartDrawer />
      <StickyCartBar />
    </>
  );
}

function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <MusicPlayer />
        <AppShell />
      </CartProvider>
    </AdminProvider>
  );
}

export default App;