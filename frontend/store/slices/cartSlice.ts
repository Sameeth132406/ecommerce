import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  brand?: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discount: number;
}

const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const c = localStorage.getItem("cart");
    return c ? JSON.parse(c) : [];
  } catch { return []; }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items));
  }
};

const initialState: CartState = {
  items: loadCart(),
  promoCode: null,
  discount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, action.payload.stock);
      } else {
        state.items.push(action.payload);
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(i => i._id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.promoCode = null;
      state.discount = 0;
      saveCart([]);
    },
    applyPromo: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      state.promoCode = action.payload.code;
      state.discount = action.payload.discount;
    },
    removePromo: (state) => {
      state.promoCode = null;
      state.discount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyPromo, removePromo } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartDiscount = (state: { cart: CartState }) => state.cart.discount;
export const selectPromoCode = (state: { cart: CartState }) => state.cart.promoCode;
