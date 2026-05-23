"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/axios";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft, MapPin, CreditCard } from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock, color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30" },
  { key: "processing", label: "Processing", icon: Package, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30" },
  { key: "shipped", label: "Shipped", icon: Truck, color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30" },
];

const statusOrder = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch {
        router.push("/orders");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id, isAuthenticated]);

  const imageUrl = (url: string) => url?.startsWith("http") ? url : `http://localhost:5000${url}`;

  if (loading) {
    return (
      <div className="section py-10">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIdx = statusOrder.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <div className="section py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders" className="btn-icon"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-6">Order Status</h2>
            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
                  <p className="text-sm text-red-500">This order has been cancelled</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Progress line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 dark:bg-slate-700 hidden sm:block">
                  <div
                    className="h-full bg-primary-500 transition-all duration-700"
                    style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted ? step.color : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="sm:text-center">
                          <p className={`text-sm font-medium ${isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                            {step.label}
                          </p>
                          {order.statusHistory?.find((h: any) => h.status === step.key) && (
                            <p className="text-xs text-slate-400">
                              {new Date(order.statusHistory.find((h: any) => h.status === step.key).updatedAt).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {order.estimatedDelivery && !isCancelled && order.orderStatus !== "delivered" && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500">
                  Estimated delivery: <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item._id} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    <img
                      src={imageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/100/100`; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-500">₹{item.price.toLocaleString("en-IN")} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price Summary */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-lg mb-4">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items total</span><span>₹{order.itemsPrice?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className={order.shippingPrice === 0 ? "text-emerald-500" : ""}>
                  {order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST</span><span>₹{order.taxPrice?.toLocaleString("en-IN")}</span>
              </div>
              {order.coupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({order.coupon.code})</span>
                  <span>-₹{order.coupon.discount?.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
              <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                <span>Total Paid</span><span>₹{order.totalPrice?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" /> Delivery Address
            </h3>
            {order.shippingAddress && (
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="font-medium">📞 {order.shippingAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-500" /> Payment
            </h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p>Method: <span className="font-medium capitalize">{order.paymentInfo?.method || "N/A"}</span></p>
              <p>Status: <span className={`font-medium ${order.isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {order.isPaid ? "✓ Paid" : "Pending"}
              </span></p>
              {order.paymentInfo?.id && (
                <p className="text-xs text-slate-400 font-mono truncate">ID: {order.paymentInfo.id}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
