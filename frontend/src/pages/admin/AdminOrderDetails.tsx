import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  Bike,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

import "./AdminOrderDetails.css";

interface AdminOrderItem {
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface AdminOrder {
  _id: string;


  deliveryAddress: string;
  deliveryDistanceKm: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;

  deliveryLocation: {
    latitude: number;
    longitude: number;
  };

  user?: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
  };

  restaurant?: {
    name: string;
    address?: string;
    phone?: string;
  };

    rider?: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  items: AdminOrderItem[];
}

interface AdminOrderResponse {
  success: boolean;
  data: AdminOrder;
}

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
const [statusMessage, setStatusMessage] = useState("");

    const [riders, setRiders] = useState<
    {
      _id: string;
      fullName: string;
      email?: string;
      phone?: string;
    }[]
  >([]);

    useEffect(() => {
    loadOrder();
    loadRiders();
  }, [id]);

  const [selectedRiderId, setSelectedRiderId] = useState("");

  const [assigningRider, setAssigningRider] =
    useState(false);

  const [riderMessage, setRiderMessage] = useState("");


  const loadOrder = async () => {
    if (!id) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get<AdminOrderResponse>(
        `/admin/orders/${id}`
      );

      setOrder(response.data.data);
    } catch (error) {
      console.error("Failed to load order:", error);
      setError("Unable to load this order.");
    } finally {
      setLoading(false);
    }
  };
  

    const loadRiders = async () => {
    try {
      const response = await api.get("/admin/riders");

      setRiders(response.data.data || []);
    } catch (error) {
      console.error("Failed to load riders:", error);
    }
  };

  const handleAssignRider = async () => {
  if (!id || !selectedRiderId) {
    return;
  }

  try {
    setAssigningRider(true);
    setRiderMessage("");

    const response = await api.put(
      `/admin/orders/${id}/rider`,
      {
        riderId: selectedRiderId,
      }
    );

    setOrder(response.data.data);

    setRiderMessage("Rider assigned successfully.");
  } catch (error: any) {
    console.error("Failed to assign rider:", error);

    setRiderMessage(
      error.response?.data?.message ||
        "Failed to assign rider."
    );
  } finally {
    setAssigningRider(false);
  }
};

  const handleStatusChange = async (
  newStatus: string
) => {
  if (!order || newStatus === order.orderStatus) {
    return;
  }

  try {
    setUpdatingStatus(true);
    setStatusMessage("");

    const response = await api.put(
      `/admin/orders/${order._id}/status`,
      {
        orderStatus: newStatus,
      }
    );

    setOrder((currentOrder) =>
      currentOrder
        ? {
            ...currentOrder,
            orderStatus: response.data.data.orderStatus,
          }
        : currentOrder
    );

    setStatusMessage("Order status updated successfully.");

    setTimeout(() => {
      setStatusMessage("");
    }, 3000);
  } catch (error) {
    console.error(
      "Failed to update order status:",
      error
    );

    setStatusMessage(
      "Unable to update order status."
    );
  } finally {
    setUpdatingStatus(false);
  }
};

 


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-details-loading">
          Loading order...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-order-details-page">
        <button
          type="button"
          className="admin-order-back-button"
          onClick={() => navigate("/admin/orders")}
        >
          <ArrowLeft size={18} />
          Back to orders
        </button>

        <div className="admin-order-details-error">
          <p>{error || "Order not found."}</p>

          <button type="button" onClick={loadOrder}>
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-details-page">
      <header className="admin-order-details-header">
        <div>
          <button
            type="button"
            className="admin-order-back-button"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft size={18} />
            Back to orders
          </button>

          <span className="admin-order-details-eyebrow">
            ChopGoFood Admin
          </span>

          <h1>
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>

          <p>
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

            <div className="admin-order-status-control">
            <div className="admin-order-status-select-wrapper">
                <select
                value={order.orderStatus}
                onChange={(event) =>
                    handleStatusChange(event.target.value)
                }
                disabled={updatingStatus}
                className={`admin-order-status-select admin-order-details-order-${order.orderStatus}`}
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

                <ChevronDown
                size={16}
                className="admin-order-status-chevron"
                />
            </div>

            {updatingStatus && (
                <span className="admin-order-status-updating">
                Updating...
                </span>
            )}

            {!updatingStatus && statusMessage && (
                <span className="admin-order-status-message">
                {statusMessage}
                </span>
            )}
            </div>
      </header>

      <div className="admin-order-details-grid">
        <section className="admin-order-details-card admin-order-details-items">
          <div className="admin-order-details-card-header">
            <div>
              <h2>Order Items</h2>
              <p>{order.items.length} item(s)</p>
            </div>
          </div>

          <div className="admin-order-items-list">
            {order.items.map((item, index) => (
              <div
                className="admin-order-item"
                key={`${item.name}-${index}`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                  />
                ) : (
                  <div className="admin-order-item-placeholder">
                    Food
                  </div>
                )}

                <div className="admin-order-item-info">
                  <strong>{item.name}</strong>

                  <span>
                    {item.quantity} ×{" "}
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <strong className="admin-order-item-total">
                  {formatCurrency(item.subtotal)}
                </strong>
              </div>
            ))}
          </div>

          <div className="admin-order-summary">
            <div>
              <span>Subtotal</span>
              <strong>
                {formatCurrency(order.subtotal)}
              </strong>
            </div>

            <div>
              <span>Delivery fee</span>
              <strong>
                {formatCurrency(order.deliveryFee)}
              </strong>
            </div>

            <div className="admin-order-summary-total">
              <span>Total</span>
              <strong>
                {formatCurrency(order.total)}
              </strong>
            </div>
          </div>
        </section>

        <div className="admin-order-details-side">
          <section className="admin-order-details-card">
            <div className="admin-order-details-card-header">
              <h2>Customer</h2>
            </div>

            <div className="admin-order-info-list">
              <div>
                <span>Name</span>
                <strong>
                  {order.user?.fullName ||
                    "Unknown customer"}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {order.user?.email || "No email"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {order.user?.phone || "No phone"}
                </strong>
              </div>
            </div>
          </section>

          <section className="admin-order-details-card">
            <div className="admin-order-details-card-header">
              <h2>Restaurant</h2>
            </div>

            <div className="admin-order-info-list">
              <div>
                <span>Name</span>
                <strong>
                  {order.restaurant?.name ||
                    "Unknown restaurant"}
                </strong>
              </div>

              <div>
                <span>Address</span>
                <strong>
                  {order.restaurant?.address ||
                    "No address"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {order.restaurant?.phone ||
                    "No phone"}
                </strong>
              </div>
            </div>
          </section>

          <section className="admin-order-details-card">
            <div className="admin-order-details-card-header">
              <h2>Payment</h2>
            </div>

            <div className="admin-order-info-list">
              <div>
                <span>Method</span>
                <strong>
                  {order.paymentMethod}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <span
                  className={`admin-order-details-status admin-order-details-payment-${order.paymentStatus}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </section>

                    <section className="admin-order-details-card">
            <div className="admin-order-details-card-header">
              <div>
                <h2>Rider</h2>
              </div>

              <Bike size={20} />
            </div>

            {order.rider ? (
              <div className="admin-order-info-list">
                <div>
                  <span>Name</span>
                  <strong>{order.rider.fullName}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {order.rider.phone || "No phone"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {order.rider.email || "No email"}
                  </strong>
                </div>

                <div className="admin-order-rider-reassign">
                  <select
                    value={selectedRiderId}
                    onChange={(event) =>
                      setSelectedRiderId(event.target.value)
                    }
                    disabled={assigningRider}
                  >
                    <option value="">
                      Assign a different rider
                    </option>

                    {riders.map((rider) => (
                      <option
                        key={rider._id}
                        value={rider._id}
                      >
                        {rider.fullName}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAssignRider}
                    disabled={
                      assigningRider || !selectedRiderId
                    }
                  >
                    {assigningRider
                      ? "Assigning..."
                      : "Reassign Rider"}
                  </button>
                </div>

                {!assigningRider && riderMessage && (
                  <span className="admin-order-rider-message">
                    {riderMessage}
                  </span>
                )}
              </div>
            ) : (
              <div className="admin-order-rider-assignment">
                <p>No rider assigned to this order.</p>

                <div className="admin-order-rider-controls">
                  <select
                    value={selectedRiderId}
                    onChange={(event) =>
                      setSelectedRiderId(event.target.value)
                    }
                    disabled={assigningRider}
                  >
                    <option value="">
                      Select a rider
                    </option>

                    {riders.map((rider) => (
                      <option
                        key={rider._id}
                        value={rider._id}
                      >
                        {rider.fullName}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAssignRider}
                    disabled={
                      assigningRider || !selectedRiderId
                    }
                  >
                    {assigningRider
                      ? "Assigning..."
                      : "Assign Rider"}
                  </button>
                </div>

                {!assigningRider && riderMessage && (
                  <span className="admin-order-rider-message">
                    {riderMessage}
                  </span>
                )}
              </div>
            )}
          </section>

          

          <section className="admin-order-details-card">
            <div className="admin-order-details-card-header">
              <h2>Delivery</h2>
            </div>

            <div className="admin-order-info-list">
              <div>
                <span>Address</span>
                <strong>
                  {order.deliveryAddress}
                </strong>
              </div>

              <div>
                <span>Distance</span>
                <strong>
                  {order.deliveryDistanceKm.toFixed(2)} km
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {order.deliveryLocation.latitude.toFixed(6)},
                  {" "}
                  {order.deliveryLocation.longitude.toFixed(6)}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetails;