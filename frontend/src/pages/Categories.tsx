import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMenuItems } from "../services/menuItemService";
import type { MenuItem } from "../services/menuItemService";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

interface CategoryData {
  name: string;
  count: number;
  image: string;
}

function Categories() {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMenuItems();

        setMenuItems(
          data.filter((item) => item.isAvailable)
        );
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const categories = useMemo<CategoryData[]>(() => {
    const categoryMap = new Map<string, CategoryData>();

    menuItems.forEach((item) => {
      const category = item.category?.trim();

      if (!category) {
        return;
      }

      const existingCategory = categoryMap.get(category);

      if (existingCategory) {
        existingCategory.count += 1;
        return;
      }

      categoryMap.set(category, {
        name: category,
        count: 1,
        image: item.image,
      });
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) => b.count - a.count
    );
  }, [menuItems]);

  return (
    <main className="categories-page">
      <header className="page-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>Categories</h1>

        <div />
      </header>

      <section className="categories-content">

        {loading && (
          <p className="home-status">
            Loading categories...
          </p>
        )}

        {!loading && error && (
          <p className="home-status home-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <div className="categories-empty">
              <h2>No categories available</h2>

              <p>
                Food categories will appear here when
                menu items are added.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <div className="categories-grid">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.name}
                  className="category-card"
                  onClick={() =>
                    navigate(
                      `/foods?category=${encodeURIComponent(
                        category.name
                      )}`
                    )
                  }
                >
                  <div className="category-card-image">
                    <img
                      src={category.image}
                      alt={category.name}
                    />
                  </div>

                  <div className="category-card-overlay" />

                  <div className="category-card-content">
                    <h2>{category.name}</h2>

                    <span>
                      {category.count}{" "}
                      {category.count === 1
                        ? "item"
                        : "items"}
                    </span>
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

export default Categories;