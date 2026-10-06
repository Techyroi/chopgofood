import {
  ArrowLeft,
  Bell,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  LogOut,
  MapPin,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";
import { useAuth } from "../context/AuthContext";

function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };



  return (
    <div className="account-page">
      <main className="account-content">
  <header className="account-header">
  <button
    type="button"
    className="account-back-button"
    onClick={() => navigate(-1)}
    aria-label="Go back"
  >
    <ArrowLeft size={22} />
  </button>

  <div>
    <h1>Account</h1>
    <p>Manage your ChopGo account</p>
  </div>
</header>

        <section className="account-profile-card">
          <div className="account-profile-icon">
            <User size={28} />
          </div>

          <div className="account-profile-info">
            <h2>{user?.fullName || "ChopGo Customer"}</h2>

            <p>
              {user?.phone || "Phone number not available"}
            </p>
     

          <p>
            {user?.email || "Email not available"}
          </p>
          </div>
        </section>

        <section className="account-menu">
          <button
            type="button"
            className="account-menu-item"
            onClick={() => navigate("/orders")}
          >
            <span className="account-menu-left">
              <span className="account-menu-icon">
                <ClipboardList size={20} />
              </span>

              <span>
                <strong>My Orders</strong>
                <small>View your order history</small>
              </span>
            </span>

            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            className="account-menu-item"
            onClick={() => {
              if (user?.address) {
                window.alert(`Saved delivery address:\n\n${user.address}`);
              } else {
                window.alert(
                  "No delivery address has been saved yet."
                );
              }
            }}
          >
            <span className="account-menu-left">
              <span className="account-menu-icon">
                <MapPin size={20} />
              </span>

              <span>
                <strong>Delivery Address</strong>
                <small>
                  {user?.address
                    ? user.address
                    : "No address saved"}
                </small>
              </span>
            </span>

            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            className="account-menu-item"
            onClick={() => navigate("/support")}
          >
            <span className="account-menu-left">
              <span className="account-menu-icon">
                <HelpCircle size={20} />
              </span>

              <span>
                <strong>Help & Support</strong>
                <small>Get help with your orders</small>
              </span>
            </span>

            <ChevronRight size={20} />
          </button>

                <button
        type="button"
        className="account-menu-item"
        onClick={() => navigate("/notifications")}
      >
        <span className="account-menu-left">
          <span className="account-menu-icon">
            <Bell size={20} />
          </span>

          <span>
            <strong>Notifications</strong>
            <small>View your latest updates</small>
          </span>
        </span>

        <ChevronRight size={20} />
      </button>
        </section>

        <button
          type="button"
          className="account-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Log Out</span>
        </button>
      </main>

      <BottomNavigation activeItem="Account" />
    </div>
  );
}

export default Account;