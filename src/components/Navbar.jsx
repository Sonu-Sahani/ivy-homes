import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ivy_token");
    localStorage.removeItem("ivy_user");

    sessionStorage.removeItem("ivy_token");
    sessionStorage.removeItem("ivy_user");

    toast.success("Logged out successfully");

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 100);
  };

  const navItems = [
    { name: "Listings", path: "/listings" },
    { name: "Rentals", path: "/rentals" },
    { name: "Projects", path: "/projects" },
    { name: "Saved", path: "/saved" },
    { name: "Insights", path: "/insights" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#DDD9D0] bg-[#F5F3EE]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/listings")}
            className="shrink-0 text-left"
          >
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#252525]">
              Ivy Homes
            </h1>

            <p className="hidden sm:block text-[11px] text-[#77736B] mt-0.5">
              Find your next home
            </p>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-[#252525] text-white"
                      : "text-[#5F5B54] hover:bg-[#E8E5DE]"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 px-3 sm:px-4 py-2 rounded-lg border border-[#CFCBC2] text-sm font-medium text-[#4B4944] hover:bg-[#252525] hover:text-white hover:border-[#252525] transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto mt-4 pb-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `shrink-0 px-3 py-2 rounded-lg text-xs transition ${
                  isActive
                    ? "bg-[#252525] text-white"
                    : "text-[#5F5B54] bg-[#E8E5DE] hover:bg-[#DDD9D0]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}