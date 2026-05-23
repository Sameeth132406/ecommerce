import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
  phone?: string;
  addresses?: Address[];
  wishlist?: string[];
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
  isAuthenticated: !!getStoredUser(),
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    toggleWishlistItem: (state, action: PayloadAction<string>) => {
      if (!state.user) return;
      const idx = state.user.wishlist?.indexOf(action.payload) ?? -1;
      if (!state.user.wishlist) state.user.wishlist = [];
      if (idx === -1) {
        state.user.wishlist.push(action.payload);
      } else {
        state.user.wishlist.splice(idx, 1);
      }
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, updateUser, logout, setLoading, toggleWishlistItem } = authSlice.actions;
export default authSlice.reducer;
