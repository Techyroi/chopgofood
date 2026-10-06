import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapPin,
  Bell,
  Search,
} from "lucide-react";

import { getRestaurants } from "../services/restaurantService";
import type { Restaurant } from "../services/restaurantService";

import { getMenuItems } from "../services/menuItemService";
import type { MenuItem } from "../services/menuItemService";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function Home() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

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

    const fetchMenuItems = async () => {
      try {
      const data = await getMenuItems(true);

      setMenuItems(data);
      
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        setMenuError("Failed to load popular food");
      } finally {
        setMenuLoading(false);
      }
    };

    fetchRestaurants();
    fetchMenuItems();
  }, []);

  const displayedMenuItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) =>
            item.category.toLowerCase() ===
            activeCategory.toLowerCase()
        );

  return (
    <main className="home-page">

      {/* ================================
          HOME HEADER
      ================================= */}

      <header className="home-header">

        <button
          type="button"
          className="home-location"
          onClick={() => navigate("/checkout")}
          aria-label="Choose delivery location"
        >
          <MapPin size={19} />

    
        </button>


            <div className="home-brand">
      <img
        src="/logo/chopgo-logo-horizontal.png"
        alt="ChopGo"
      />
    </div>


        <button
          type="button"
          className="home-notification-button"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

      </header>


      {/* ================================
          HOME CONTENT
      ================================= */}

      <section className="home-content">

        {/* Greeting */}

        <div className="home-greeting">
          <span>
            Good morning 👋
          </span>

          <h1>
            What are you craving?
          </h1>
        </div>


        {/* Search */}

        <button
          type="button"
          className="home-search"
          onClick={() => navigate("/search")}
          aria-label="Search food or restaurants"
        >
          <Search size={20} />

          <span>
            Search food or restaurants
          </span>
        </button>


{/* ================================
    CATEGORIES
================================= */}

<section className="home-section home-categories-section">

  <div className="home-section-header">
    <h2>Categories</h2>

    <button
      type="button"
      onClick={() => navigate("/categories")}
    >
      See all
    </button>
  </div>

  <div className="home-category-layout">

    {/* FIXED ALL CATEGORY */}
    <button
      type="button"
      className={
        activeCategory === "All"
          ? "home-category home-category-all active"
          : "home-category home-category-all"
      }
      onClick={() => {
        setActiveCategory("All");
        navigate("/foods");
      }}
    >
      <span className="home-category-image">
        <img
          src="/categories/category-all.png"
          alt="All food"
        />
      </span>

      <span className="home-category-name">
        All
      </span>
    </button>

    {/* MOVING FOOD CATEGORIES */}
    <div className="home-category-marquee">
      <div className="home-category-track">

        {[
          {
            name: "Rice",
            image: "/categories/category-rice.png",
          },
          {
            name: "Pizza",
            image: "/categories/category-pizza.png",
          },
          {
            name: "Burger",
            image: "/categories/category-burger.png",
          },
          {
            name: "Shawarma",
            image: "/categories/category-shawarma.png",
          },
          {
            name: "Small Chops",
            image: "/categories/category-small-chops.png",
          },
          {
            name: "Fried Chicken",
            image: "/categories/category-fried-chicken.png",
          },
          {
            name: "Amala",
            image: "/categories/category-amala.png",
          },
          {
            name: "Pounded Yam",
            image: "/categories/category-pounded-yam.png",
          },
         
        ].map((category) => (
          <button
            type="button"
            key={category.name}
            className={
              activeCategory === category.name
                ? "home-category active"
                : "home-category"
            }
            onClick={() => {
              setActiveCategory(category.name);
              navigate(`/foods?category=${category.name}`);
            }}
          >
            <span className="home-category-image">
              <img
                src={category.image}
                alt={category.name}
              />
            </span>

            <span className="home-category-name">
              {category.name}
            </span>
          </button>
        ))}

        {/* DUPLICATE SET FOR SEAMLESS FLOW */}
        {[
          {
            name: "Rice",
            image: "/categories/category-rice.png",
          },
          {
            name: "Pizza",
            image: "/categories/category-pizza.png",
          },
          {
            name: "Burger",
            image: "/categories/category-burger.png",
          },
          {
            name: "Shawarma",
            image: "/categories/category-shawarma.png",
          },
          {
            name: "Small Chops",
            image: "/categories/category-small-chops.png",
          },
          {
            name: "Fried Chicken",
            image: "/categories/category-fried-chicken.png",
          },
          {
            name: "Amala",
            image: "/categories/category-amala.png",
          },
          {
            name: "Pounded Yam",
            image: "/categories/category-pounded-yam.png",
          },
         
        ].map((category, index) => (
          <button
            type="button"
            key={`${category.name}-duplicate-${index}`}
            className={
              activeCategory === category.name
                ? "home-category active"
                : "home-category"
            }
            onClick={() => {
              setActiveCategory(category.name);
              navigate(`/foods?category=${category.name}`);
            }}
          >
            <span className="home-category-image">
              <img
                src={category.image}
                alt={category.name}
              />
            </span>

            <span className="home-category-name">
              {category.name}
            </span>
          </button>
        ))}

      </div>
    </div>

  </div>

</section>


        {/* ================================
            POPULAR RESTAURANTS
        ================================= */}

        <section className="home-section">

          <div className="home-section-header">

            <h2>
              Popular Restaurants
            </h2>

            <button
              type="button"
              onClick={() => navigate("/restaurants")}
            >
              See all
            </button>

          </div>


          {loading && (
            <p className="home-status">
              Loading restaurants...
            </p>
          )}


          {error && (
            <p className="home-status home-error">
              {error}
            </p>
          )}


          {!loading &&
            !error &&
            restaurants.length === 0 && (
              <p className="home-status">
                No restaurants available.
              </p>
            )}


          {!loading &&
            !error &&
            restaurants.length > 0 && (

              <div className="home-restaurant-list">

                {restaurants.map((restaurant) => (

                  <article
                    className="home-restaurant-card"
                    key={restaurant._id}
                    onClick={() =>
                      navigate(
                        `/restaurant/${restaurant._id}`
                      )
                    }
                  >

                    {/* Restaurant Image */}

                    <div className="home-restaurant-image">

                  <img
                    src={restaurant.coverImage || undefined}
                    alt={restaurant.name}
                    loading="lazy"
                  />

                      <span className="home-delivery-time">
                        {restaurant.estimatedDeliveryTimeMin}–
                        {restaurant.estimatedDeliveryTimeMax} min
                      </span>

                    </div>


                    {/* Restaurant Information */}

                    <div className="home-restaurant-info">

                      <div className="home-restaurant-title-row">

                        <h3>
                          {restaurant.name}
                        </h3>

                        <span className="home-rating">
                          ★ {restaurant.rating}
                        </span>

                      </div>


                      <p className="home-restaurant-cuisine">
                        {restaurant.cuisine}
                      </p>


                      <div className="home-delivery-info">
                        Delivery fee calculated at checkout
                      </div>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </section>


        {/* ================================
            POPULAR FOOD
        ================================= */}

        <section className="home-section">

          <div className="home-section-header">

            <h2>
              Popular Food
            </h2>

            <button
              type="button"
              onClick={() => navigate("/foods")}
            >
              See all
            </button>

          </div>


          {menuLoading && (
            <p className="home-status">
              Loading popular food...
            </p>
          )}


          {menuError && (
            <p className="home-status home-error">
              {menuError}
            </p>
          )}


          {!menuLoading &&
            !menuError &&
            displayedMenuItems.length === 0 && (

              <p className="home-status">
                {activeCategory === "All"
                  ? "No popular food available."
                  : `No popular ${activeCategory.toLowerCase()} available.`}
              </p>

            )}


          {!menuLoading &&
            !menuError &&
            displayedMenuItems.length > 0 && (

              <div className="home-food-list">

                {displayedMenuItems.map((item) => (

                  <article
                    className="home-food-card"
                    key={item._id}
                    onClick={() =>
                      navigate(
                        `/restaurant/${item.restaurant._id}`
                      )
                    }
                  >

                    {/* Food Image */}

                    <div className="home-food-image">

                <img
                  src={item.image || undefined}
                  alt={item.name}
                  loading="lazy"
                />

                    </div>


                    {/* Food Information */}

                    <div className="home-food-info">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.restaurant.name}
                      </p>


                      <div className="home-food-bottom">

                        <strong>
                          ₦{item.price.toLocaleString()}
                        </strong>

                        <span>
                          {item.preparationTime} min
                        </span>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </section>

      </section>


      {/* ================================
          BOTTOM NAVIGATION
      ================================= */}

      <BottomNavigation activeItem="Home" />

    </main>
  );
}

export default Home;