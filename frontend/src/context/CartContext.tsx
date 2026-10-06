import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { MenuItem } from "../services/menuItemService";

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCartItems((currentItems) => {
      /*
       * ONE RESTAURANT PER CART
       *
       * If the cart already contains food from another
       * restaurant, ask the customer before replacing it.
       */
      if (currentItems.length > 0) {
        const currentRestaurantId =
          currentItems[0].restaurant._id;

        const newRestaurantId =
          item.restaurant._id;

        if (currentRestaurantId !== newRestaurantId) {
          const currentRestaurantName =
            currentItems[0].restaurant.name;

          const newRestaurantName =
            item.restaurant.name;

          const shouldStartNewOrder = window.confirm(
            `Your cart contains items from ${currentRestaurantName}.\n\n` +
              `Would you like to clear your cart and start a new order from ${newRestaurantName}?`
          );

          if (!shouldStartNewOrder) {
            return currentItems;
          }

          return [
            {
              ...item,
              quantity: 1,
            },
          ];
        }
      }

      /*
       * Same restaurant:
       * Increase quantity if item already exists.
       */
      const existingItem = currentItems.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      /*
       * New item from the same restaurant.
       */
      return [
        ...currentItems,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (itemId: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (itemId: string) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item._id === itemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item._id !== itemId
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}