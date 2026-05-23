"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Search, X, ShoppingBag, Clock, Package, Truck, CheckCircle, XCircle,
  ChevronDown, Eye, Loader2,
} from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "badge-warning", icon: Clock },
  processing: { label: "Processing", color: "badge-primary", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300", icon: Truck },
  delivered: { label: "Delivered", color: "badge-success", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "badge-error", icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "15");
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
      setPagination({ total: res.data.pagination.total, pages: res.data.pagination.pages });
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order updated to ${status}`);
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const imageUrl = (url: string) => url?.startsWith("http") ? url : `http://localhost:5000${url}`;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{pagination.total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === status
                  ? "bg-primary-600 text-white shadow-md"
                  : "btn-secondary text-xs py-2 px-3"
              }`}
            >
              {status === "" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Items</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-12 skeleton rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : orders.map((order) => {
                const sc = statusConfig[order.orderStatus] || { label: order.orderStatus, color: "badge-primary", icon: Package };
                const StatusIcon = sc.icon;
                return (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono font-semibold text-slate-900 dark:text-white text-xs">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{order.user?.name || "N/A"}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex -space-x-2">
                        {order.items?.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-8 h-8 rounded-lg border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-700">
                            <img
                              src={imageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i}/60/60`; }}
                            />
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-8 h-8 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-slate-900 dark:text-white">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-slate-400">{order.items?.length} item(s)</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${sc.color} flex items-center gap-1 w-fit mx-auto`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                      {order.isPaid && <span className="badge badge-success text-xs mt-1">Paid</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {updating === order._id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary-500" />
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            disabled={order.orderStatus === "cancelled" || order.orderStatus === "delivered"}
                            className="text-xs py-1.5 px-2 pr-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}
