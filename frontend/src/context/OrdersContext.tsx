import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";

interface Order {
  _id: string;
  orderStatus: string;
}

interface OrdersContextType {
  orders: Order[];
  activeOrderCount: number;
  refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(
  undefined
);

export function OrdersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = async () => {
    try {
      const response = await api.get("/orders");

      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const activeOrderCount = orders.filter(
    (order) =>
      order.orderStatus !== "delivered" &&
      order.orderStatus !== "cancelled"
  ).length;

  return (
    <OrdersContext.Provider
      value={{
        orders,
        activeOrderCount,
        refreshOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error(
      "useOrders must be used inside OrdersProvider"
    );
  }

  return context;
}