"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShieldCheck, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      
      if (res.data.user.role !== "admin") {
        toast.error("Access denied. Admin privileges required.");
        return;
      }
      
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Demo login function
  const demoLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: "sameethsamit@gmail.com", password: "sam12345" });
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success("Logged in as Admin!");
      router.push("/admin");
    } catch (err: any) {
      toast.error("Demo login failed. Run the seeder first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Store</span>
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl mb-4 shadow-lg shadow-black/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 mt-2 text-sm">Secure access for authorized personnel only</p>
        </div>

        <div className="card p-8 animate-scale-in border-slate-700/50 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
          {/* Demo Login Button */}
          <button onClick={demoLogin} disabled={loading} className="w-full btn-secondary text-sm py-2.5 mb-6 border-slate-700 hover:bg-slate-700 hover:border-slate-600">
            ⚙️ Demo Admin Login
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-800 text-slate-400 text-xs font-medium uppercase tracking-wider">Secure Sign In</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="sameethsamit@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 text-sm font-medium mt-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Authenticating..." : "Authorize"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
