import { useEffect, useMemo, useState } from "react";
import { getRestaurants } from "../services/restaurantService";
import type { Restaurant } from "../services/restaurantService";

import RestaurantHeader from "../components/restaurant/layout/RestaurantHeader";
import SearchBar from "../components/restaurant/restaurant/SearchBar";
import CategoryFilter from "../components/restaurant/restaurant/CategoryFilter";
import RestaurantList from "../components/restaurant/RestaurantList";
import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function RestaurantListing() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurants();

        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
        setError("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        restaurant.cuisine
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        restaurant.cuisine
          .toLowerCase()
          .includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [restaurants, search, selectedCategory]);

  if (loading) {
    return <p>Loading restaurants...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="restaurant-page">
      <RestaurantHeader />

      <section className="restaurant-discovery">
        <SearchBar
          value={search}
          onChange={setSearch}
        />

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <section className="restaurant-results">
          <h1>Restaurants</h1>

          {filteredRestaurants.length === 0 ? (
            <p>No restaurants found.</p>
          ) : (
            <RestaurantList
              restaurants={filteredRestaurants}
            />
          )}
        </section>
      </section>


      <BottomNavigation activeItem="Search" />
      
    </main>
  );
}



export default RestaurantListing;