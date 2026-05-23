"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Plus, Edit2, Trash2, Search, X, Package, ImageOff, Loader2,
  Star, AlertTriangle,
} from "lucide-react";

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys", "Beauty", "Automotive", "Food", "Other"];

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  stock: number;
  ratings: number;
  numReviews: number;
  images: string[];
  isFeatured: boolean;
  description: string;
}

const emptyForm = {
  name: "", description: "", price: "", originalPrice: "", category: "Electronics",
  brand: "", stock: "", images: "", isFeatured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("keyword", search);
      if (categoryFilter) params.set("category", categoryFilter);
      params.set("page", page.toString());
      params.set("limit", "10");
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination({ total: res.data.pagination.total, pages: res.data.pagination.pages });
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search, categoryFilter]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      brand: product.brand,
      stock: product.stock.toString(),
      images: product.images.join(", "),
      isFeatured: product.isFeatured,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category || !form.brand) {
      return toast.error("Please fill all required fields");
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        brand: form.brand,
        stock: Number(form.stock) || 0,
        images: form.images.split(",").map((s: string) => s.trim()).filter(Boolean),
        isFeatured: form.isFeatured,
      };
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success("Product updated!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created!");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const imageUrl = (url: string) => url?.startsWith("http") ? url : `http://localhost:5000${url}`;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{pagination.total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 py-2.5 text-sm"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="input py-2.5 text-sm w-44"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Price</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Rating</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3" colSpan={6}>
                      <div className="h-12 skeleton rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={imageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product._id}/80/80`; }} />
                        ) : (
                          <ImageOff className="w-5 h-5 m-auto text-slate-400 mt-2.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[160px]">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="badge badge-primary">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">₹{product.price.toLocaleString("en-IN")}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${
                      product.stock === 0 ? "badge-error" :
                      product.stock <= 10 ? "badge-warning" : "badge-success"
                    }`}>
                      {product.stock === 0 ? "Out" : product.stock <= 10 ? `${product.stock} left` : product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{product.ratings?.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({product.numReviews})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="btn-icon w-8 h-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(product._id)}
                        className="btn-icon w-8 h-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Previous</button>
            <span className="btn-secondary px-4 py-2 text-sm">{page} / {pagination.pages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Product Name *", type: "text", placeholder: "Apple AirPods Pro", full: true },
                { key: "brand", label: "Brand *", type: "text", placeholder: "Apple" },
                { key: "price", label: "Price (₹) *", type: "number", placeholder: "24999" },
                { key: "originalPrice", label: "Original Price (₹)", type: "number", placeholder: "29999" },
                { key: "stock", label: "Stock Qty", type: "number", placeholder: "50" },
              ].map(({ key, label, type, placeholder, full }) => (
                <div key={key} className={full ? "sm:col-span-2" : ""}>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input text-sm py-2.5"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Category *</label>
                <select value={form.category} onChange={(e) => setForm((f: any) => ({ ...f, category: e.target.value }))} className="input text-sm py-2.5">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Image URLs (comma separated)</label>
                <input
                  type="text"
                  value={form.images}
                  onChange={(e) => setForm((f: any) => ({ ...f, images: e.target.value }))}
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  className="input text-sm py-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Product description..."
                  className="input text-sm py-2.5 resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f: any) => ({ ...f, isFeatured: e.target.checked }))}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Product</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : (editProduct ? "Update Product" : "Create Product")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-center text-slate-900 dark:text-white mb-2">Delete Product?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
