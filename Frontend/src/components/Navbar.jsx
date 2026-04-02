import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import cognizantLogo from "../assets/cognizant.png";

function CompanyLogo({ size = 42 }) {
  return (
    <img
      src={cognizantLogo}
      alt="Cognizant"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  );
}

const ALL_NAV = [
  { label: "UAR Form",     path: "/uar-form",     roles: ["Admin", "User"] },
  { label: "Users",        path: "/users",        roles: ["Admin"] },
  { label: "Edit Form",    path: "/edit-form",    roles: ["Admin"] },
  { label: "Form Records", path: "/form-records", roles: ["Admin", "User"] },
  { label: "Edit Records", path: "/edit-records", roles: ["Admin"] },
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
          <CompanyLogo size={40} />
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

        {/* Logout */}
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