import { useEffect, useState } from "react";
import {
  ClipboardList,
  DollarSign,
  Users,
  Store,
  Clock3,
  RefreshCw,
} from "lucide-react";

import { getAdminDashboard } from "../../services/adminService";
import type { AdminDashboardData } from "../../services/adminService";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-error">
          <p>{error || "Unable to load dashboard."}</p>

          <button type="button" onClick={loadDashboard}>
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <span className="admin-dashboard-eyebrow">
            ChopGoFood Admin
          </span>

          <h1>Dashboard</h1>

          <p>
            Overview of your food delivery operations.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadDashboard}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{dashboard.totalOrders}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <DollarSign size={21} />
          </div>

          <div>
            <span>Revenue</span>
            <strong>{formatCurrency(dashboard.totalRevenue)}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Customers</span>
            <strong>{dashboard.totalCustomers}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Store size={21} />
          </div>

          <div>
            <span>Restaurants</span>
            <strong>{dashboard.totalRestaurants}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Pending Orders</span>
            <strong>{dashboard.pendingOrders}</strong>
          </div>
        </div>
      </section>

      <section className="admin-recent-section">
        <div className="admin-section-header">
          <div>
            <h2>Recent Orders</h2>
            <p>Latest orders across ChopGoFood.</p>
          </div>
        </div>

        {dashboard.recentOrders.length === 0 ? (
          <div className="admin-empty-state">
            No orders found.
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="admin-customer-cell">
                        <strong>
                          {order.user?.fullName || "Unknown customer"}
                        </strong>

                        <span>
                          {order.user?.email || "No email"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {order.restaurant?.name || "Unknown restaurant"}
                    </td>

                    <td>
                      <strong>{formatCurrency(order.total)}</strong>
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status-${order.paymentStatus}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status-${order.orderStatus}`}
                      >
                        {order.orderStatus.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;