"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/axios";
import Link from "next/link";
import { Package, ChevronRight, Clock } from "lucide-react";
import { OrderCardSkeleton } from "@/components/shared/Skeletons";

const statusColors: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-primary",
  shipped: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  delivered: "badge-success",
  cancelled: "badge-error",
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login?redirect=/orders"); return; }
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/my-orders?page=${page}&limit=10`);
        setOrders(res.data.orders);
        setPagination({ total: res.data.pagination.total, pages: res.data.pagination.pages });
      } catch { } finally { setLoading(false); }
    };
    fetchOrders();
  }, [isAuthenticated, page]);

  const imageUrl = (url: string) => url?.startsWith("http") ? url : `http://localhost:5000${url}`;

  return (
    <div className="section py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">My Orders</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{pagination.total} total orders</p>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`} className="card-hover block p-5 group">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-semibold text-slate-500">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`badge ${statusColors[order.orderStatus] || "badge-primary"} capitalize`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-900 dark:text-white">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-slate-500">{order.items?.length} item(s)</p>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {order.items?.slice(0, 4).map((item: any, i: number) => (
                    <div key={i} className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={imageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i}/100/100`; }}
                      />
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex-1 ml-2">
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">
                    {order.items?.[0]?.name}{order.items?.length > 1 ? ` and ${order.items.length - 1} more` : ""}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Previous</button>
              <span className="btn-secondary px-4 py-2 text-sm">{page} / {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
