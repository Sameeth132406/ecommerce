"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Search, X, Users, Shield, ShoppingCart, Trash2,
  AlertTriangle, ChevronDown, UserCog, Loader2,
} from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      params.set("page", page.toString());
      params.set("limit", "15");
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.users);
      setPagination({ total: res.data.pagination.total, pages: res.data.pagination.pages });
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const updateRole = async (userId: string, role: string) => {
    setUpdatingId(userId);
    try {
      await api.put(`/users/${userId}`, { role });
      toast.success(`User role updated to ${role}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      setDeleteId(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{pagination.total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 py-2.5 text-sm"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {["", "customer", "admin"].map(r => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                roleFilter === r
                  ? "bg-primary-600 text-white shadow-md"
                  : "btn-secondary text-xs py-2 px-3"
              }`}
            >
              {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
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
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">User</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Joined</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Change Role</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-12 skeleton rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${user.role === "admin" ? "badge-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"} capitalize`}>
                      {user.role === "admin" ? <Shield className="w-3 h-3 inline mr-1" /> : <ShoppingCart className="w-3 h-3 inline mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {updatingId === user._id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary-500" />
                    ) : (
                      <div className="relative inline-block">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user._id, e.target.value)}
                          className="text-xs py-1.5 px-2 pr-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteId(user._id)}
                      className="btn-icon w-8 h-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-center text-slate-900 dark:text-white mb-2">Delete User?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">This will permanently delete the user and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => deleteUser(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
