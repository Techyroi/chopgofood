import type { Restaurant } from "../../services/restaurantService";
import RestaurantCard from "./RestaurantCard";

interface RestaurantListProps {
  restaurants: Restaurant[];
}

function RestaurantList({
  restaurants,
}: RestaurantListProps) {
  return (
    <div className="restaurant-list">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant._id}
          restaurant={restaurant}
        />
      ))}
    </div>
  );
}

export default RestaurantList;