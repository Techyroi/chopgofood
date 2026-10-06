import api from "./api";

export interface AdminRecentOrder {
  _id: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
  };
  restaurant?: {
    _id: string;
    name: string;
  };
}

export interface AdminDashboardData {
  totalCustomers: number;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: AdminRecentOrder[];
}

interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}

export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  const response = await api.get<AdminDashboardResponse>(
    "/admin/dashboard"
  );

  return response.data.data;
};