"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import {
  ShoppingCart, Search, Sun, Moon, Menu, X, User, Heart,
  ChevronDown, Package, LogOut, LayoutDashboard, Bell,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCartCount } from "@/store/slices/cartSlice";
import { logout } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const categories = [
  "Electronics", "Fashion", "Home & Garden", "Sports",
  "Books", "Toys", "Beauty", "Automotive",
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setCategoryOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products", hasDropdown: true },
    { href: "/products?isFeatured=true", label: "Deals" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-700/50"
          : "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="section">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Smart<span className="gradient-text">Cart</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.href} className="relative">
                  <button
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className={`btn-ghost text-sm flex items-center gap-1 ${
                      pathname.startsWith("/products") ? "text-primary-600 dark:text-primary-400" : ""
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
                  </button>
                  {categoryOpen && (
                    <div className="absolute top-full left-0 mt-2 w-52 card p-2 animate-slide-down">
                      <Link href="/products" className="block px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg mb-1">
                        All Products
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/products?category=${encodeURIComponent(cat)}`}
                          className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`btn-ghost text-sm ${
                    pathname === link.href ? "text-primary-600 dark:text-primary-400" : ""
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center animate-scale-in">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-52 sm:w-64 px-4 py-2 text-sm input rounded-xl"
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  />
                  <button type="submit" className="btn-icon ml-1"><Search className="w-4 h-4" /></button>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="btn-icon">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="btn-icon" aria-label="Search">
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="btn-icon"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* Wishlist */}
            {isAuthenticated && (
              <Link href="/wishlist" className="btn-icon" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="btn-icon relative" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[80px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 card p-2 animate-slide-down z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    {user?.role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <hr className="my-1 border-slate-100 dark:border-slate-700" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden btn-icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-slide-down">
          <div className="section py-4 space-y-1">
            <Link href="/" className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Home</Link>
            <Link href="/products" className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">All Products</Link>
            {categories.map((cat) => (
              <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} className="block px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl pl-6">
                {cat}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 flex gap-2">
                <Link href="/auth/login" className="flex-1 btn-secondary text-sm text-center">Login</Link>
                <Link href="/auth/register" className="flex-1 btn-primary text-sm text-center">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay for dropdowns */}
      {(categoryOpen || userMenuOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setCategoryOpen(false); setUserMenuOpen(false); }} />
      )}
    </header>
  );
}
