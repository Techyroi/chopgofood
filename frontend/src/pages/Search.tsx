import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search as SearchIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getRestaurants } from "../services/restaurantService";
import type { Restaurant } from "../services/restaurantService";

import { getMenuItems } from "../services/menuItemService";
import type { MenuItem } from "../services/menuItemService";
import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function Search() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const [restaurants, setRestaurants] =
    useState<Restaurant[]>([]);

  const [menuItems, setMenuItems] =
    useState<MenuItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          restaurantData,
          menuData,
        ] = await Promise.all([
          getRestaurants(),
          getMenuItems(),
        ]);

        setRestaurants(restaurantData);

        setMenuItems(
          menuData.filter(
            (item) => item.isAvailable
          )
        );
      } catch (error) {
        console.error(
          "Failed to load search data:",
          error
        );

        setError(
          "Failed to load search data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSearchData();
  }, []);

  const search = searchTerm
    .trim()
    .toLowerCase();

  const filteredRestaurants = useMemo(() => {
    if (!search) {
      return [];
    }

    return restaurants.filter((restaurant) => {
      const restaurantName =
        restaurant.name?.toLowerCase() || "";

      const cuisine =
        restaurant.cuisine?.toLowerCase() || "";

      const description =
        restaurant.description?.toLowerCase() || "";

      return (
        restaurantName.includes(search) ||
        cuisine.includes(search) ||
        description.includes(search)
      );
    });
  }, [restaurants, search]);

  const filteredFood = useMemo(() => {
    if (!search) {
      return [];
    }

    return menuItems.filter((item) => {
      const itemName =
        item.name?.toLowerCase() || "";

      const category =
        item.category?.toLowerCase() || "";

      const restaurantName =
        item.restaurant?.name?.toLowerCase() || "";

      const description =
        item.description?.toLowerCase() || "";

      return (
        itemName.includes(search) ||
        category.includes(search) ||
        restaurantName.includes(search) ||
        description.includes(search)
      );
    });
  }, [menuItems, search]);

  return (
    <main className="search-page">

      {/* HEADER */}

      <header className="search-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>Search</h1>

        <div />
      </header>

      {/* SEARCH */}

      <section className="search-content">
        <div className="search-input-wrapper">
          <SearchIcon size={20} />

          <input
            type="text"
            placeholder="Search food or restaurants"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            autoFocus
          />
        </div>

        {/* LOADING */}

        {loading && (
          <p className="home-status">
            Loading search...
          </p>
        )}

        {/* ERROR */}

        {!loading && error && (
          <p className="home-status home-error">
            {error}
          </p>
        )}

        {/* EMPTY SEARCH */}

        {!loading &&
          !error &&
          !search && (
            <div className="search-empty">
              <SearchIcon size={42} />

              <h2>
                Find something delicious
              </h2>

              <p>
                Search for restaurants,
                food, or categories.
              </p>
            </div>
          )}

        {/* NO RESULTS */}

        {!loading &&
          !error &&
          search &&
          filteredRestaurants.length === 0 &&
          filteredFood.length === 0 && (
            <div className="search-empty">
              <SearchIcon size={42} />

              <h2>
                No results found
              </h2>

              <p>
                Try searching for another
                food or restaurant.
              </p>
            </div>
          )}

        {/* RESTAURANT RESULTS */}

        {!loading &&
          !error &&
          filteredRestaurants.length > 0 && (
            <section className="search-results-section">
              <h2>Restaurants</h2>

              <div className="search-results-list">
                {filteredRestaurants.map(
                  (restaurant) => (
                    <button
                      type="button"
                      key={restaurant._id}
                      className="search-result-card"
                      onClick={() =>
                        navigate(
                          `/restaurant/${restaurant._id}`
                        )
                      }
                    >
                      <img
                        src={restaurant.coverImage}
                        alt={restaurant.name}
                      />

                      <div>
                        <h3>
                          {restaurant.name}
                        </h3>

                        <p>
                          {restaurant.cuisine}
                        </p>

                        <span>
                          ★ {restaurant.rating}
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

        {/* FOOD RESULTS */}

        {!loading &&
          !error &&
          filteredFood.length > 0 && (
            <section className="search-results-section">
              <h2>Food</h2>

              <div className="search-results-list">
                {filteredFood.map(
                  (item) => (
                    <button
                      type="button"
                      key={item._id}
                      className="search-result-card"
                      onClick={() =>
                        navigate(
                          `/food/${item._id}`
                        )
                      }
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <div>
                        <h3>
                          {item.name}
                        </h3>

                        <p>
                          {item.restaurant.name}
                        </p>

                        <strong>
                          ₦
                          {item.price.toLocaleString()}
                        </strong>
                      </div>
                    </button>
                  )
                )}
              </div>
            </section>
          )}
      </section>

      <BottomNavigation activeItem="Search" />
    </main>
  );
}

export default Search;