import { useState, useMemo } from "react";
import USERS from "../assets/users.json";

const ROLE_BADGE = {
  Admin: "bg-purple-100 text-purple-700 border border-purple-300",
  User:  "bg-green-100 text-green-700 border border-green-300",
};

export default function UsersPage() {
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return USERS.filter(u => {
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesSearch =
        !q ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)  ||
        u.userId.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [search, roleFilter]);

  const thCls = "px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bayer-blue">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{USERS.length} total users</p>
        </div>
        <button className="bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#004aad] transition-colors">
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or User ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-bayer-blue"
        />
        
        {(search || roleFilter !== "All") && (
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
              <th className={thCls}>Role</th>
              <th className={thCls}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  No users match your search.
                </td>
              </tr>
            ) : (
              filtered.map((u, idx) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.firstName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{u.lastName}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      {u.userId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-400 border border-blue-400 px-2.5 py-1 rounded hover:bg-blue-400 hover:text-white transition-colors">
                        Edit
                      </button>
                      <button className="text-xs text-red-500 border border-red-300 px-2.5 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <p className="text-xs text-gray-400 mt-3">
        Showing {filtered.length} of {USERS.length} users ·{" "}
        {USERS.filter(u => u.role === "Admin").length} Admins ·{" "}
        {USERS.filter(u => u.role === "User").length} Users
      </p>
    </div>
  );
}