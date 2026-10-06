import {
  Home,
  ClipboardList,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";
import { useOrders } from "../../../context/OrdersContext";

interface BottomNavigationProps {
  activeItem?: string;
}

function BottomNavigation({
  activeItem,
}: BottomNavigationProps) {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { activeOrderCount } = useOrders();

  const items = [
    { name: "Home", icon: <Home size={20} />, path: "/home" },
    {
      name: "Orders",
      icon: <ClipboardList size={20} />,
      path: "/orders",
    },
    {
      name: "Search",
      icon: <Search size={20} />,
      path: "/search",
    },
    {
      name: "Cart",
      icon: <ShoppingCart size={20} />,
      path: "/cart",
    },
    {
      name: "Account",
      icon: <User size={20} />,
      path: "/account",
    },
  ];

  return (
    <nav className="bottom-navigation">
      {items.map((item) => (
        <button
          key={item.name}
          type="button"
          className={
            activeItem === item.name
              ? "bottom-nav-item active"
              : "bottom-nav-item"
          }
          onClick={() => navigate(item.path)}
        >
          <span className="bottom-nav-icon">
                {item.name === "Cart" ? (
        <span className="bottom-nav-cart-icon">
          {item.icon}

          {cartCount > 0 && (
            <span className="bottom-nav-cart-badge">
              {cartCount}
            </span>
          )}
        </span>
      ) : item.name === "Orders" ? (
        <span className="bottom-nav-cart-icon">
          {item.icon}

          {activeOrderCount > 0 && (
            <span className="bottom-nav-cart-badge">
              {activeOrderCount}
            </span>
          )}
        </span>
      ) : (
        item.icon
      )}
          </span>

          <span className="bottom-nav-label">
            {item.name}
          </span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNavigation;