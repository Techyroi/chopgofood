import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RiderLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="rider-layout">
      <aside className="rider-sidebar">
        <div className="rider-sidebar-brand">
          <h2>ChopGoFood</h2>
          <span>Rider Portal</span>
        </div>

        <nav className="rider-sidebar-nav">
          <NavLink
            to="/rider-dashboard"
            end
            className={({ isActive }) =>
              `rider-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/rider-dashboard/deliveries"
            className={({ isActive }) =>
              `rider-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>Deliveries</span>
          </NavLink>

          <NavLink
            to="/rider-dashboard/profile"
            className={({ isActive }) =>
              `rider-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>Profile</span>
          </NavLink>
        </nav>

        <button
          type="button"
          className="rider-sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="rider-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default RiderLayout;