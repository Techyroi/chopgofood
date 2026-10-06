import api from "./api";

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  cuisine: string;
  address: string;
  phone: string;
  rating: number;
  deliveryFee: number;

  estimatedDeliveryTimeMin: number;
  estimatedDeliveryTimeMax: number;

  badge: "none" | "topRated" | "promo";
  deliveryMessage: string;
  deliveryType: "fee" | "free" | "fastest";

  isOpen: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  location: {
    latitude: number;
    longitude: number;
  };
}



interface RestaurantResponse {
  success: boolean;
  count: number;
  data: Restaurant[];
}

interface SingleRestaurantResponse {
  success: boolean;
  data: Restaurant;
}

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get<RestaurantResponse>("/restaurants");

  return response.data.data;
};

export const getRestaurantById = async (
  id: string
): Promise<Restaurant> => {
  const response = await api.get<SingleRestaurantResponse>(
    `/restaurants/${id}`
  );

  return response.data.data;
};