"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, SlidersHorizontal, Grid3X3, List, ChevronDown, X, Search } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/Skeletons";
import api from "@/lib/axios";

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys", "Beauty", "Automotive", "Food"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (rating) params.set("rating", rating);
      if (inStock) params.set("inStock", "true");
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, minPrice, maxPrice, rating, inStock, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const clearFilters = () => {
    setKeyword(""); setCategory(""); setSort("newest");
    setMinPrice(""); setMaxPrice(""); setRating(""); setInStock(false); setPage(1);
  };

  const activeFiltersCount = [category, minPrice, maxPrice, rating, inStock ? "inStock" : ""].filter(Boolean).length;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !category ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                category === cat ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input text-sm py-2 px-3"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input text-sm py-2 px-3"
          />
        </div>
        <button onClick={() => setPage(1)} className="btn-primary text-sm py-2 w-full mt-2">Apply</button>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {["", "4", "3", "2"].map((r) => (
            <button
              key={r}
              onClick={() => { setRating(r); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                rating === r ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {r ? `${r}★ & above` : "All Ratings"}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
            className="w-4 h-4 rounded accent-primary-600"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">In Stock Only</span>
        </label>
      </div>

      {activeFiltersCount > 0 && (
        <button onClick={clearFilters} className="btn-secondary text-sm w-full flex items-center gap-2 justify-center text-red-600 dark:text-red-400">
          <X className="w-4 h-4" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="section py-8">
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="badge-primary">{activeFiltersCount}</span>
              )}
            </div>
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {category || "All Products"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {pagination.total} results {keyword && `for "${keyword}"`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden btn-secondary text-sm flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="input text-sm py-2.5 pr-8 cursor-pointer appearance-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(keyword || category || minPrice || maxPrice || rating || inStock) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {keyword && (
                <span className="badge-primary flex items-center gap-1 py-1">
                  Search: {keyword}
                  <button onClick={() => setKeyword("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {category && (
                <span className="badge-primary flex items-center gap-1 py-1">
                  {category}
                  <button onClick={() => setCategory("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="badge-primary flex items-center gap-1 py-1">
                  ₹{minPrice || 0} - ₹{maxPrice || "∞"}
                  <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {rating && (
                <span className="badge-primary flex items-center gap-1 py-1">
                  {rating}★+
                  <button onClick={() => setRating("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStock && (
                <span className="badge-primary flex items-center gap-1 py-1">
                  In Stock
                  <button onClick={() => setInStock(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No products found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = pagination.pages <= 5 ? i + 1 :
                  page <= 3 ? i + 1 :
                  page >= pagination.pages - 2 ? pagination.pages - 4 + i :
                  page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      page === pageNum
                        ? "bg-primary-600 text-white shadow-md"
                        : "btn-secondary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 z-50 p-6 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">Filters</h2>
              <button onClick={() => setSidebarOpen(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <FilterSidebar />
          </div>
        </>
      )}
    </div>
  );
}
