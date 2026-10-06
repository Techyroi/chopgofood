import { useEffect, useMemo, useState } from "react";
import { CreditCard, Eye, Search } from "lucide-react";
import api from "../../services/api";
import "./AdminPayments.css";

interface PaymentUser {
  _id: string;
  fullName?: string;
  email?: string;
}

interface PaymentRestaurant {
  _id: string;
  name?: string;
  logo?: string;
}

interface Payment {
  _id: string;
  user?: PaymentUser;
  restaurant?: PaymentRestaurant;
  total: number;
  paymentMethod: "card" | "transfer" | "opay" | "ussd";
  paymentStatus: "pending" | "paid" | "failed";
  checkoutId: string;
  paystackReference?: string | null;
  createdAt: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await api.get("/admin/payments");

        setPayments(response.data.data || []);
      } catch (error) {
        console.error("Failed to load payments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return payments;
    }

    return payments.filter((payment) => {
      return (
        payment.user?.fullName?.toLowerCase().includes(query) ||
        payment.user?.email?.toLowerCase().includes(query) ||
        payment.restaurant?.name?.toLowerCase().includes(query) ||
        payment.paymentMethod?.toLowerCase().includes(query) ||
        payment.paymentStatus?.toLowerCase().includes(query) ||
        payment.checkoutId?.toLowerCase().includes(query) ||
        payment.paystackReference
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [payments, search]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPaymentMethod = (method: string) => {
    const labels: Record<string, string> = {
      card: "Card",
      transfer: "Transfer",
      opay: "OPay",
      ussd: "USSD",
    };

    return labels[method] || method;
  };

  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.total,
    0
  );

  const paidAmount = payments
    .filter((payment) => payment.paymentStatus === "paid")
    .reduce((sum, payment) => sum + payment.total, 0);

  const pendingAmount = payments
    .filter((payment) => payment.paymentStatus === "pending")
    .reduce((sum, payment) => sum + payment.total, 0);

  return (
    <div className="admin-payments-page">
      <div className="admin-payments-header">
        <div>
          <h1>Payments</h1>
          <p>
            View and monitor payments recorded for ChopGoFood orders.
          </p>
        </div>

        <div className="admin-payments-count">
          <CreditCard size={18} />
          <span>{payments.length} Payments</span>
        </div>
      </div>

      <div className="admin-payments-summary">
        <div className="admin-payment-summary-card">
          <span>Total Amount</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>

        <div className="admin-payment-summary-card">
          <span>Paid</span>
          <strong>{formatCurrency(paidAmount)}</strong>
        </div>

        <div className="admin-payment-summary-card">
          <span>Pending</span>
          <strong>{formatCurrency(pendingAmount)}</strong>
        </div>
      </div>

      <div className="admin-payments-toolbar">
        <div className="admin-payments-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      <div className="admin-payments-card">
        {loading ? (
          <div className="admin-payments-state">
            <p>Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="admin-payments-state">
            <div className="admin-payments-empty-icon">
              <CreditCard size={28} />
            </div>

            <h3>
              {search
                ? "No payments found"
                : "No payments yet"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Payment records will appear here when orders are created."}
            </p>
          </div>
        ) : (
          <div className="admin-payments-table-wrapper">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div className="admin-payment-customer">
                        <strong>
                          {payment.user?.fullName ||
                            "Unknown customer"}
                        </strong>

                        <span>
                          {payment.user?.email || "No email"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-payment-restaurant">
                        {payment.restaurant?.name ||
                          "Unknown restaurant"}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(payment.total)}
                      </strong>
                    </td>

                    <td>
                      <span className="admin-payment-method">
                        {formatPaymentMethod(
                          payment.paymentMethod
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-payment-status ${payment.paymentStatus}`}
                      >
                        {payment.paymentStatus
                          .charAt(0)
                          .toUpperCase() +
                          payment.paymentStatus.slice(1)}
                      </span>
                    </td>

                    <td>
                      <span className="admin-payment-reference">
                        {payment.paystackReference ||
                          payment.checkoutId ||
                          "—"}
                      </span>
                    </td>

                    <td>{formatDate(payment.createdAt)}</td>

                    <td>
                      <button
                        type="button"
                        className="admin-payments-view-button"
                        title="View payment"
                        onClick={() =>
                          setSelectedPayment(payment)
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
      </div>

      {selectedPayment && (
        <div
          className="admin-payment-modal-overlay"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="admin-payment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-payment-modal-header">
              <div>
                <h2>Payment Details</h2>
                <p>Payment information from the order</p>
              </div>

              <button
                type="button"
                className="admin-payment-modal-close"
                onClick={() =>
                  setSelectedPayment(null)
                }
              >
                ×
              </button>
            </div>

            <div className="admin-payment-modal-amount">
              <span>Amount</span>
              <strong>
                {formatCurrency(selectedPayment.total)}
              </strong>
            </div>

            <div className="admin-payment-details">
              <div>
                <span>Customer</span>
                <strong>
                  {selectedPayment.user?.fullName ||
                    "Unknown customer"}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedPayment.user?.email ||
                    "No email"}
                </strong>
              </div>

              <div>
                <span>Restaurant</span>
                <strong>
                  {selectedPayment.restaurant?.name ||
                    "Unknown restaurant"}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>
                  {formatPaymentMethod(
                    selectedPayment.paymentMethod
                  )}
                </strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong>
                  {selectedPayment.paymentStatus
                    .charAt(0)
                    .toUpperCase() +
                    selectedPayment.paymentStatus.slice(1)}
                </strong>
              </div>

              <div>
                <span>Checkout ID</span>
                <strong>
                  {selectedPayment.checkoutId || "—"}
                </strong>
              </div>

              <div>
                <span>Paystack Reference</span>
                <strong>
                  {selectedPayment.paystackReference ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Date</span>
                <strong>
                  {formatDate(selectedPayment.createdAt)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;