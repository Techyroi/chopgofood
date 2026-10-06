import api from "./api";

export interface MenuItemRestaurant {
  _id: string;
  name: string;
  slug: string;
}

export interface MenuItem {
  _id: string;
  restaurant: MenuItemRestaurant;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
  createdAt: string;
  updatedAt: string;
}

interface MenuItemResponse {
  success: boolean;
  count: number;
  data: MenuItem[];
}

export const getMenuItems = async (
  popularOnly = false
): Promise<MenuItem[]> => {
  const response = await api.get<MenuItemResponse>("/menu-items", {
    params: popularOnly ? { popular: true } : undefined,
  });

  return response.data.data;
};

export const getMenuItemById = async (
  id: string
): Promise<MenuItem> => {
  const response = await api.get<{
    success: boolean;
    data: MenuItem;
  }>(`/menu-items/${id}`);

  return response.data.data;
};

export const getRestaurantMenuItems = async (
  restaurantId: string
): Promise<MenuItem[]> => {
  const response = await api.get<{
    success: boolean;
    count: number;
    restaurant: {
      id: string;
      name: string;
    };
    data: MenuItem[];
  }>(`/menu-items/restaurant/${restaurantId}`);

  return response.data.data;
};