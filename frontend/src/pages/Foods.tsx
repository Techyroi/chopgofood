import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { getMenuItems } from "../services/menuItemService";
import type { MenuItem } from "../services/menuItemService";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function Foods() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [activeCategory, setActiveCategory] = useState(
  searchParams.get("category") || "All"
);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFood = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMenuItems();

        setMenuItems(
          data.filter((item) => item.isAvailable)
        );
      } catch (error) {
        console.error("Failed to load food:", error);
        setError("Failed to load food.");
      } finally {
        setLoading(false);
      }
    };

    loadFood();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        menuItems
          .map((item) => item.category)
          .filter(Boolean)
      )
    );

    return ["All", ...uniqueCategories];
  }, [menuItems]);

  const displayedFood = useMemo(() => {
    if (activeCategory === "All") {
      return menuItems;
    }

    return menuItems.filter(
      (item) =>
        item.category.toLowerCase() ===
        activeCategory.toLowerCase()
    );
  }, [menuItems, activeCategory]);

  return (
    <main className="foods-page">
      <header className="page-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>All Food</h1>

        <div />
      </header>

      <section className="foods-content">
        {!loading && !error && categories.length > 0 && (
          <div className="foods-categories">
            {categories.map((category) => (
        <button
          type="button"
          key={category}
          className={
            activeCategory === category
              ? "food-category active"
              : "food-category"
          }
          onClick={() => {
            setActiveCategory(category);

            if (category === "All") {
              navigate("/foods");
            } else {
              navigate(
                `/foods?category=${encodeURIComponent(category)}`
              );
            }
          }}
        >
          {category}
        </button>
            ))}
          </div>
        )}

        {loading && (
          <p className="home-status">
            Loading food...
          </p>
        )}

        {!loading && error && (
          <p className="home-status home-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          displayedFood.length === 0 && (
            <div className="foods-empty">
              <h2>No food available</h2>

              <p>
                There are no food items in this category.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          displayedFood.length > 0 && (
            <div className="home-food-grid">
              {displayedFood.map((item) => (
                      <button
          type="button"
          key={item._id}
          className="home-food-card"
          onClick={() =>
            navigate(`/food/${item._id}`)
          }
        >
          <div className="home-food-image">
            <img
              src={item.image}
              alt={item.name}
            />
          </div>

          <div className="home-food-content">
            <h3>{item.name}</h3>

            <p className="home-food-restaurant">
              {item.restaurant.name}
            </p>

            <div className="home-food-meta">
              <strong>
                ₦{item.price.toLocaleString()}
              </strong>

              <span>
                {item.preparationTime} min
              </span>
            </div>
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

export default Foods;