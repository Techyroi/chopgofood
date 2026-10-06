import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRestaurants } from "../services/restaurantService";
import type { Restaurant } from "../services/restaurantService";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function Restaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getRestaurants();

        setRestaurants(data);
      } catch (error) {
        console.error("Failed to load restaurants:", error);
        setError("Failed to load restaurants.");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  return (
    <main className="restaurants-page">
      <header className="page-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>Restaurants</h1>

        <div />
      </header>

      <section className="restaurants-content">
        {loading && (
          <p className="home-status">
            Loading restaurants...
          </p>
        )}

        {!loading && error && (
          <p className="home-status home-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          restaurants.length === 0 && (
            <div className="restaurants-empty">
              <h2>No restaurants available</h2>
              <p>
                There are no restaurants available right now.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          restaurants.length > 0 && (
            <div className="restaurants-list">
              {restaurants.map((restaurant) => (
                <button
                  type="button"
                  key={restaurant._id}
                  className="restaurant-list-card"
                  onClick={() =>
                    navigate(
                      `/restaurant/${restaurant._id}`
                    )
                  }
                >
                  <div className="restaurant-list-image">
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                    />

                    <span>
                      {restaurant.estimatedDeliveryTimeMin}–
                      {restaurant.estimatedDeliveryTimeMax} min
                    </span>
                  </div>

                  <div className="restaurant-list-info">
                    <div className="restaurant-list-title">
                      <h2>{restaurant.name}</h2>

                      <span>
                        ★ {restaurant.rating}
                      </span>
                    </div>

                    <p>{restaurant.cuisine}</p>

                    <small>
                      Delivery fee calculated at checkout
                    </small>
                  </div>
                </button>
              ))}
            </div>
          )}
      </section>

      <BottomNavigation activeItem="Home" />
    </main>
  );
}

export default Restaurants;