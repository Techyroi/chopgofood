import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const navigate = useNavigate();

  return (
    <main className="cart-page">
      {/* HEADER */}
      <header className="cart-header">
        <button
          type="button"
          className="cart-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>Your Cart</h1>

        <div className="cart-header-space" />
      </header>

      {cartItems.length === 0 ? (
        /* EMPTY CART */
        <section className="cart-empty">
          <div className="cart-empty-icon">
            <ShoppingBag size={34} />
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add something delicious and it will appear here.
          </p>

          <button
            type="button"
            className="cart-empty-button"
            onClick={() => navigate("/foods")}
          >
            Explore Food
          </button>
        </section>
      ) : (
        <>
          {/* RESTAURANT */}
          <section className="cart-restaurant">
            <span>Order from</span>

            <h2>
              {cartItems[0].restaurant.name}
            </h2>
          </section>

          {/* CART ITEMS */}
          <section className="cart-items">
            {cartItems.map((item) => (
              <article
                key={item._id}
                className="cart-item"
              >
                <div className="cart-item-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                </div>

                <div className="cart-item-content">
                  <div className="cart-item-title-row">
                    <div>
                      <h3>{item.name}</h3>

                      <span className="cart-item-restaurant">
                        {item.restaurant.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() =>
                        removeFromCart(item._id)
                      }
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <strong className="cart-item-price">
                    ₦{item.price.toLocaleString()}
                  </strong>

                  <div className="cart-item-bottom">
                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item._id)
                        }
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus size={16} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item._id)
                        }
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <strong className="cart-item-subtotal">
                      ₦
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* SUMMARY */}
          <section className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>

              <strong>
                ₦{cartTotal.toLocaleString()}
              </strong>
            </div>

            <div className="cart-summary-row">
              <span>Delivery fee</span>

              <strong className="cart-summary-dynamic">
                Calculated at checkout
              </strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Food total</span>

              <strong>
                ₦{cartTotal.toLocaleString()}
              </strong>
            </div>
          </section>

          {/* CHECKOUT */}
          <div className="cart-checkout-wrapper">
            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate("/checkout")}
            >
              <span>Proceed to Checkout</span>

              <strong>
                ₦{cartTotal.toLocaleString()}
              </strong>
            </button>
          </div>
        </>
      )}

      {/* BOTTOM NAVIGATION */}
      <BottomNavigation activeItem="Cart" />
    </main>
  );
}

export default Cart;