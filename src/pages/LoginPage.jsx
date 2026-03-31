import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function BayerLogo({ size = 80 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="97" fill="white" />
      <circle cx="100" cy="100" r="97" fill="none" stroke="#7BC144" strokeWidth="18" />
      <circle cx="100" cy="100" r="79" fill="none" stroke="#00BCFF" strokeWidth="10" />
      <circle cx="100" cy="100" r="74" fill="#003087" />
      <rect x="88" y="20" width="24" height="160" fill="white" />
      <rect x="20" y="88" width="160" height="24" fill="white" />
      {["B","A","Y","E","R"].map((l, i) => (
        <text key={`v${i}`} x="100" y={58 + i * 22} textAnchor="middle"
          fill="#003087" fontSize="19" fontWeight="bold" fontFamily="Arial, sans-serif">{l}</text>
      ))}
      {[["B",38],["A",59],["Y",100],["E",141],["R",162]].map(([l, x]) => (
        <text key={`h${l}`} x={x} y="106" textAnchor="middle"
          fill="#003087" fontSize="19" fontWeight="bold" fontFamily="Arial, sans-serif">{l}</text>
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [userId, setUserId]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!userId.trim() || !password.trim()) {
      setError("Please enter both User ID and Password.");
      return;
    }
    setLoading(true);
    // Simulate a small async delay (replace with real API call later)
    await new Promise((r) => setTimeout(r, 400));
    const result = login(userId.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate("/uar-form");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bayer-blue via-[#004aad] to-[#00244d] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="bg-bayer-blue px-8 pt-10 pb-8 flex flex-col items-center gap-3">
            <BayerLogo size={80} />
            <div className="text-center mt-2">
              <h1 className="text-white text-xl font-bold tracking-wide">Global LIMS</h1>
              <p className="text-bayer-cyan text-sm mt-1">User Access Request Portal</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <h2 className="text-gray-700 text-lg font-semibold text-center mb-1">Sign In</h2>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
                autoComplete="username"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bayer-blue focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bayer-blue focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#004aad] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} Bayer AG · Global LIMS Platform
        </p> */}
      </div>
    </div>
  );
}