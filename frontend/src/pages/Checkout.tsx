import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  CreditCard,
  Building2,
  Smartphone,
  WalletCards,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";

import {
  getRestaurantById,
} from "../services/restaurantService";

import type {
  Restaurant,
} from "../services/restaurantService";
import api from "../services/api";

type PaymentMethod =
  | "card"
  | "transfer"
  | "opay"
  | "ussd";

function Checkout() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

    const {
      cartItems,
      cartTotal,
      clearCart,
    } = useCart();
    const { refreshOrders } = useOrders();

const [address, setAddress] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [isPaying, setIsPaying] = useState(false);

const [checkoutId] = useState(() => crypto.randomUUID());

const [deliveryLocation, setDeliveryLocation] =
  useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

const [locationLoading, setLocationLoading] =
  useState(false);

const [locationError, setLocationError] =
  useState("");

  const [deliveryFee, setDeliveryFee] = useState(0);
const [deliveryDistance, setDeliveryDistance] =
  useState<number | null>(null);
const [quoteLoading, setQuoteLoading] =
  useState(false);
  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);


  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card");

  const restaurantId =
    cartItems[0]?.restaurant?._id;

  
  useEffect(() => {
  const reference = searchParams.get("reference");

  if (!reference) {
    return;
  }

  const verifyReturnedPayment = async () => {
    try {
      setIsPaying(true);

      const response = await api.get(
        `/paystack/verify/${encodeURIComponent(reference)}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Payment verification failed."
        );
      }

      const orderId =
        response.data.data.orderId;

      clearCart();

      navigate(`/orders/${orderId}`, {
        replace: true,
      });
    } catch (error: any) {
      console.error(
        "Returned payment verification error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "We could not verify your payment. Please try again."
      );

      setIsPaying(false);

      navigate("/checkout", {
        replace: true,
      });
    }
  };

  verifyReturnedPayment();
}, [searchParams, clearCart, navigate]);

  /*
   * Get restaurant information from MongoDB
   */
useEffect(() => {
  if (!restaurantId) {
    return;
  }

  const fetchRestaurant = async () => {
    try {
      const restaurantData =
        await getRestaurantById(restaurantId);

      setRestaurant(restaurantData);
    } catch (error) {
      console.error(
        "Failed to load restaurant:",
        error
      );
    }
  };

  fetchRestaurant();
}, [restaurantId]);

  /*
   * Delivery fee comes from MongoDB
   */
 const total = cartTotal + deliveryFee;

const handleUseCurrentLocation = () => {
  if (!navigator.geolocation) {
    setLocationError(
      "Location is not supported by your browser."
    );
    return;
  }

  setLocationLoading(true);
  setLocationError("");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Save GPS coordinates
        const location = {
          latitude,
          longitude,
        };

setDeliveryLocation(location);

let currentRestaurant = restaurant;

if (!currentRestaurant && restaurantId) {
  currentRestaurant = await getRestaurantById(restaurantId);
  setRestaurant(currentRestaurant);
}

await getDeliveryQuote(location, currentRestaurant);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Reverse geocoding request failed."
          );
        }

        const data = await response.json();

        console.log(
          "Reverse geocoding response:",
          data
        );

        if (data.display_name) {
          setAddress(data.display_name);
        } else {
          setLocationError(
            "Location detected, but no readable address was found."
          );
        }
      } catch (error) {
        console.error(
          "Reverse geocoding error:",
          error
        );

        setLocationError(
          "Location detected, but we could not find the delivery address."
        );
      } finally {
        setLocationLoading(false);
      }
    },
(error) => {
  console.error("Location error:", error);

  setLocationLoading(false);

  if (error.code === error.PERMISSION_DENIED) {
    setLocationError(
      "Location permission was denied. Please allow precise location access and try again."
    );
  } else if (error.code === error.POSITION_UNAVAILABLE) {
    setLocationError(
      "Your precise location is currently unavailable. Please move to an area with a better GPS signal and try again."
    );
  } else if (error.code === error.TIMEOUT) {
    setLocationError(
      "Getting your precise location is taking too long. Please try again."
    );
  } else {
    setLocationError(
      "We could not get your precise location. Please try again."
    );
  }
},
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    }
  );
};


const getDeliveryQuote = async (
  location: {
    latitude: number;
    longitude: number;
  },
  restaurantData: Restaurant | null = restaurant
) => {
  if (!restaurantData) {
    return;
  }

  try {
    setQuoteLoading(true);

    const response = await api.post(
      "/orders/delivery-quote",
      {
        restaurant: restaurantData._id,

        deliveryLocation: location,

        items: cartItems.map((item) => ({
          menuItem: item._id,
          price: item.price,
          quantity: item.quantity,
        })),
      }
    );

    const quote = response.data.data;

    setDeliveryFee(quote.deliveryFee);
    setDeliveryDistance(quote.distanceKm);

    console.log(
      "DELIVERY QUOTE:",
      quote
    );
  } catch (error: any) {
    console.error(
      "Delivery quote error:",
      error
    );

    setDeliveryFee(0);
    setDeliveryDistance(null);

    alert(
      error.response?.data?.message ||
        "Could not calculate delivery fee."
    );
  } finally {
    setQuoteLoading(false);
  }
};

const handlePayment = async () => {
  if (!phone.trim()) {
  alert("Please enter your phone number.");
  return;
}

if (!email.trim()) {
  alert("Please enter your email address.");
  return;
}

  if (!address.trim()) {
    alert("Please enter your delivery address.");
    return;
  }
  if (!deliveryLocation) {
  alert(
    "Please use your current location so we can calculate your delivery fee."
  );
  return;
}
  if (!restaurant) {
    alert("Restaurant information is still loading.");
    return;
  }

  if (cartItems.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  try {
    setIsPaying(true);

        console.log("ORDER DATA BEFORE SUBMIT", {
      phone,
      email,
      address,
      deliveryLocation,
    });

    const orderResponse = await api.post("/orders", {
      restaurant: restaurant._id,

      items: cartItems.map((item) => ({
        menuItem: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),

      deliveryAddress: address,

      deliveryLocation,

      phone: phone.trim(),

      paymentMethod,

      checkoutId,
    });

    await refreshOrders();

    const createdOrder = orderResponse.data.data;

    localStorage.setItem("chopgo_phone", phone.trim());

    const reference = createdOrder.paystackReference;

    console.log("CREATED ORDER FROM BACKEND:", createdOrder);
console.log("PAYSTACK REFERENCE:", createdOrder.paystackReference);

    if (!reference) {
      throw new Error(
        "Payment reference was not created for this order."
      );
    }

    console.log("Paystack reference:", reference);

    const paymentResponse = await api.post("/paystack/initialize", {
      email: email.trim(),
      amount: createdOrder.total,
      reference,
    });

    const authorizationUrl =
      paymentResponse.data.data.authorization_url;

    if (!authorizationUrl) {
      throw new Error("Paystack did not return a payment URL.");
    }

    window.location.href = authorizationUrl;
} catch (error: any) {
  console.error("Payment error:", error);

  console.error(
    "Backend error response:",
    error.response?.data
  );

  alert(
    error.response?.data?.message ||
      error.message ||
      "Something went wrong while starting payment."
  );

  setIsPaying(false);
}
};

  /*
   * Empty cart
   */
  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">

        <header className="checkout-header">

          <button
            type="button"
            className="checkout-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={25} />
          </button>

          <h1>Checkout</h1>

          <div className="checkout-header-space" />

        </header>

        <section className="checkout-section">

          <h2>
            Your cart is empty
          </h2>

          <p>
            Add some food before proceeding
            to checkout.
          </p>

        </section>

      </main>
    );
  }

  return (
    <main className="checkout-page">

      {/* HEADER */}
      <header className="checkout-header">

        <button
          type="button"
          className="checkout-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={25} />
        </button>

        <h1>Checkout</h1>

        <div className="checkout-header-space" />

      </header>


      {/* DELIVERY LOCATION */}
      <section className="checkout-section">

      <div className="checkout-section-title">
        <div>
          <h2>Delivery Location</h2>
          <p className="checkout-section-subtitle">
            Where should we deliver your order?
          </p>
        </div>
      </div>

        {/* ADDRESS INPUT */}
        <div className="checkout-address">

          <div className="checkout-address-icon">
            <MapPin size={22} />
          </div>

          <div className="checkout-address-content">

                  <strong>Delivery Address</strong>

      <span className="checkout-field-hint">
        Use your current location for accurate delivery pricing
      </span>

                    <input
          type="text"
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
          }
          placeholder="Search for your delivery address"
        />
          <button
          type="button"
          className="checkout-current-location-button"
          onClick={handleUseCurrentLocation}
          disabled={locationLoading}
        >
          <Navigation size={16} />

          {locationLoading
            ? "Getting your location..."
            : "Use my current location"}
        </button>

        {deliveryLocation && (
          <p className="checkout-location-success">
            Location detected successfully.
          </p>
        )}

        {locationError && (
          <p className="checkout-location-error">
            {locationError}
          </p>
        )}

          </div>

        </div>

        <div className="checkout-customer-field">
  <strong>Phone number</strong>

      <input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={phone}
      onChange={(event) =>
        setPhone(event.target.value)
      }
      placeholder="08012345678"
    />

</div>

<div className="checkout-customer-field">
  <strong>Email address</strong>

    <input
      type="email"
      inputMode="email"
      autoComplete="email"
      value={email}
      onChange={(event) =>
        setEmail(event.target.value)
      }
      placeholder="you@example.com"
    />
</div>

      </section>


      {/* PAYMENT METHOD */}
      <section className="checkout-section">

        <div className="checkout-section-title">

          <h2>
            Payment Method
          </h2>

        </div>

        <p className="checkout-payment-description">
          Choose how you want to pay securely
          with Paystack.
        </p>

        <div className="checkout-payment-options">

          {/* CARD */}
          <button
            type="button"
            className={
              paymentMethod === "card"
                ? "checkout-payment-option active"
                : "checkout-payment-option"
            }
            onClick={() =>
              setPaymentMethod("card")
            }
          >

            <div className="checkout-payment-icon">
              <CreditCard size={20} />
            </div>

            <div className="checkout-payment-info">

              <strong>
                Pay with Card
              </strong>

              <p>
                Visa, Mastercard or Verve
              </p>

            </div>

            <span className="checkout-radio">
              {paymentMethod === "card" && "✓"}
            </span>

          </button>


          {/* TRANSFER */}
          <button
            type="button"
            className={
              paymentMethod === "transfer"
                ? "checkout-payment-option active"
                : "checkout-payment-option"
            }
            onClick={() =>
              setPaymentMethod("transfer")
            }
          >

            <div className="checkout-payment-icon">
              <Building2 size={20} />
            </div>

            <div className="checkout-payment-info">

              <strong>
                Bank Transfer
              </strong>

              <p>
                Pay directly from your bank
              </p>

            </div>

            <span className="checkout-radio">
              {paymentMethod === "transfer" && "✓"}
            </span>

          </button>


          {/* OPAY */}
          <button
            type="button"
            className={
              paymentMethod === "opay"
                ? "checkout-payment-option active"
                : "checkout-payment-option"
            }
            onClick={() =>
              setPaymentMethod("opay")
            }
          >

            <div className="checkout-payment-icon">
              <WalletCards size={20} />
            </div>

            <div className="checkout-payment-info">

              <strong>
                Pay with OPay
              </strong>

              <p>
                Pay using your OPay account
              </p>

            </div>

            <span className="checkout-radio">
              {paymentMethod === "opay" && "✓"}
            </span>

          </button>


          {/* USSD */}
          <button
            type="button"
            className={
              paymentMethod === "ussd"
                ? "checkout-payment-option active"
                : "checkout-payment-option"
            }
            onClick={() =>
              setPaymentMethod("ussd")
            }
          >

            <div className="checkout-payment-icon">
              <Smartphone size={20} />
            </div>

            <div className="checkout-payment-info">

              <strong>
                Pay with USSD
              </strong>

              <p>
                Pay using your bank USSD
              </p>

            </div>

            <span className="checkout-radio">
              {paymentMethod === "ussd" && "✓"}
            </span>

          </button>

        </div>

      </section>


      {/* ORDER ITEMS */}
      <section className="checkout-section">

        <h2>
          Your Order
        </h2>

            {restaurant && (
      <div className="checkout-restaurant-info">
        <div className="checkout-restaurant-icon">
          <MapPin size={18} />
        </div>

        <div>
          <strong>{restaurant.name}</strong>
          <span>{restaurant.address}</span>
        </div>
      </div>
    )}

        <div className="checkout-items">

          {cartItems.map((item) => (

            <article
              key={item._id}
              className="checkout-item"
            >

              <img
                src={item.image}
                alt={item.name}
                className="checkout-item-image"
              />

              <div className="checkout-item-info">

                <h3>
                  {item.name}
                </h3>

                <p>
                  Qty: {item.quantity}
                </p>

              </div>

              <strong>
                ₦
                {(
                  item.price *
                  item.quantity
                ).toLocaleString()}
              </strong>

            </article>

          ))}

        </div>

      </section>


      {/* ORDER SUMMARY */}
      <section className="checkout-section checkout-summary">

        <h2>
          Order Summary
        </h2>

        <div className="checkout-summary-row">

          <span>
            Subtotal
          </span>

          <strong>
            ₦{cartTotal.toLocaleString()}
          </strong>

        </div>

        <div className="checkout-summary-row">

          <span>
            Delivery fee
          </span>

          <strong>
            {quoteLoading
              ? "Calculating..."
              : deliveryLocation
                ? `₦${deliveryFee.toLocaleString()}`
                : "Determined by address"}
          </strong>

              </div>

              {deliveryDistance !== null && (
        <div className="checkout-summary-row">
          <span>
            Delivery distance
          </span>

          <strong>
            {deliveryDistance} km
          </strong>
        </div>
      )}

        <div className="checkout-summary-divider" />

        <div className="checkout-total">

          <span>
            Total
          </span>

          <strong>
            ₦{total.toLocaleString()}
          </strong>

        </div>

      </section>


      {/* PAY BUTTON */}
      <div className="checkout-bottom">

        <button
      type="button"
      className="checkout-place-order-button"
      onClick={handlePayment}
      disabled={isPaying || quoteLoading}
    >
        {isPaying
      ? "Redirecting to Paystack..."
      : quoteLoading
        ? "Calculating delivery..."
        : `Pay ₦${total.toLocaleString()}`}
      </button>

      </div>
          <BottomNavigation activeItem="Home" />
    </main>
  );
}

export default Checkout;