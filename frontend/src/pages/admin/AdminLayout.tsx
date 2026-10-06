import {
  LayoutDashboard,
  ClipboardList,
  Store,
  UtensilsCrossed,
  Users,
  Bike,
  CreditCard,
  Headset,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  navigate("/signin");
};

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-mark">CG</div>

          <div>
            <strong>ChopGoFood</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <ClipboardList size={19} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/restaurants"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Store size={19} />
            <span>Restaurants</span>
          </NavLink>

          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <UtensilsCrossed size={19} />
            <span>Menu</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Users size={19} />
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/admin/riders"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Bike size={19} />
            <span>Riders</span>
          </NavLink>

          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <CreditCard size={19} />
            <span>Payments</span>
          </NavLink>

          <NavLink
            to="/admin/support"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Headset size={19} />
            <span>Support</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;