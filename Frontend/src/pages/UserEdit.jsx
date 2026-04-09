import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function UserEdit({ user, onClose, onSaved }) {
  const [role,       setRole]       = useState("User");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [enableUser, setEnableUser] = useState("Enable");

  useEffect(() => {
    if (!user) return;
    setRole(user.role === "Admin" ? "Admin" : "User");
    setError("");
    if (typeof user.is_enabled !== "undefined") {
      setEnableUser(user.is_enabled ? "Enable" : "Disable");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = { enableUser, role };
    try {
      const res  = await fetch(`${API}/api/users/${user.user_id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to save user");
        return;
      }
      const r2 = await fetch(`${API}/api/users/${user.user_id}`);
      const j2 = await r2.json();
      if (r2.ok && j2.success) {
        onSaved(j2.data);
      } else {
        onSaved({ ...user, ...payload });
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <p className="text-sm text-gray-500">
            User ID: <span className="font-mono">{user.user_id}</span>
          </p>
        </div>
        <div className="px-6 py-4 space-y-3">
          {error && <div className="text-sm text-red-500">{error}</div>}

          <div>
            <label className="text-xs text-gray-600">Status</label>
            <select
              value={enableUser}
              onChange={(e) => setEnableUser(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2 text-sm"
            >
              <option value="Enable">Enable</option>
              <option value="Disable">Disable</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2 text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-500 text-white text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}