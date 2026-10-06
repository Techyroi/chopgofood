import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Share2,
  Clock3,
  Truck,
  Plus,
  Flame,
  Star,
  X,
} from "lucide-react";

import { getRestaurantById } from "../services/restaurantService";
import type { Restaurant } from "../services/restaurantService";

import { getRestaurantMenuItems } from "../services/menuItemService";
import type { MenuItem } from "../services/menuItemService";

import { useCart } from "../context/CartContext";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addToCart, cartItems, cartCount, cartTotal } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("Featured");

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Restaurant ID is missing.");
      setLoading(false);
      return;
    }

    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        setError("");

      const [restaurantData, restaurantMenu] = await Promise.all([
        getRestaurantById(id),
        getRestaurantMenuItems(id),
      ]);

      setRestaurant(restaurantData);
      setMenuItems(restaurantMenu);
      } catch (error) {
        console.error("Failed to load restaurant:", error);
        setError("Failed to load restaurant information.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  const popularItems = menuItems.filter((item) => item.isPopular);

  const featuredItems =
    popularItems.length > 0 ? popularItems : menuItems;

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category).filter(Boolean))
  );

  const displayedItems = useMemo(() => {
    const categoryItems =
      activeCategory === "Featured"
        ? featuredItems
        : menuItems.filter(
            (item) => item.category === activeCategory
          );

    if (!searchQuery.trim()) {
      return categoryItems;
    }

    const query = searchQuery.toLowerCase().trim();

    return categoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [
    activeCategory,
    featuredItems,
    menuItems,
    searchQuery,
  ]);

  const handleShare = async () => {
    if (!restaurant) return;

    const shareUrl = window.location.href;

    const shareData = {
      title: `${restaurant.name} on ChopGoFood`,
      text: `Check out ${restaurant.name} on ChopGoFood.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);

      setShareMessage("Restaurant link copied!");

      setTimeout(() => {
        setShareMessage("");
      }, 2500);
    } catch (error) {
      console.error("Unable to share restaurant:", error);
    }
  };

  const handleCloseSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <main className="restaurant-detail-page">
        <p className="restaurant-detail-message">
          Loading restaurant...
        </p>

        <BottomNavigation activeItem="Home" />
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="restaurant-detail-page">
        <p className="restaurant-detail-message">
          {error || "Restaurant not found."}
        </p>

        <BottomNavigation activeItem="Home" />
      </main>
    );
  }

  return (
    <main className="restaurant-detail-page">
      <header className="restaurant-detail-header">
        {!isSearching ? (
          <>
            <button
              type="button"
              className="restaurant-detail-icon-button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={26} />
            </button>

            <div className="restaurant-detail-actions">
              <button
                type="button"
                className="restaurant-detail-icon-button"
                onClick={() => setIsSearching(true)}
                aria-label="Search menu"
              >
                <Search size={24} />
              </button>

              <button
                type="button"
                className="restaurant-detail-icon-button"
                onClick={handleShare}
                aria-label="Share restaurant"
              >
                <Share2 size={24} />
              </button>
            </div>
          </>
        ) : (
          <div className="restaurant-detail-search">
            <Search size={20} />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder={`Search ${restaurant.name}...`}
              autoFocus
            />

            <button
              type="button"
              onClick={handleCloseSearch}
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </header>

      <section className="restaurant-detail-hero">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="restaurant-detail-cover"
        />

        <div className="restaurant-detail-info-card">
          <div className="restaurant-detail-title-row">
            <h1>{restaurant.name}</h1>

            <div className="restaurant-detail-rating">
              <Star size={17} fill="currentColor" />
              <span>{restaurant.rating}</span>
            </div>
          </div>

          <p className="restaurant-detail-cuisine">
            {restaurant.cuisine}
          </p>

          <div className="restaurant-detail-divider" />

          <div className="restaurant-detail-meta">
            <div>
              <Clock3 size={22} />

              <strong>
                {restaurant.estimatedDeliveryTimeMin}–
                {restaurant.estimatedDeliveryTimeMax} min
              </strong>
            </div>

            <span className="restaurant-detail-dot">
              •
            </span>

            <div>
              <Truck size={22} />

              <strong>
                Fee calculated at checkout
              </strong>
            </div>
          </div>
        </div>
      </section>

      <nav className="restaurant-detail-categories">
        <button
          type="button"
          className={
            activeCategory === "Featured"
              ? "restaurant-detail-category active"
              : "restaurant-detail-category"
          }
          onClick={() => setActiveCategory("Featured")}
        >
          Featured
        </button>

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={
              activeCategory === category
                ? "restaurant-detail-category active"
                : "restaurant-detail-category"
            }
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="restaurant-detail-menu">
        <div className="restaurant-detail-menu-heading">
          <h2>
            {searchQuery.trim()
              ? `Search results`
              : activeCategory === "Featured"
              ? "Featured Items"
              : activeCategory}
          </h2>

          {searchQuery.trim() && (
            <span>
              {displayedItems.length}{" "}
              {displayedItems.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <div className="restaurant-detail-food-list">
          {displayedItems.length === 0 && (
            <p className="restaurant-detail-empty">
              {searchQuery.trim()
                ? "No food matches your search."
                : "No food available in this category."}
            </p>
          )}

          {displayedItems.map((item) => (
            <article
              key={item._id}
              className="restaurant-detail-food-card"
            >
              <div className="restaurant-detail-food-info">
                <div className="restaurant-detail-food-title">
                  <h3>{item.name}</h3>

                  {item.isPopular && (
                    <Flame
                      size={19}
                      className="restaurant-detail-popular-icon"
                      fill="currentColor"
                    />
                  )}
                </div>

                <p>{item.description}</p>

                <strong className="restaurant-detail-price">
                  ₦{item.price.toLocaleString()}
                </strong>
              </div>

              <div className="restaurant-detail-food-image-wrapper">
                <img
                  src={item.image}
                  alt={item.name}
                  className="restaurant-detail-food-image"
                />

                <button
                  type="button"
                  className="restaurant-detail-add-button"
                  onClick={() => addToCart(item)}
                  aria-label={`Add ${item.name} to cart`}
                >
                  <Plus size={24} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {cartItems.length > 0 && (
        <div className="restaurant-detail-cart-wrapper">
          <button
            type="button"
            className="restaurant-detail-cart"
            onClick={() => navigate("/cart")}
          >
            <span className="restaurant-detail-cart-count">
              {cartCount}
            </span>

            <strong>View Cart</strong>

            <strong>
              ₦{cartTotal.toLocaleString()}
            </strong>
          </button>
        </div>
      )}

      {shareMessage && (
        <div className="restaurant-detail-share-message">
          {shareMessage}
        </div>
      )}

      <BottomNavigation activeItem="Home" />
    </main>
  );
}

export default RestaurantDetail;