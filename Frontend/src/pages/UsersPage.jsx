import { useState, useEffect, useMemo } from "react";
import UserEdit from "./UserEdit";
 
const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
 
const ROLE_BADGE = {
  Admin: "bg-purple-100 text-purple-700 border border-purple-300",
  admin : "bg-purple-100 text-purple-700 border border-purple-300",
  user: "bg-green-100 text-green-700 border border-green-300",
  User:  "bg-green-100 text-green-700 border border-green-300",
};
 
export default function UsersPage() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
 
  // ── Fetch users from API ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res  = await fetch(`${API}/api/users`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error ?? "Failed to load users.");
        } else {
          setUsers(json.data);
        }
      } catch {
        setError("Could not reach the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
 
  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      const matchesRole   = roleFilter === "All" || u.role.toLowerCase() === roleFilter;
      const matchesSearch = !q ||
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q)  ||
        u.user_id.toLowerCase().includes(q)    ||
        u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [search, roleFilter, users]);
 
  const thCls = "px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide";
 
  // ── Render states ─────────────────────────────────────────────────────────
  const renderBody = () => {
    if (loading) return (
      <tr>
        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
          Loading users…
        </td>
      </tr>
    );
    if (error) return (
      <tr>
        <td colSpan={7} className="text-center py-12 text-red-400 text-sm">
          ⚠ {error}
        </td>
      </tr>
    );
    if (filtered.length === 0) return (
      <tr>
        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
          No users match your search.
        </td>
      </tr>
    );
    return filtered.map((u, idx) => (
      <tr key={u.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.first_name}</td>
        <td className="px-4 py-3 text-sm text-gray-700">{u.last_name}</td>
        <td className="px-4 py-3">
          <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
            {u.user_id}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
        <td className="px-4 py-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role]}`}>
            {u.role.toLowerCase() === "admin" ? "Admin" : "User"}
          </span>
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => { setSelectedUser(u); setModalOpen(true); }}
            className="text-xs text-blue-400 border border-blue-400 px-2.5 py-1 rounded hover:bg-blue-400 hover:text-white transition-colors"
          >
            Edit
          </button>
        </td>
      </tr>
    ));
  };
 
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bayer-blue">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${users.length} total users`}
          </p>
        </div>
        <button className="bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#004aad] transition-colors">
          + Add User
        </button>
      </div>
 
      {modalOpen && selectedUser && (
        <UserEdit
          user={selectedUser}
          onClose={() => setModalOpen(false)}
          onSaved={(updatedUser) => {
            setUsers(prev => prev.map(u => u.user_id === updatedUser.user_id ? updatedUser : u));
            setModalOpen(false);
          }}
        />
      )}
 
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, User ID or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-bayer-blue"
        />
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          {["All", "Admin", "User"].map(r => (
            <button
              key={r}
              onClick={() => r!=="All"? setRoleFilter(r.toLowerCase()) : setRoleFilter(r)}
              className={`px-4 py-2 transition-colors ${
                roleFilter === r.toLowerCase() || roleFilter === r
                  ? "bg-blue-400 text-white font-semibold"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {(search || roleFilter !== "All") && !loading && (
          <span className="self-center text-sm text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
 
      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={`${thCls} w-10`}>#</th>
              <th className={thCls}>First Name</th>
              <th className={thCls}>Last Name</th>
              <th className={thCls}>User ID</th>
              <th className={thCls}>Email</th>
              <th className={thCls}>Role</th>
              <th className={thCls}>Actions</th>
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
 
      {/* Summary footer */}
      {!loading && !error && (
        <p className="text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {users.length} users ·{" "}
          {users.filter(u => u.role.toLowerCase() === "admin").length} Admins ·{" "}
          {users.filter(u => u.role.toLowerCase() === "user").length} Users
        </p>
      )}
    </div>
  );
} 