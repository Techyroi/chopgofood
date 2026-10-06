import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import BottomNavigation from "../components/restaurant/layout/BottomNavigation";
import { useOrders } from "../context/OrdersContext";

import api from "../services/api";

interface OrderItem {
  menuItem: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Restaurant {
  _id: string;
  name: string;
  logo: string;
  coverImage: string;
  address: string;
}

interface Order {
  _id: string;
  restaurant: Restaurant;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryDistanceKm: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  paystackReference: string;
  createdAt: string;
  updatedAt: string;
}

function OrderTracking() {
  const navigate = useNavigate();
  const { refreshOrders } = useOrders();
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

useEffect(() => {
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const fetchOrder = async (showLoading = false) => {
    if (!id) {
      setError("Order ID was not found.");
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await api.get(`/orders/${id}`);

      setOrder(response.data.data);
      await refreshOrders();
      setError("");
    } catch (error: any) {
      console.error("Get order error:", error);

      if (showLoading) {
        setError(
          error.response?.data?.message ||
            "We could not load your order."
        );
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  fetchOrder(true);

  intervalId = setInterval(() => {
    fetchOrder(false);
  }, 10000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [id]);

  const handleCancelOrder = async () => {
    if (!order) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);

      const response = await api.patch(
        `/orders/${order._id}/cancel`
      );
      await refreshOrders();

      setOrder(response.data.data);
    } catch (error: any) {
      console.error("Cancel order error:", error);

      alert(
        error.response?.data?.message ||
          "We could not cancel your order."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="order-tracking-loading">
          <Clock3 size={42} />

          <h2>Loading your order...</h2>

          <p>
            Please wait while we get your order details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-tracking-page">
        <div className="order-tracking-error">
          <h2>Order Not Found</h2>

          <p>
            {error || "We could not find this order."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/home")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

const statusSteps = [
  {
    key: "pending",
    title: "Order Placed",
    description: "We've received your order.",
    icon: Clock3,
  },
  {
    key: "confirmed",
    title: "Order Confirmed",
    description: "The restaurant has accepted your order.",
    icon: CheckCircle2,
  },
  {
    key: "preparing",
    title: "Preparing Your Food",
    description: "Your food is being prepared now.",
    icon: PackageCheck,
  },
  {
    key: "ready",
    title: "Ready for Delivery",
    description: "Your order is ready for the rider.",
    icon: PackageCheck,
  },
  {
    key: "out_for_delivery",
    title: "Rider Is on the Way",
    description: "Your food is heading to your address.",
    icon: Truck,
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "Enjoy your meal!",
    icon: CheckCircle2,
  },
];

  const statusOrder = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
  ];

  const currentStatusIndex =
    statusOrder.indexOf(order.orderStatus);

  const isCancelled =
    order.orderStatus === "cancelled";

  const paymentStatusLabel =
    order.paymentStatus === "paid"
      ? "Paid"
      : order.paymentStatus === "pending"
        ? "Pending"
        : "Failed";
const statusMessages: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  pending: {
    title: "We've received your order",
    description:
      "We're waiting for the restaurant to confirm your order.",
  },

  confirmed: {
    title: "Order confirmed",
    description:
      "The restaurant has accepted your order.",
  },

  preparing: {
    title: "Your food is being prepared",
    description:
      "The restaurant is preparing your order now.",
  },

  ready: {
    title: "Your order is ready",
    description:
      "Your order is ready and waiting for delivery.",
  },

  out_for_delivery: {
    title: "Your order is on the way",
    description:
      "Your rider is heading to your delivery address.",
  },

  delivered: {
    title: "Order delivered",
    description:
      "Your order has been delivered. Enjoy your meal!",
  },

  cancelled: {
    title: "Order cancelled",
    description:
      "This order has been cancelled.",
  },
};

const currentStatus =
  statusMessages[order.orderStatus] ||
  statusMessages.pending;
  return (
    <div className="order-tracking-page">
      <header className="order-tracking-header">
        <button
          type="button"
          className="order-tracking-back"
          onClick={() => navigate("/Home")}
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
        </button>

        <h1>Order Tracking</h1>

        <div className="order-tracking-header-space" />
      </header>

      <main className="order-tracking-content">
      <section
        className={
          isCancelled
            ? "order-tracking-confirmation cancelled"
            : "order-tracking-confirmation"
        }
      >
        <div className="order-tracking-status-icon">
          {isCancelled ? (
            <XCircle size={30} />
          ) : (
            <CheckCircle2 size={30} />
          )}
        </div>

        <div className="order-tracking-confirmation-content">
          <span className="order-tracking-status-label">
            {isCancelled ? "Order cancelled" : "Order status"}
          </span>

          <h2>{currentStatus.title}</h2>

          <p>{currentStatus.description}</p>

          <span className="order-tracking-order-number">
            Order #{order._id.slice(-6).toUpperCase()}
          </span>
        </div>
      </section>

        <section className="order-tracking-restaurant">
          <div className="order-tracking-restaurant-image">
            <img
              src={order.restaurant.logo}
              alt={order.restaurant.name}
            />
          </div>

          <div className="order-tracking-restaurant-info">
            <span>Ordering from</span>

            <strong>{order.restaurant.name}</strong>

            <p>{order.restaurant.address}</p>
          </div>
        </section>

        {!isCancelled && (
          <section className="order-tracking-status">
            <h3>Order Status</h3>

      <div className="order-tracking-timeline">
        {statusSteps.map((step, index) => {
          const stepIndex = statusOrder.indexOf(step.key);

          const isCompleted =
            currentStatusIndex > stepIndex;

          const isCurrent =
            order.orderStatus === step.key;

          const isUpcoming =
            currentStatusIndex < stepIndex;

          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`order-tracking-step ${
                isCompleted ? "completed" : ""
              } ${isCurrent ? "current" : ""} ${
                isUpcoming ? "upcoming" : ""
              }`}
            >
              <div className="order-tracking-step-rail">
                <div className="order-tracking-step-icon">
                  <Icon size={18} />

                  {isCurrent && (
                    <span className="order-tracking-live">
                      Live
                    </span>
                  )}
                </div>

                {index < statusSteps.length - 1 && (
                  <div className="order-tracking-step-line" />
                )}
              </div>

              <div className="order-tracking-step-content">
                <div className="order-tracking-step-header">
                  <h3>{step.title}</h3>

                  {isCompleted && (
                    <CheckCircle2 size={16} />
                  )}
                </div>

                <p>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
          </section>
        )}

        {(order.orderStatus === "pending" ||
          order.orderStatus === "confirmed") && (
          <section className="order-tracking-cancel">
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              <XCircle size={20} />

              {cancelling
                ? "Cancelling..."
                : "Cancel Order"}
            </button>
          </section>
        )}

        <section className="order-tracking-address">
          <div className="order-tracking-section-title">
            <MapPin size={20} />

            <h3>Delivery Address</h3>
          </div>

          <p>{order.deliveryAddress}</p>

          {order.deliveryDistanceKm !== undefined && (
            <p>
              Delivery distance:{" "}
              {order.deliveryDistanceKm.toFixed(2)} km
            </p>
          )}
        </section>

        <section className="order-tracking-items">
          <h3>Your Order</h3>

          {order.items.map((item) => (
            <div
              className="order-tracking-item"
              key={item.menuItem}
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <div className="order-tracking-item-info">
                <strong>{item.name}</strong>

                <span>
                  {item.quantity} × ₦
                  {item.price.toLocaleString()}
                </span>
              </div>

              <strong>
                ₦{item.subtotal.toLocaleString()}
              </strong>
            </div>
          ))}
        </section>

        <section className="order-tracking-summary">
          <h3>Payment Summary</h3>

          <div>
            <span>Subtotal</span>

            <strong>
              ₦{order.subtotal.toLocaleString()}
            </strong>
          </div>

          <div>
            <span>Delivery Fee</span>

            <strong>
              {order.deliveryFee === 0
                ? "Free"
                : `₦${order.deliveryFee.toLocaleString()}`}
            </strong>
          </div>

          <div>
            <span>Payment Status</span>

            <strong>
              {paymentStatusLabel}
            </strong>
          </div>

          <div>
            <span>Payment Method</span>

            <strong>
              {order.paymentMethod.toUpperCase()}
            </strong>
          </div>

          <div className="order-tracking-total">
            <span>Total</span>

            <strong>
              ₦{order.total.toLocaleString()}
            </strong>
          </div>
        </section>
      </main>

<BottomNavigation activeItem="Orders" />

</div>
  );
}

export default OrderTracking;