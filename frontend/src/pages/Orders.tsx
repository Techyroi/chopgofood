import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

interface Restaurant {
  _id: string;
  name: string;
  logo: string;
  coverImage: string;
  address: string;
}

interface OrderItem {
  menuItem: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  restaurant: Restaurant;
  items: OrderItem[];
  deliveryAddress: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    useEffect(() => {
      const loadOrders = async () => {
        try {
          const response = await api.get("/orders");

          setOrders(response.data.data || []);
        } catch (error) {
          console.error("Failed to load orders:", error);
          setError("Unable to load your orders.");
        } finally {
          setLoading(false);
        }
      };

      loadOrders();
    }, []);

  const getStatusLabel = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status: string) => {
    if (status === "delivered") {
      return "order-status delivered";
    }

    if (status === "cancelled") {
      return "order-status cancelled";
    }

    return "order-status active";
  };

  const activeOrders = orders.filter(
    (order) =>
      order.orderStatus !== "delivered" &&
      order.orderStatus !== "cancelled"
  );

  const activeOrder = activeOrders[0];

  return (
    <main className="orders-page">
      <header className="page-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>My Orders</h1>

        <div />
      </header>

      <section className="orders-content">
        {loading && (
          <div className="orders-empty">
            <Clock3 size={36} />
            <h2>Loading your orders...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="orders-empty">
            <PackageCheck size={36} />
            <h2>{error}</h2>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <PackageCheck size={36} />
            </div>

            <h2>No orders yet</h2>

            <p>
              Your completed and active orders will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/home")}
            >
              Start Ordering
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            {activeOrder && (
              <section className="active-order-section">
                <div className="active-order-heading">
                  <div>
                    <span>ACTIVE ORDER</span>
                    <h2>Track your order</h2>
                  </div>

                  <Truck size={24} />
                </div>

                <button
                  type="button"
                  className="active-order-card"
                  onClick={() =>
                    navigate(`/orders/${activeOrder._id}`)
                  }
                >
                  <div className="active-order-top">
                    <div className="active-order-restaurant">
                      {activeOrder.restaurant?.logo ? (
                        <img
                          src={activeOrder.restaurant.logo}
                          alt={activeOrder.restaurant.name}
                        />
                      ) : (
                        <div className="order-restaurant-placeholder">
                          <PackageCheck size={22} />
                        </div>
                      )}

                      <div>
                        <h3>
                          {activeOrder.restaurant?.name}
                        </h3>

                        <p>
                          {activeOrder.items.length}{" "}
                          {activeOrder.items.length === 1
                            ? "item"
                            : "items"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={getStatusClass(
                        activeOrder.orderStatus
                      )}
                    >
                      {getStatusLabel(
                        activeOrder.orderStatus
                      )}
                    </span>
                  </div>

                  <div className="active-order-message">
                    <Clock3 size={18} />

                    <span>
                      {activeOrder.orderStatus === "pending" &&
                        "We're waiting for the restaurant to confirm your order."}

                      {activeOrder.orderStatus === "confirmed" &&
                        "The restaurant has confirmed your order."}

                      {activeOrder.orderStatus === "preparing" &&
                        "Your food is being prepared now."}

                      {activeOrder.orderStatus === "ready" &&
                        "Your order is ready for delivery."}

                      {activeOrder.orderStatus ===
                        "out_for_delivery" &&
                        "Your rider is on the way."}
                    </span>
                  </div>

                  <div className="active-order-bottom">
                    <strong>
                      ₦{activeOrder.total.toLocaleString()}
                    </strong>

                    <span>View tracking →</span>
                  </div>
                </button>
              </section>
            )}

            <section className="order-history-section">
              <div className="order-history-heading">
                <h2>Order History</h2>
              </div>

              <div className="orders-list">
                {orders.map((order) => (
                  <button
                    key={order._id}
                    type="button"
                    className="order-card"
                    onClick={() =>
                      navigate(`/orders/${order._id}`)
                    }
                  >
                    <div className="order-card-top">
                      <div className="order-restaurant">
                        {order.restaurant?.logo ? (
                          <img
                            src={order.restaurant.logo}
                            alt={order.restaurant.name}
                          />
                        ) : (
                          <div className="order-restaurant-placeholder">
                            <PackageCheck size={22} />
                          </div>
                        )}

                        <div>
                          <h2>
                            {order.restaurant?.name}
                          </h2>

                          <p>
                            {order.items.length}{" "}
                            {order.items.length === 1
                              ? "item"
                              : "items"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={getStatusClass(
                          order.orderStatus
                        )}
                      >
                        {getStatusLabel(
                          order.orderStatus
                        )}
                      </span>
                    </div>

                    <div className="order-card-divider" />

                    <div className="order-card-bottom">
                      <div>
                        <span className="order-card-label">
                          Total
                        </span>

                        <strong>
                          ₦{order.total.toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span className="order-card-label">
                          Ordered
                        </span>

                        <strong>
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </section>

      <BottomNavigation activeItem="Orders" />
    </main>
  );
}

export default Orders;