"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems, selectCartSubtotal, selectCartCount,
  removeFromCart, updateQuantity, clearCart, applyPromo, removePromo,
  selectCartDiscount, selectPromoCode,
} from "@/store/slices/cartSlice";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, Tag, X, ArrowRight, ShoppingBag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const VALID_PROMOS: Record<string, number> = {
  SMART10: 10,
  CART20: 20,
  WELCOME15: 15,
};

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const cartCount = useAppSelector(selectCartCount);
  const discount = useAppSelector(selectCartDiscount);
  const promoCode = useAppSelector(selectPromoCode);
  const [promoInput, setPromoInput] = useState("");

  const shipping = subtotal > 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const discountAmount = Math.round((subtotal * discount) / 100 * 100) / 100;
  const total = subtotal + shipping + tax - discountAmount;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      dispatch(applyPromo({ code, discount: VALID_PROMOS[code] }));
      toast.success(`${VALID_PROMOS[code]}% discount applied!`);
      setPromoInput("");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const imageUrl = (url: string) => url?.startsWith("http") ? url : `http://localhost:5000${url}`;

  if (items.length === 0) {
    return (
      <div className="section py-20 text-center animate-fade-in">
        <div className="text-8xl mb-6 animate-float inline-block">🛒</div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3">Your cart is empty</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="btn-primary px-8 py-4 text-base">
          <ShoppingBag className="w-5 h-5" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="section py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Shopping Cart <span className="text-slate-400 font-normal text-xl">({cartCount} items)</span>
        </h1>
        <button onClick={() => dispatch(clearCart())} className="btn-ghost text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 animate-slide-up">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                <img
                  src={imageUrl(item.image)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item._id}/200/200`; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{item.brand}</p>
                    <Link href={`/products/${item._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 text-sm transition-colors">
                      {item.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label="Remove"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-500">₹{item.price.toLocaleString("en-IN")} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Promo Code */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-500" /> Promo Code
            </h3>
            {promoCode ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div>
                  <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{promoCode}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">{discount}% off applied</p>
                </div>
                <button onClick={() => dispatch(removePromo())} className="text-emerald-600 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="input text-sm py-2.5 flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                />
                <button onClick={handleApplyPromo} className="btn-primary text-sm px-4 py-2.5">Apply</button>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">Try: SMART10, CART20, WELCOME15</p>
          </div>

          {/* Price Breakdown */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({cartCount} items)</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-emerald-500 font-medium" : ""}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax (18% GST)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount ({promoCode})</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {shipping === 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  ✓ You qualify for free shipping!
                </p>
              )}
              {shipping > 0 && (
                <p className="text-xs text-slate-400">
                  Add ₹{(999 - subtotal).toLocaleString("en-IN")} more for free shipping
                </p>
              )}
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full mt-5 py-4 text-base justify-center">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/products" className="btn-ghost w-full mt-2 text-sm justify-center">
              <ShoppingCart className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
