import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../services/api";
import { useCart } from "../context/CartContext";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await api.get(
          `/paystack/verify/${reference}`
        );

        if (response.data.success) {
          const orderId = response.data.data.orderId;

          clearCart();

          navigate(`/orders/${orderId}`, {
            replace: true,
          });

          return;
        }

        navigate("/", { replace: true });
      } catch (error) {
        console.error(
          "Payment verification error:",
          error
        );

        navigate("/", { replace: true });
      }
    };

    verifyPayment();
  }, [searchParams, clearCart, navigate]);

  return (
    <div className="payment-verification-page">
      <div className="payment-verification-content">
        <LoaderCircle
          className="payment-verification-spinner"
          size={42}
        />

        <h1>Confirming your order</h1>

        <p>
          We're confirming your payment and preparing
          your order details.
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;