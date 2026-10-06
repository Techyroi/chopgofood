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

interface OrderItem {
  _id?: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  subtotal: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  restaurant?: Restaurant;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
}

const RestaurantOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null
  );

  const loadOrders = async () => {
    try {
      const response = await api.get("/restaurant-dashboard/orders");

      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to load restaurant orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    status: string
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await api.put(
        `/restaurant-dashboard/orders/${orderId}/status`,
        {
          status,
        }
      );

      const updatedOrder = response.data.data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-orders-loading">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="restaurant-orders">
      <div className="restaurant-orders-header">
        <div>
          <p className="restaurant-orders-eyebrow">
            Restaurant Orders
          </p>

          <h1>Orders</h1>

          <p>
            View and manage orders placed at your restaurant.
          </p>
        </div>

        <div className="restaurant-orders-count">
          {orders.length} orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="restaurant-orders-empty">
          <h2>No orders yet</h2>

          <p>
            Orders placed at your restaurant will appear here.
          </p>
        </div>
      ) : (
        <div className="restaurant-orders-list">
          {orders.map((order) => (
            <div
              key={order._id}
              className="restaurant-order-card"
            >
              <div className="restaurant-order-card-header">
                <div>
                  <span className="restaurant-order-number">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>

                  <h2>
                    {order.user?.fullName || "Customer"}
                  </h2>

                  <p>
                    {order.user?.phone ||
                      order.user?.email ||
                      "No customer contact"}
                  </p>
                </div>

                <div className="restaurant-order-total">
                  ₦{Number(order.subtotal || 0).toLocaleString()}
                </div>
              </div>

              <div className="restaurant-order-details">
                <div>
                  <span>Payment</span>

                  <strong>
                    {order.paymentStatus || "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Method</span>

                  <strong>
                    {order.paymentMethod || "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Date</span>

                  <strong>
                    {new Date(order.createdAt).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="restaurant-order-items">
                <span>Items</span>

                {order.items?.map((item, index) => (
                  <div
                    key={item._id || `${order._id}-${index}`}
                    className="restaurant-order-item"
                  >
                    <span>
                      {item.quantity} × {item.name}
                    </span>

                    <strong>
                      ₦
                      {Number(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="restaurant-order-footer">
                <div>
                  <span className="restaurant-order-status-label">
                    Order Status
                  </span>

                  <span
                    className={`restaurant-order-status status-${order.orderStatus}`}
                  >
                    {order.orderStatus.replaceAll("_", " ")}
                  </span>
                </div>

                <select
                  value={order.orderStatus}
                  disabled={updatingOrderId === order._id}
                  onChange={(event) =>
                    handleStatusChange(
                      order._id,
                      event.target.value
                    )
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="out_for_delivery">
                    Out for delivery
                  </option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;