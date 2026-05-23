"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  Truck, XCircle, BarChart2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import Link from "next/link";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [productStats, setProductStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orderRes, productRes, userRes] = await Promise.all([
          api.get("/orders/admin/stats"),
          api.get("/products/admin/stats"),
          api.get("/users/admin/stats"),
        ]);
        setStats(orderRes.data);
        setProductStats(productRes.data);
        setUserStats(userRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const revenueChartData = stats?.revenueByMonth?.map((m: any) => ({
    name: MONTHS[m._id.month - 1],
    Revenue: Math.round(m.revenue),
    Orders: m.orders,
  })) || [];

  const statusChartData = stats?.ordersByStatus?.map((s: any) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
    key: s._id,
  })) || [];

  const kpis = [
    {
      label: "Total Revenue",
      value: stats ? `₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}` : "—",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      change: "+12.5%",
      up: true,
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? "—",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      change: "+8.2%",
      up: true,
    },
    {
      label: "Total Products",
      value: productStats?.total ?? "—",
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      change: productStats?.lowStock ? `${productStats.lowStock} low stock` : "",
      up: false,
    },
    {
      label: "Total Users",
      value: userStats?.total ?? "—",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      change: userStats ? `+${userStats.newThisMonth} this month` : "",
      up: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-72 skeleton rounded-2xl" />
          <div className="h-72 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map(({ label, value, icon: Icon, color, bg, change, up }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              {change && (
                <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {change}
                </div>
              )}
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Revenue Overview</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly revenue & orders</p>
            </div>
            <BarChart2 className="w-5 h-5 text-slate-400" />
          </div>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-slate-500" />
                <YAxis tick={{ fontSize: 12 }} className="text-slate-500" />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#fff" }}
                  formatter={(value: any, name: string) => [
                    name === "Revenue" ? `₹${value.toLocaleString("en-IN")}` : value,
                    name
                  ]}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No revenue data yet</p>
                <p className="text-xs mt-1">Seed data or create orders to see charts</p>
              </div>
            </div>
          )}
        </div>

        {/* Orders by Status Pie */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-1">Order Status</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Distribution by status</p>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.key] || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, n: string) => [v, n]} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View all
            </Link>
          </div>
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order: any) => {
                const statusIcon = {
                  pending: <Clock className="w-4 h-4 text-amber-500" />,
                  processing: <Package className="w-4 h-4 text-blue-500" />,
                  shipped: <Truck className="w-4 h-4 text-purple-500" />,
                  delivered: <CheckCircle className="w-4 h-4 text-emerald-500" />,
                  cancelled: <XCircle className="w-4 h-4 text-red-500" />,
                }[order.orderStatus] || null;

                return (
                  <Link key={order._id} href={`/admin/orders`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      {statusIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-slate-500 truncate">{order.user?.name || "N/A"} • {order.items?.length} item(s)</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-slate-500 capitalize">{order.orderStatus}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          )}
        </div>

        {/* Product & User Stats */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Inventory Health</h3>
            <div className="space-y-3">
              {[
                { label: "Total Products", value: productStats?.total || 0, color: "text-slate-900 dark:text-white" },
                { label: "Low Stock (≤10)", value: productStats?.lowStock || 0, color: "text-amber-600 dark:text-amber-400" },
                { label: "Out of Stock", value: productStats?.outOfStock || 0, color: "text-red-600 dark:text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  <span className={`font-bold text-sm ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            <Link href="/admin/products" className="btn-primary w-full mt-4 text-sm py-2.5 justify-center">
              Manage Products
            </Link>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Users</h3>
            <div className="space-y-3">
              {[
                { label: "Total Users", value: userStats?.total || 0 },
                { label: "Admins", value: userStats?.admins || 0 },
                { label: "Customers", value: userStats?.customers || 0 },
                { label: "New This Month", value: userStats?.newThisMonth || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
            <Link href="/admin/users" className="btn-secondary w-full mt-4 text-sm py-2.5 justify-center">
              Manage Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
