"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  ChevronLeft, ChevronRight, Bell, Menu, X, ExternalLink,
  TrendingUp, Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      if (isAuthenticated && user?.role === "admin") {
        router.push("/admin");
      }
      return;
    }

    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, pathname, router]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    dispatch(logout());
    router.push("/");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  if (pathname === "/admin/login") {
    return <div className="h-screen bg-slate-50 dark:bg-slate-950">{children}</div>;
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-slate-200 dark:border-slate-700 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-slate-900 dark:text-white leading-tight">SmartCart</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive(href, exact)
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? label : ""}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-sm font-medium ${collapsed ? "justify-center" : ""}`}
          title="View Store"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "View Store"}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-sm font-medium ${collapsed ? "justify-center" : ""}`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 bottom-20 -right-3 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-primary-600 shadow-sm hidden lg:flex"
          style={{ left: collapsed ? "68px" : "252px" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 z-50 flex flex-col lg:hidden animate-slide-up">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 h-16 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden btn-icon"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block">
              {navItems.find(n => isActive(n.href, n.exact)) ? (
                <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {navItems.find(n => isActive(n.href, n.exact))?.label}
                </h1>
              ) : (
                <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white">Admin</h1>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
