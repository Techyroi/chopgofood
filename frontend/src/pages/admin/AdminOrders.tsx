import { useEffect, useState } from "react";
import { RefreshCw, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./AdminOrders.css";

interface AdminOrder {
  _id: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: string;
  createdAt: string;

  user?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };

  restaurant?: {
    _id: string;
    name: string;
    address?: string;
  };

  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

interface AdminOrdersResponse {
  success: boolean;
  count: number;
  data: AdminOrder[];
}

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<AdminOrdersResponse>(
        "/admin/orders"
      );

      setOrders(response.data.data);
    } catch (error) {
      console.error("Failed to load admin orders:", error);
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
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
      <div className="admin-orders-page">
        <div className="admin-orders-loading">
          Loading orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-error">
          <p>{error}</p>

          <button type="button" onClick={loadOrders}>
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <header className="admin-orders-header">
        <div>
          <span className="admin-orders-eyebrow">
            ChopGoFood Admin
          </span>

          <h1>Orders</h1>

          <p>
            View and manage all customer orders.
          </p>
        </div>

        <button
          type="button"
          className="admin-orders-refresh"
          onClick={loadOrders}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="admin-orders-card">
        <div className="admin-orders-card-header">
          <div>
            <h2>All Orders</h2>
            <p>
              {orders.length}{" "}
              {orders.length === 1 ? "order" : "orders"} found
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="admin-orders-empty">
            No orders found.
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>
                        #{order._id.slice(-6).toUpperCase()}
                      </strong>
                    </td>

                    <td>
                      <div className="admin-orders-customer">
                        <strong>
                          {order.user?.fullName ||
                            "Unknown customer"}
                        </strong>

                        <span>
                          {order.user?.email || "No email"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {order.restaurant?.name ||
                        "Unknown restaurant"}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(order.total)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`admin-orders-status admin-orders-payment-${order.paymentStatus}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-orders-status admin-orders-order-${order.orderStatus}`}
                      >
                        {order.orderStatus.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td>
                      <button
  type="button"
  className="admin-orders-view-button"
  title="View order"
  onClick={() =>
    navigate(`/admin/orders/${order._id}`)
  }
>
  <Eye size={17} />
</button>
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

export default AdminOrders;