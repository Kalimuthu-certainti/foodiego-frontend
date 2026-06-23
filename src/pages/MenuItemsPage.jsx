import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants, getMenuItems } from '../api/bulkUpload';
import RestaurantDropdown from '../components/RestaurantDropdown';
import AppLayout from '../components/AppLayout';

const STATUS_STYLES = {
  active:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Active'    },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-500',  dot: 'bg-slate-400',  label: 'Inactive'  },
  sold_out: { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500',    label: 'Sold Out'  },
};

const FOOD_TYPE_DOT = {
  veg:     'bg-green-500',
  non_veg: 'bg-red-500',
  egg:     'bg-yellow-500',
};

function SkeletonItem() {
  return (
    <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-50">
      <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded animate-pulse w-48" />
        <div className="h-3 bg-slate-100 rounded animate-pulse w-32" />
      </div>
      <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
    </div>
  );
}

export default function MenuItemsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then((res) => {
        const list = res.data?.data || [];
        setRestaurants(list);
        if (list.length > 0) setRestaurantId(list[0].restaurant_id);
      })
      .finally(() => setLoadingRestaurants(false));
  }, []);

  const fetchItems = useCallback((rid, q) => {
    if (!rid) return;
    setLoading(true);
    getMenuItems(rid, q)
      .then((res) => {
        const data = res.data?.data || {};
        const fetched = data.items || [];
        setAllItems(fetched);
        setItems(fetched);
        setTotalItems(data.totalItems || 0);
        setTotalCategories(data.totalCategories || 0);
        setActiveCategory('All');
      })
      .catch(() => { setAllItems([]); setItems([]); setTotalItems(0); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(restaurantId, ''); }, [restaurantId]);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(restaurantId, search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const categories = ['All', ...Array.from(new Set(allItems.map(i => i.category).filter(Boolean)))];

  const filtered = activeCategory === 'All'
    ? items
    : items.filter(item => item.category === activeCategory);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
  };

  const vegCount = allItems.filter(i => (i.food_type || '').toLowerCase() === 'veg').length;
  const nonVegCount = allItems.filter(i => (i.food_type || '').toLowerCase() === 'non-veg' || (i.food_type || '').toLowerCase() === 'non_veg').length;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Menu Items</h1>
            <p className="text-slate-400 text-sm mt-1">Browse and manage all imported menu items</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Import
          </button>
        </div>

        {/* Restaurant + Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex flex-col gap-4">
          {loadingRestaurants ? (
            <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
          ) : (
            <RestaurantDropdown restaurants={restaurants} value={restaurantId} onChange={setRestaurantId} />
          )}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search menu items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Items',  value: totalItems,      color: 'text-orange-500' },
            { label: 'Categories',   value: totalCategories, color: 'text-blue-500'   },
            { label: 'Veg Items',    value: vegCount,        color: 'text-green-500'  },
            { label: 'Non-Veg',      value: nonVegCount,     color: 'text-red-500'    },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category Filter Chips */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-orange-100' : 'text-slate-400'}`}>
                    ({allItems.filter(i => i.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Items List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              {activeCategory === 'All' ? 'All Items' : activeCategory}
            </h2>
            <span className="text-xs text-slate-400">
              {search ? `${filtered.length} of ${totalItems}` : `${filtered.length} items`}
            </span>
          </div>

          {loading ? (
            <div>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <p className="text-slate-600 font-semibold">No items found</p>
              <p className="text-slate-400 text-sm mt-1">{search ? 'Try a different search term' : 'Upload a file to import menu items'}</p>
              {!search && (
                <button onClick={() => navigate('/')} className="mt-4 px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition">
                  Bulk Import
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((item, i) => {
                const s = STATUS_STYLES[item.status] || STATUS_STYLES.inactive;
                const foodDot = FOOD_TYPE_DOT[(item.food_type || '').toLowerCase().replace('-', '_')] || 'bg-slate-300';
                return (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                    {/* Food type indicator + placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 relative">
                      <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${foodDot}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.item_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{item.category}{item.sub_category ? ` · ${item.sub_category}` : ''}</span>
                        {item.price && (
                          <span className="text-xs font-bold text-orange-500">₹{parseFloat(item.price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.is_featured && (
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-xs font-semibold rounded-full border border-yellow-200">
                          ★ Featured
                        </span>
                      )}
                      {item.is_bestseller && (
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-200">
                          Bestseller
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <button className="text-slate-200 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
