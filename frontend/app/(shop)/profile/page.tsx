"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser, logout } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { User, Package, Heart, MapPin, Lock, LogOut, Camera, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [fullUser, setFullUser] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    setName(user?.name || "");
    setPhone(user?.phone || "");
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setFullUser(res.data.user);
      } catch {}
    };
    fetchUser();
  }, [isAuthenticated]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/auth/me", { name, phone });
      dispatch(updateUser(res.data.user));
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) return toast.error("Passwords don't match");
    if (pwData.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      toast.success("Password changed successfully!");
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    try {
      const res = await api.delete(`/auth/addresses/${addrId}`);
      setFullUser((prev: any) => ({ ...prev, addresses: res.data.addresses }));
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    dispatch(logout());
    router.push("/");
    toast.success("Logged out");
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "orders", label: "Orders", icon: Package },
    { key: "wishlist", label: "Wishlist", icon: Heart },
    { key: "addresses", label: "Addresses", icon: MapPin },
    { key: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="section py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="card p-5">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-3xl font-bold font-display">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="mt-3 font-display font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <span className={`badge mt-2 ${user?.role === "admin" ? "badge-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"} capitalize`}>
                {user?.role}
              </span>
            </div>

            <nav className="space-y-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === key
                      ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
              {user?.role === "admin" && (
                <Link href="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                  ⚙️ Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 mt-4">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl mb-5">Personal Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Full Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Email (read-only)</label>
                    <input value={user?.email || ""} disabled className="input opacity-60" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Role</label>
                    <input value={user?.role || ""} disabled className="input opacity-60 capitalize" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl mb-5">My Orders</h2>
              <Link href="/orders" className="btn-primary">View All Orders</Link>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl mb-5">Wishlist</h2>
              {fullUser?.wishlist?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {fullUser.wishlist.map((product: any) => (
                    <Link key={product._id} href={`/products/${product._id}`} className="card-hover p-3 flex flex-col items-center text-center">
                      <img
                        src={product.images?.[0]?.startsWith("http") ? product.images[0] : `http://localhost:5000${product.images?.[0]}`}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded-xl mb-2"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product._id}/200/200`; }}
                      />
                      <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-sm">₹{product.price?.toLocaleString("en-IN")}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-500">No items in wishlist</p>
                  <Link href="/products" className="btn-primary mt-4">Browse Products</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="card p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-display font-bold text-xl">My Addresses</h2>
              </div>
              {fullUser?.addresses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fullUser.addresses.map((addr: any) => (
                    <div key={addr._id} className={`p-4 rounded-xl border-2 transition-all ${addr.isDefault ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20" : "border-slate-200 dark:border-slate-700"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold uppercase text-slate-500">{addr.label}</span>
                          {addr.isDefault && <span className="badge-primary ml-2 text-xs">Default</span>}
                        </div>
                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">{addr.fullName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{addr.street}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p className="text-sm text-slate-500">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-500 mb-4">No saved addresses</p>
                  <p className="text-sm text-slate-400">Addresses are saved automatically when you checkout</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl mb-5">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Current Password</label>
                  <input type="password" value={pwData.currentPassword} onChange={(e) => setPwData(d => ({ ...d, currentPassword: e.target.value }))} className="input" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">New Password</label>
                  <input type="password" value={pwData.newPassword} onChange={(e) => setPwData(d => ({ ...d, newPassword: e.target.value }))} className="input" placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Confirm New Password</label>
                  <input type="password" value={pwData.confirmPassword} onChange={(e) => setPwData(d => ({ ...d, confirmPassword: e.target.value }))} className="input" placeholder="Repeat new password" />
                </div>
                <button type="submit" disabled={pwLoading} className="btn-primary">
                  {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
