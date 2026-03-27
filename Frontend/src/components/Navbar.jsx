import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Bayer logo as inline SVG
function BayerLogo({ size = 42 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="97" fill="white" />
      <circle cx="100" cy="100" r="97" fill="none" stroke="#7BC144" strokeWidth="18" />
      <circle cx="100" cy="100" r="79" fill="none" stroke="#00BCFF" strokeWidth="10" />
      <circle cx="100" cy="100" r="74" fill="#003087" />
      <rect x="88" y="20" width="24" height="160" fill="white" />
      <rect x="20" y="88" width="160" height="24" fill="white" />
      {/* Vertical BAYER */}
      {["B","A","Y","E","R"].map((l, i) => (
        <text key={`v${i}`} x="100" y={58 + i * 22} textAnchor="middle"
          fill="#003087" fontSize="19" fontWeight="bold" fontFamily="Arial, sans-serif">{l}</text>
      ))}
      {/* Horizontal BAYER */}
      {[["B",38],["A",59],["Y",100],["E",141],["R",162]].map(([l, x]) => (
        <text key={`h${l}`} x={x} y="106" textAnchor="middle"
          fill="#003087" fontSize="19" fontWeight="bold" fontFamily="Arial, sans-serif">{l}</text>
      ))}
    </svg>
  );
}

const ALL_NAV = [
  { label: "UAR Form",       path: "/uar-form",       roles: ["Admin", "User"] },
  { label: "Users",          path: "/users",          roles: ["Admin"] },
  { label: "Edit Form",      path: "/edit-form",      roles: ["Admin"] },
  { label: "Form Records",   path: "/form-records",   roles: ["Admin", "User"] },
  { label: "Edit Records",   path: "/edit-records",   roles: ["Admin"] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleNav = ALL_NAV.filter((n) => n.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive
        ? "bg-white text-blue-400 font-semibold shadow-sm"
        : "text-white hover:bg-white/20"
    }`;

  return (
    <nav className="bg-blue-400 shadow-md sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <BayerLogo size={40} />
          <div className="leading-tight">
            <p className="text-white font-bold text-sm tracking-wide">Global LIMS</p>
            <p className="text-bayer-cyan text-xs">User Access Request</p>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {visibleNav.map((n) => (
            <NavLink key={n.path} to={n.path} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded-md text-sm bg-white text-blue-700 font-semibold border border-white/30 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}