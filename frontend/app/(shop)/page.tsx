"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, Shield, Truck, Star, ChevronRight, TrendingUp } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/Skeletons";
import api from "@/lib/axios";

const categoryIcons: Record<string, string> = {
  Electronics: "💻",
  Fashion: "👗",
  "Home & Garden": "🏠",
  Sports: "⚽",
  Books: "📚",
  Toys: "🧸",
  Beauty: "💄",
  Automotive: "🚗",
  Food: "🍕",
  Other: "📦",
};

const features = [
  { icon: Truck, title: "Free Delivery", desc: "On orders over ₹999", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Shield, title: "Secure Payment", desc: "100% protected checkout", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Zap, title: "Fast Shipping", desc: "Delivered in 3-5 days", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Star, title: "Top Quality", desc: "Verified products only", color: "text-purple-500", bg: "bg-purple-500/10" },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          api.get("/products/featured"),
          api.get("/products/categories"),
        ]);
        setFeaturedProducts(featRes.data.products);
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-hero-gradient overflow-hidden min-h-[600px] flex items-center">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />

        <div className="section relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <TrendingUp className="w-4 h-4 text-accent-400" />
              <span>Biggest Sale of the Season — Up to 60% OFF</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Shop Smarter,{" "}
              <span className="bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
                Live Better
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              Discover millions of products across hundreds of categories. Fast delivery, secure payments, and unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-accent text-base px-8 py-4">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/products?isFeatured=true" className="glass text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all">
                <Star className="w-5 h-5 text-amber-400" /> Top Deals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[
                { value: "50K+", label: "Products" },
                { value: "200K+", label: "Customers" },
                { value: "4.9★", label: "Avg Rating" },
                { value: "24/7", label: "Support" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white font-display">{value}</p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="section py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Shop by Category</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Find exactly what you're looking for</p>
          </div>
          <Link href="/products" className="btn-ghost hidden sm:flex">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat: any) => (
            <Link
              key={cat._id}
              href={`/products?category=${encodeURIComponent(cat._id)}`}
              className="card-hover p-6 flex flex-col items-center gap-3 text-center group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {categoryIcons[cat._id] || "📦"}
              </span>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{cat._id}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-16">
        <div className="section">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Featured Products</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Handpicked for you</p>
            </div>
            <Link href="/products?isFeatured=true" className="btn-ghost hidden sm:flex">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="section py-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-accent-500 p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700/50 to-transparent" />
          <div className="relative z-10 max-w-lg">
            <span className="badge bg-white/20 text-white mb-4 inline-block">Limited Time Offer</span>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded-lg">SMART10</span> for 10% OFF
            </h2>
            <p className="text-white/80 mb-6">
              Apply at checkout on your first order. No minimum purchase required.
            </p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
              <ShoppingBag className="w-5 h-5" /> Shop Now
            </Link>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[120px] opacity-20 hidden lg:block select-none">
            🛍️
          </div>
        </div>
      </section>
    </div>
  );
}
