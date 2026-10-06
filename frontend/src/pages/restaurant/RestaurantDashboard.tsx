import { useEffect, useState } from "react";
import api from "../../services/api";

interface Restaurant {
  _id: string;
  name: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  phone?: string;
}

interface Order {
  _id: string;
  subtotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  restaurant?: Restaurant;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/restaurant-dashboard/orders");

        const data = response.data.data || [];

        setOrders(data);

        if (data.length > 0 && data[0].restaurant) {
          setRestaurant(data[0].restaurant);
        }
      } catch (error) {
        console.error("Failed to load restaurant dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus === "pending" ||
      order.orderStatus === "confirmed"
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.orderStatus === "preparing"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.orderStatus === "delivered"
  ).length;

  if (loading) {
    return (
      <div className="restaurant-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="restaurant-dashboard">
      <header className="restaurant-dashboard-header">
        <div>
          <p className="restaurant-dashboard-eyebrow">
            Restaurant Dashboard
          </p>

          <h1>
            {restaurant?.name || "Your Restaurant"}
          </h1>

          <p>
            Manage your restaurant orders and operations.
          </p>
        </div>
      </header>

      <section className="restaurant-dashboard-stats">
        <div className="restaurant-dashboard-stat-card">
          <span>Total Orders</span>
          <strong>{totalOrders}</strong>
        </div>

        <div className="restaurant-dashboard-stat-card">
          <span>Pending Orders</span>
          <strong>{pendingOrders}</strong>
        </div>

        <div className="restaurant-dashboard-stat-card">
          <span>Preparing</span>
          <strong>{preparingOrders}</strong>
        </div>

        <div className="restaurant-dashboard-stat-card">
          <span>Completed</span>
          <strong>{completedOrders}</strong>
        </div>
      </section>

      <section className="restaurant-dashboard-orders">
        <div className="restaurant-dashboard-section-header">
          <div>
            <h2>Recent Orders</h2>
            <p>Your latest restaurant orders.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="restaurant-dashboard-empty">
            <h3>No orders yet</h3>
            <p>
              New orders will appear here when customers place
              orders from your restaurant.
            </p>
          </div>
        ) : (
          <div className="restaurant-dashboard-order-list">
            {orders.slice(0, 8).map((order) => (
              <div
                key={order._id}
                className="restaurant-dashboard-order-card"
              >
                <div>
                  <strong>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </strong>

                  <p>
                    {order.user?.fullName || "Customer"}
                  </p>
                </div>

                <div>
                  <strong>
                    ₦{Number(order.subtotal || 0).toLocaleString()}
                  </strong>

                        <span>
        {order.orderStatus.replaceAll("_", " ")}
      </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RestaurantDashboard;