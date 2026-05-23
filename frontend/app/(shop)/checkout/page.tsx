"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems, selectCartSubtotal, selectCartDiscount, selectPromoCode, clearCart,
} from "@/store/slices/cartSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { CheckCircle, CreditCard, MapPin, Package, Loader2, Lock } from "lucide-react";
import Link from "next/link";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  phone: z.string().min(10, "Valid phone required"),
  street: z.string().min(5, "Street address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  zipCode: z.string().min(4, "ZIP code required"),
  country: z.string(),
});

type AddressForm = z.infer<typeof addressSchema>;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function PaymentForm({ onSuccess, total, orderData }: { onSuccess: (order: any) => void; total: number; orderData: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const res = await api.post("/orders", {
          ...orderData,
          paymentInfo: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            method: "card",
            paidAt: new Date(),
          },
        });
        dispatch(clearCart());
        onSuccess(res.data.order);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Order failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card p-5">
        <PaymentElement />
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Lock className="w-3.5 h-3.5 text-emerald-500" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>
      <button type="submit" disabled={!stripe || loading} className="btn-primary w-full py-4 text-base">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <>
          <CreditCard className="w-5 h-5" /> Pay ₹{total.toLocaleString("en-IN")}
        </>}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const discount = useAppSelector(selectCartDiscount);
  const promoCode = useAppSelector(selectPromoCode);

  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: success
  const [clientSecret, setClientSecret] = useState("");
  const [shippingAddress, setShippingAddress] = useState<AddressForm | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const shipping = subtotal > 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const discountAmount = Math.round((subtotal * discount) / 100 * 100) / 100;
  const total = subtotal + shipping + tax - discountAmount;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India" },
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login?redirect=/checkout"); return; }
    if (items.length === 0) { router.push("/cart"); return; }
    // Pre-fill default address
    const defaultAddr = user?.addresses?.find((a) => a.isDefault);
    if (defaultAddr) {
      Object.entries(defaultAddr).forEach(([k, v]) => setValue(k as any, v as any));
    }
  }, [isAuthenticated, items]);

  const onAddressSubmit = async (data: AddressForm) => {
    setShippingAddress(data);
    setLoadingPayment(true);
    try {
      const res = await api.post("/payments/create-payment-intent", { amount: total });
      setClientSecret(res.data.clientSecret);
      setStep(2);
    } catch (err: any) {
      // If stripe not configured, allow cod
      setStep(2);
      toast("Payment gateway not configured. Using demo mode.", { icon: "ℹ️" });
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleDemoOrder = async () => {
    setLoadingPayment(true);
    try {
      const res = await api.post("/orders", {
        items: items.map(i => ({ product: i._id, quantity: i.quantity })),
        shippingAddress,
        paymentInfo: { id: `demo_${Date.now()}`, status: "succeeded", method: "demo" },
        coupon: promoCode ? { code: promoCode } : null,
      });
      dispatch(clearCart());
      setCompletedOrder(res.data.order);
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleOrderSuccess = (order: any) => {
    setCompletedOrder(order);
    setStep(3);
  };

  const imageUrl = (url: string) => url?.startsWith("http") ? url : `http://localhost:5000${url}`;

  if (step === 3 && completedOrder) {
    return (
      <div className="section py-20 animate-fade-in">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3">Order Placed!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-2">Thank you for your purchase, {user?.name?.split(" ")[0]}!</p>
          <p className="text-sm text-slate-400 mb-8">
            Order ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">#{completedOrder._id.slice(-8).toUpperCase()}</span>
          </p>
          <div className="card p-5 mb-8 text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Order Summary</p>
            {completedOrder.items?.map((item: any) => (
              <div key={item._id} className="flex items-center gap-3 py-2 border-b last:border-0 border-slate-100 dark:border-slate-700">
                <img src={imageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/100/100"; }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
              </div>
            ))}
            <div className="pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{completedOrder.totalPrice?.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/orders/${completedOrder._id}`} className="btn-primary flex-1">Track Order</Link>
            <Link href="/products" className="btn-secondary flex-1">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: "Address", icon: MapPin },
          { n: 2, label: "Payment", icon: CreditCard },
          { n: 3, label: "Confirm", icon: CheckCircle },
        ].map(({ n, label, icon: Icon }, idx) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              step > n ? "bg-emerald-500 text-white" :
              step === n ? "bg-primary-600 text-white" :
              "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}>
              {step > n ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === n ? "text-primary-600 dark:text-primary-400" : "text-slate-400"}`}>{label}</span>
            {idx < 2 && <div className={`h-px w-8 sm:w-16 ${step > n + 1 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-6 animate-scale-in">
              <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" /> Shipping Address
              </h2>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Full Name *</label>
                  <input {...register("fullName")} className="input" placeholder="John Doe" />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Phone *</label>
                  <input {...register("phone")} className="input" placeholder="+91 98765 43210" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Street Address *</label>
                  <input {...register("street")} className="input" placeholder="123 Main Street, Apt 4B" />
                  {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">City *</label>
                  <input {...register("city")} className="input" placeholder="Bangalore" />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">State *</label>
                  <input {...register("state")} className="input" placeholder="Karnataka" />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">ZIP Code *</label>
                  <input {...register("zipCode")} className="input" placeholder="560001" />
                  {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Country</label>
                  <input {...register("country")} className="input" defaultValue="India" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={loadingPayment} className="btn-primary w-full py-4">
                    {loadingPayment ? <><Loader2 className="w-5 h-5 animate-spin" /> Setting up payment...</> : "Continue to Payment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6 animate-scale-in">
              <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" /> Payment
              </h2>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                  <PaymentForm
                    onSuccess={handleOrderSuccess}
                    total={total}
                    orderData={{
                      items: items.map(i => ({ product: i._id, quantity: i.quantity })),
                      shippingAddress,
                      coupon: promoCode ? { code: promoCode } : null,
                    }}
                  />
                </Elements>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
                    ℹ️ Stripe is in demo mode. Add your Stripe test keys to enable real payments.
                  </div>
                  <div className="card p-4 border-2 border-primary-500">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-5 h-5 text-primary-500" />
                      <span className="font-semibold">Demo Order (Pay on Delivery)</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Place a demo order to test the full flow</p>
                    <button onClick={handleDemoOrder} disabled={loadingPayment} className="btn-primary w-full">
                      {loadingPayment ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing order...</> : `Place Demo Order — ₹${total.toLocaleString("en-IN")}`}
                    </button>
                  </div>
                  <button onClick={() => setStep(1)} className="btn-ghost text-sm w-full">← Back to Address</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="card p-5 h-fit">
          <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto no-scrollbar">
            {items.map((item) => (
              <div key={item._id} className="flex gap-3">
                <img
                  src={imageUrl(item.image)}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item._id}/100/100`; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold text-primary-600">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-emerald-500" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST (18%)</span><span>₹{tax.toLocaleString("en-IN")}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span><span>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
            <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
              <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
