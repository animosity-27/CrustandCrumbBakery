import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LayoutDashboard, Package, Boxes, Star, LogOut, TrendingUp, DollarSign,
  ShoppingBag, ChefHat, CheckCircle2, XCircle, Loader2, RefreshCw,
  ArrowLeft, ChevronDown, Trash2, Send, Plus, Minus, Save, Search,
} from 'lucide-react';
import { supabase, formatPeso, PAYMENT_LABELS, type Order, type OrderStatus, type Product, type Review } from '@/lib/supabase';
import { useAdmin } from '@/lib/admin';
import { StarRating } from '@/components/StarRating';
import { ScoreSlash } from '@/components/Decorations';

type Tab = 'overview' | 'orders' | 'inventory' | 'reviews';

type AdminDashboardProps = {
  onExit: () => void;
};

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const { signOut } = useAdmin();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const { data, error } = await supabase.rpc('admin_stats');
    if (!error && data) setStats(data as AdminStats);
    setLoadingStats(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSignOut = async () => {
    await signOut();
    onExit();
  };

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-cream-200">
      <header className="sticky top-0 z-30 border-b border-kraft-300/60 bg-cream-100/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="grid h-9 w-9 place-items-center text-espresso-600 hover:bg-kraft-200/70"
              aria-label="Back to store"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="cc-frame grid h-8 w-8 place-items-center bg-espresso-800 text-mustard-400"><ScoreSlash className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-base font-extrabold leading-none text-espresso-800">Crust &amp; Crumb</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-600">Admin Dashboard</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 bg-espresso-800/10 px-4 py-2 text-sm font-bold text-espresso-800 transition-colors hover:bg-espresso-800/20"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors ${
                    active ? 'text-sage-700' : 'text-espresso-500 hover:text-espresso-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-sage-500" />}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {tab === 'overview' && <Overview stats={stats} loading={loadingStats} onRefresh={loadStats} />}
        {tab === 'orders' && <OrdersManager />}
        {tab === 'inventory' && <InventoryManager />}
        {tab === 'reviews' && <ReviewsManager />}
      </main>
    </div>
  );
}

/* ----------------------------- Overview ----------------------------- */
type AdminStats = {
  total_orders: number;
  total_revenue: number;
  total_reviews: number;
  avg_rating: number;
  top_product: string;
  by_status: Record<string, number>;
};

