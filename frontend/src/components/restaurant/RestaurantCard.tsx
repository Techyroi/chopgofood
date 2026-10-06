import type { Restaurant } from "../../services/restaurantService";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const badgeText =
    restaurant.badge === "topRated"
      ? "Top Rated"
      : restaurant.badge === "promo"
        ? "Promo"
        : null;

  return (
    <article className="restaurant-card">
      {/* Restaurant Image */}
      <div className="restaurant-card-image-wrapper">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="restaurant-card-image"
        />

        {/* Badge */}
        {badgeText && (
          <span className="restaurant-badge">
            {badgeText}
          </span>
        )}

        {/* Delivery Time */}
        <span className="restaurant-delivery-time">
          {restaurant.estimatedDeliveryTimeMin}–
          {restaurant.estimatedDeliveryTimeMax} min
        </span>
      </div>

      {/* Restaurant Information */}
            <div className="home-restaurant-info">
        <div className="home-restaurant-title-row">
          <h3>{restaurant.name}</h3>

          <span className="home-rating">
            ★ {restaurant.rating}
          </span>
        </div>

        <p>{restaurant.cuisine}</p>

        <div className="home-restaurant-meta">
          <span>
            {restaurant.estimatedDeliveryTimeMin}–
            {restaurant.estimatedDeliveryTimeMax} min
          </span>

          <span>
            Delivery ₦{restaurant.deliveryFee}
          </span>
        </div>
      </div>

        <p className="restaurant-description">
          {restaurant.cuisine} • {restaurant.description}
        </p>

        {/* Delivery Information */}
        {restaurant.deliveryMessage && (
          <div className="restaurant-delivery-message">
            <span>🚲</span>
            <span>{restaurant.deliveryMessage}</span>
          </div>
        )}
    </article>
  );
}

export default RestaurantCard;