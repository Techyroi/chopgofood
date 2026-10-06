import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RestaurantLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="restaurant-layout">
      <aside className="restaurant-sidebar">
        <div className="restaurant-sidebar-brand">
          <h2>ChopGoFood</h2>
          <span>Restaurant Portal</span>
        </div>

        <nav className="restaurant-sidebar-nav">
          <NavLink
            to="/restaurant-dashboard"
            end
            className={({ isActive }) =>
              `restaurant-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/restaurant-dashboard/orders"
            className={({ isActive }) =>
              `restaurant-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/restaurant-dashboard/menu"
            className={({ isActive }) =>
              `restaurant-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>Menu</span>
          </NavLink>

          <NavLink
            to="/restaurant-dashboard/profile"
            className={({ isActive }) =>
              `restaurant-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>Profile</span>
          </NavLink>
        </nav>

        <button
          type="button"
          className="restaurant-sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="restaurant-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default RestaurantLayout;