function Overview({
  stats,
  loading,
  onRefresh,
}: {
  stats: AdminStats | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (loading || !stats) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sage-500" /></div>;
  }

  const cards = [
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, color: 'sage' },
    { label: 'Total Revenue', value: formatPeso(Number(stats.total_revenue)), icon: DollarSign, color: 'gold' },
    { label: 'Total Reviews', value: stats.total_reviews, icon: Star, color: 'mustard' },
    { label: 'Avg Rating', value: `${stats.avg_rating} ★`, icon: TrendingUp, color: 'sage' },
  ];

  const statusInfo: { status: OrderStatus; label: string; icon: typeof Package }[] = [
    { status: 'preparing', label: 'Preparing', icon: ChefHat },
    { status: 'received', label: 'New Orders', icon: Package },
    { status: 'ready', label: 'Ready', icon: CheckCircle2 },
    { status: 'completed', label: 'Completed', icon: CheckCircle2 },
    { status: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-espresso-800">Overview</h1>
        <button onClick={onRefresh} className="cc-notch inline-flex items-center gap-1.5 bg-cream-100 px-4 py-2 text-sm font-bold text-espresso-700 ring-1 ring-kraft-300/60 hover:bg-kraft-200">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="cc-card bg-cream-100 p-5 shadow-soft ring-1 ring-kraft-300/50" style={{ animation: `popIn 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-espresso-500">{c.label}</span>
                <Icon className="h-5 w-5 text-sage-500" />
              </div>
              <p className="font-receipt mt-3 text-3xl font-black text-espresso-800">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cc-card bg-cream-100 p-6 shadow-soft ring-1 ring-kraft-300/50">
          <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-500">Top Product</p>
          <p className="font-display mt-2 text-xl font-extrabold text-espresso-800">{stats.top_product}</p>
          <div className="scoring-divider mt-3 w-full opacity-40" />
          <div className="mt-4 border-t border-kraft-300/60 pt-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-500">Website Rating</p>
            <div className="mt-1.5 flex items-center gap-2">
              <StarRating value={stats.avg_rating} size={20} />
              <span className="font-receipt text-xl font-extrabold text-espresso-800">{stats.avg_rating}</span>
              <span className="text-sm text-espresso-500">/ 5</span>
            </div>
          </div>
        </div>

        <div className="cc-card bg-cream-100 p-6 shadow-soft ring-1 ring-kraft-300/50">
          <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-500">Orders by Status</p>
          <ul className="mt-3 space-y-2.5">
            {statusInfo.map((s) => {
              const Icon = s.icon;
              const count = stats.by_status?.[s.status] ?? 0;
              return (
                <li key={s.status} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-espresso-700">
                    <Icon className="h-4 w-4 text-sage-500" /> {s.label}
                  </span>
                  <span className="font-receipt text-lg font-extrabold text-espresso-800">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Orders ----------------------------- */
function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, { product_name: string; price: number; quantity: number }[]>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setOrders(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!itemsByOrder[id]) {
      const { data } = await supabase.from('order_items').select('product_name, price, quantity').eq('order_id', id);
      setItemsByOrder((prev) => ({ ...prev, [id]: data ?? [] }));
    }
  };

  const changeStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const togglePaid = async (id: string, paid: boolean) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paid } : o)));
    await supabase.from('orders').update({ paid }).eq('id', id);
  };

  // Delete order without alert
  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const deleteOrder = async (id: string) => {
    setDeletingId(null);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await supabase.from('orders').delete().eq('id', id);
  };

  const filters: { id: OrderStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'received', label: 'New' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return o.code.toLowerCase().includes(term) || o.customer_name.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-espresso-800">Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400" />
            <input
              type="text"
              placeholder="Search code or name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cc-input !pl-9 !py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  filter === f.id ? 'bg-sage-500 text-white' : 'bg-cream-100 text-espresso-600 ring-1 ring-kraft-300/60 hover:bg-kraft-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sage-500" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-cream-100 p-12 text-center text-espresso-600 ring-1 ring-kraft-300/50">No orders match your criteria.</div>
      ) : (
        <ul className="space-y-3">
          {filteredOrders.map((o) => (
            <li key={o.id} className="cc-card scoring-top bg-cream-100 shadow-soft ring-1 ring-kraft-300/50">
              <button
                type="button"
                onClick={() => toggle(o.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[o.status]}`} />
                  <div>
                    <p className="font-receipt text-base font-extrabold tracking-wider text-espresso-800">{o.code}</p>
                    <p className="text-xs text-espresso-500">
                      {o.customer_name} · {new Date(o.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-receipt text-sm font-extrabold text-espresso-800">{formatPeso(Number(o.total))}</span>
                  <span className="hidden rounded-full bg-kraft-200 px-3 py-1 text-xs font-bold text-espresso-700 sm:inline">{PAYMENT_LABELS[o.payment_method]}</span>
                  {o.paid ? (
                    <span className="text-xs font-bold text-sage-600">Paid</span>
                  ) : (
                    <span className="text-xs font-bold text-mustard-600">Unpaid</span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-espresso-500 transition-transform ${expanded === o.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-kraft-300/60 px-5 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-500">Items</p>
                      <ul className="mt-2 space-y-1">
                        {(itemsByOrder[o.id] ?? []).map((it, i) => (
                          <li key={i} className="flex justify-between text-sm text-espresso-700">
                            <span>{it.quantity}× {it.product_name}</span>
                            <span>{formatPeso(Number(it.price) * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      {o.note && <p className="mt-2 bg-kraft-100 p-2 text-xs italic text-espresso-600">&ldquo;{o.note}&rdquo;</p>}
                    </div>
                    <div className="text-sm text-espresso-700">
                      <p><span className="font-bold">Contact:</span> {o.customer_contact || '—'}</p>
                      <p className="mt-1"><span className="font-bold">Pickup:</span> {o.pickup_slot}</p>
                      <p className="mt-1"><span className="font-bold">Payment:</span> {PAYMENT_LABELS[o.payment_method]}</p>
                      {o.payment_proof && (
                        <p className="mt-1">
                          <a href={o.payment_proof} target="_blank" rel="noopener noreferrer" className="text-sage-600 underline">View payment proof</a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-kraft-300/60 pt-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-500">Status</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(['received', 'preparing', 'ready', 'completed', 'cancelled'] as OrderStatus[]).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => changeStatus(o.id, s)}
                              className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${
                                o.status === s
                                  ? 'bg-espresso-800 text-cream-100'
                                  : 'bg-kraft-200 text-espresso-700 hover:bg-kraft-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-500">Payment</p>
                        <button
                          type="button"
                          onClick={() => togglePaid(o.id, !o.paid)}
                          className={`mt-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                            o.paid ? 'bg-sage-500 text-white' : 'bg-kraft-200 text-espresso-700 hover:bg-kraft-300'
                          }`}
                        >
                          {o.paid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </div>
                    </div>

                    {/* ✅ CLEAN DELETE CONFIRMATION (No alert) */}
                    <div className="mt-4 pt-4 border-t border-red-200/30">
                      {deletingId === o.id ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-red-700">Delete this order?</span>
                          <button
                            type="button"
                            onClick={() => deleteOrder(o.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                          >
                            Yes, Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="text-xs font-bold text-espresso-600 hover:text-espresso-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => confirmDelete(o.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const STATUS_DOT: Record<OrderStatus, string> = {
  received: 'bg-mustard-500',
  preparing: 'bg-blue-400',
  ready: 'bg-sage-500',
  completed: 'bg-espresso-600',
  cancelled: 'bg-red-500',
};

/* ----------------------------- Inventory ----------------------------- */
function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, { stock: number; price: number; name: string; is_active: boolean }>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (p: Product) => {
    setEditing((prev) => ({
      ...prev,
      [p.id]: { stock: p.stock, price: Number(p.price), name: p.name, is_active: p.is_active },
    }));
  };

  const save = async (id: string) => {
    const ed = editing[id];
    if (!ed) return;
    await supabase.from('products').update({ stock: ed.stock, price: ed.price, name: ed.name, is_active: ed.is_active }).eq('id', id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: ed.stock, price: ed.price, name: ed.name, is_active: ed.is_active } : p)));
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  };

  const adjust = (id: string, field: 'stock' | 'price', delta: number) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: Math.max(0, prev[id][field] + delta) },
    }));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sage-500" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-espresso-800">Inventory &amp; Stocking</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="cc-notch inline-flex items-center gap-1.5 bg-sage-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-sage-600">
            <Plus className="h-4 w-4" /> Add Product
          </button>
          <button onClick={load} className="inline-flex items-center gap-1.5 bg-cream-100 px-4 py-2 text-sm font-bold text-espresso-700 ring-1 ring-kraft-300/60 hover:bg-kraft-200">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const ed = editing[p.id];
          const low = p.stock <= 5;
          return (
            <div key={p.id} className="cc-card scoring-top bg-cream-100 p-5 shadow-soft ring-1 ring-kraft-300/50">
              <div className="flex gap-3">
                <img src={p.image} alt={p.name} className="h-16 w-16 flex-shrink-0 object-cover" />
                <div className="flex-1">
                  {ed ? (
                    <input value={ed.name} onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: { ...prev[p.id], name: e.target.value } }))} className="cc-input !py-1.5 !text-sm font-bold" />
                  ) : (
                    <p className="font-display text-sm font-extrabold text-espresso-800">{p.name}</p>
                  )}
                  <p className="mt-1 text-xs text-espresso-500">
                    {p.is_active ? 'Active' : 'Hidden'} · {low && p.is_active ? <span className="font-bold text-mustard-700">Low stock</span> : 'In stock'}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-espresso-500">Stock</p>
                  {ed ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <button onClick={() => adjust(p.id, 'stock', -1)} className="grid h-7 w-7 place-items-center bg-kraft-200 hover:bg-kraft-300"><Minus className="h-3.5 w-3.5" /></button>
                      <input type="number" value={ed.stock} onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: { ...prev[p.id], stock: Number(e.target.value) } }))} className="cc-input !py-1 !px-2 text-center text-sm font-bold" />
                      <button onClick={() => adjust(p.id, 'stock', 1)} className="grid h-7 w-7 place-items-center bg-kraft-200 hover:bg-kraft-300"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <p className={`font-receipt mt-1 text-xl font-extrabold ${low ? 'text-mustard-700' : 'text-espresso-800'}`}>{p.stock}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-espresso-500">Price</p>
                  {ed ? (
                    <input type="number" value={ed.price} onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: { ...prev[p.id], price: Number(e.target.value) } }))} className="cc-input mt-1 !py-1 !px-2 text-sm font-bold" />
                  ) : (
                    <p className="font-receipt mt-1 text-xl font-extrabold text-espresso-800">{formatPeso(Number(p.price))}</p>
                  )}
                </div>
              </div>

              {ed && (
                <label className="mt-3 flex items-center gap-2 text-xs font-bold text-espresso-700">
                  <input type="checkbox" checked={ed.is_active} onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: { ...prev[p.id], is_active: e.target.checked } }))} className="h-4 w-4 accent-sage-500" />
                  Visible on storefront
                </label>
              )}

              <div className="mt-4 flex justify-end gap-2">
                {ed ? (
                  <>
                    <button onClick={() => setEditing((prev) => { const n = { ...prev }; delete n[p.id]; return n; })} className="px-4 py-2 text-xs font-bold text-espresso-600 hover:bg-kraft-200">Cancel</button>
                    <button onClick={() => save(p.id)} className="inline-flex items-center gap-1.5 bg-sage-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-sage-600"><Save className="h-3.5 w-3.5" /> Save</button>
                  </>
                ) : (
                  <button onClick={() => startEdit(p)} className="bg-cream-200 px-4 py-2 text-xs font-bold text-espresso-700 ring-1 ring-kraft-300/60 hover:bg-kraft-200">
                    {saved === p.id ? 'Saved!' : 'Edit'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onSuccess={load} />}
    </div>
  );
}

function AddProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !stock) return;
    setSubmitting(true);
    const { error } = await supabase.from('products').insert({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      image: image.trim() || 'https://via.placeholder.com/400',
      warm_filter: false,
      is_active: true,
      sort_order: 999,
    });
    setSubmitting(false);
    if (error) {
      alert('Error adding product: ' + error.message);
      return;
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-cream-100 p-6 shadow-ticket">
        <h3 className="font-display text-xl font-extrabold text-espresso-800">Add New Product</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="cc-input" required /></Field>
          <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="cc-input resize-none" rows={2} /></Field>
          <Field label="Price (₱)"><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="cc-input" required /></Field>
          <Field label="Stock"><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="cc-input" required /></Field>
          <Field label="Image URL (optional)"><input value={image} onChange={(e) => setImage(e.target.value)} className="cc-input" placeholder="https://..." /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-espresso-600 hover:bg-kraft-200">Cancel</button>
            <button type="submit" disabled={submitting} className="cc-notch bg-sage-500 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="text-xs font-bold uppercase tracking-wider text-espresso-700">{label}</span><div className="mt-1.5">{children}</div></label>);
}

/* ----------------------------- Reviews ----------------------------- */
function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveReply = async (id: string) => {
    await supabase.from('reviews').update({ admin_reply: replyText.trim() || null }).eq('id', id);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, admin_reply: replyText.trim() || null } : r)));
    setReplying(null);
    setReplyText('');
  };

  const remove = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('reviews').delete().eq('id', id);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sage-500" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-espresso-800">Reviews</h1>
        <button onClick={load} className="inline-flex items-center gap-1.5 bg-cream-100 px-4 py-2 text-sm font-bold text-espresso-700 ring-1 ring-kraft-300/60 hover:bg-kraft-200">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-cream-100 p-12 text-center text-espresso-600 ring-1 ring-kraft-300/50">No reviews yet.</div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="cc-card scoring-top bg-cream-100 p-5 shadow-soft ring-1 ring-kraft-300/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} size={15} />
                    <span className="text-xs font-bold text-espresso-500">
                      {new Date(r.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-espresso-700">&ldquo;{r.body}&rdquo;</p>
                  <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-gold-700">— {r.author}</p>
                </div>
                <button onClick={() => remove(r.id)} className="grid h-8 w-8 place-items-center text-espresso-400 transition-colors hover:bg-red-100 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {r.admin_reply && replying !== r.id && (
                <div className="mt-3 bg-sage-500/10 p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-sage-700">Your reply</p>
                  <p className="mt-1 text-xs text-espresso-700">{r.admin_reply}</p>
                </div>
              )}

              {replying === r.id ? (
                <div className="mt-3">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply…" rows={2} className="cc-input resize-none" />
                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={() => { setReplying(null); setReplyText(''); }} className="px-3 py-1.5 text-xs font-bold text-espresso-600 hover:bg-kraft-200">Cancel</button>
                    <button onClick={() => saveReply(r.id)} className="inline-flex items-center gap-1.5 bg-sage-500 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-sage-600">
                      <Send className="h-3.5 w-3.5" /> Post Reply
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setReplying(r.id); setReplyText(r.admin_reply ?? ''); }} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 hover:text-sage-700">
                  <Send className="h-3.5 w-3.5" /> {r.admin_reply ? 'Edit reply' : 'Reply'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}