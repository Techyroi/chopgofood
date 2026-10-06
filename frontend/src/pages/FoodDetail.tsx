import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getMenuItemById,
} from "../services/menuItemService";

import type {
  MenuItem,
} from "../services/menuItemService";

import { useCart } from "../context/CartContext";

function FoodDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { addToCart } = useCart();

  const [food, setFood] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFood = async () => {
      if (!id) {
        setError("Food item not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMenuItemById(id);

        setFood(data);
      } catch (error) {
        console.error(
          "Failed to load food:",
          error
        );

        setError(
          "Failed to load food."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFood();
  }, [id]);

  if (loading) {
    return (
      <main className="food-detail-page">
        <p className="home-status">
          Loading food...
        </p>
      </main>
    );
  }

  if (error || !food) {
    return (
      <main className="food-detail-page">
        <p className="home-status home-error">
          {error || "Food item not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="food-detail-page">

      <header className="page-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>Food Details</h1>

        <div />
      </header>


      <section className="food-detail-content">

        <div className="food-detail-image">
          <img
            src={food.image}
            alt={food.name}
          />
        </div>


        <div className="food-detail-info">

          <h2>
            {food.name}
          </h2>

          <p className="food-detail-restaurant">
            {food.restaurant.name}
          </p>

          <p className="food-detail-description">
            {food.description}
          </p>


          <div className="food-detail-meta">

            <strong>
              ₦{food.price.toLocaleString()}
            </strong>

            <span>
              {food.preparationTime} min
            </span>

          </div>


          <button
            type="button"
            className="food-detail-add-button"
            onClick={() => {
              addToCart(food);
              navigate("/cart");
            }}
          >
            Add to Cart
          </button>

        </div>

      </section>

    </main>
  );
}

export default FoodDetail;