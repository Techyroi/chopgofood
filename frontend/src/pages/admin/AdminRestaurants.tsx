import { useEffect, useState } from "react";
import {
  Edit,
  MapPin,
  Phone,
  Store,
  X,
} from "lucide-react";
import api from "../../services/api";
import "./AdminRestaurants.css";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  cuisine: string;
  address: string;
  phone: string;
  rating: number;
  deliveryFee: number;
  estimatedDeliveryTimeMin: number;
  estimatedDeliveryTimeMax: number;
  badge: "none" | "topRated" | "promo";
  deliveryMessage: string;
  deliveryType: "fee" | "free" | "fastest";
  isOpen: boolean;
  isActive: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface RestaurantForm {
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  cuisine: string;
  address: string;
  phone: string;
  rating: string;
  deliveryFee: string;
  estimatedDeliveryTimeMin: string;
  estimatedDeliveryTimeMax: string;
  badge: "none" | "topRated" | "promo";
  deliveryMessage: string;
  deliveryType: "fee" | "free" | "fastest";
  isOpen: boolean;
  isActive: boolean;
  latitude: string;
  longitude: string;
}

const emptyForm: RestaurantForm = {
  name: "",
  slug: "",
  description: "",
  logo: "",
  coverImage: "",
  cuisine: "",
  address: "",
  phone: "",
  rating: "",
  deliveryFee: "",
  estimatedDeliveryTimeMin: "",
  estimatedDeliveryTimeMax: "",
  badge: "none",
  deliveryMessage: "",
  deliveryType: "fee",
  isOpen: true,
  isActive: true,
  latitude: "",
  longitude: "",
};

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<
    Restaurant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingRestaurant, setEditingRestaurant] =
    useState<Restaurant | null>(null);

  const [form, setForm] =
    useState<RestaurantForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/admin/restaurants"
        );

        setRestaurants(response.data.data);
      } catch (error) {
        console.error(
          "Failed to load admin restaurants:",
          error
        );

        setError("Unable to load restaurants.");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG")}`;
  };

  const openEditModal = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);

    setForm({
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description || "",
      logo: restaurant.logo || "",
      coverImage: restaurant.coverImage || "",
      cuisine: restaurant.cuisine || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      rating: String(restaurant.rating ?? ""),
      deliveryFee: String(
        restaurant.deliveryFee ?? ""
      ),
      estimatedDeliveryTimeMin: String(
        restaurant.estimatedDeliveryTimeMin ?? ""
      ),
      estimatedDeliveryTimeMax: String(
        restaurant.estimatedDeliveryTimeMax ?? ""
      ),
      badge: restaurant.badge || "none",
      deliveryMessage:
        restaurant.deliveryMessage || "",
      deliveryType: restaurant.deliveryType || "fee",
      isOpen: restaurant.isOpen,
      isActive: restaurant.isActive,
      latitude: String(
        restaurant.location?.latitude ?? ""
      ),
      longitude: String(
        restaurant.location?.longitude ?? ""
      ),
    });

    setSaveError("");
    setSaveMessage("");
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditingRestaurant(null);
    setForm(emptyForm);
    setSaveError("");
    setSaveMessage("");
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleBooleanChange = (
    name: "isOpen" | "isActive"
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: !currentForm[name],
    }));
  };

  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingRestaurant) return;

    try {
      setSaving(true);
      setSaveError("");
      setSaveMessage("");

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        logo: form.logo.trim(),
        coverImage: form.coverImage.trim(),
        cuisine: form.cuisine.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        rating: Number(form.rating),
        deliveryFee: Number(form.deliveryFee),
        estimatedDeliveryTimeMin: Number(
          form.estimatedDeliveryTimeMin
        ),
        estimatedDeliveryTimeMax: Number(
          form.estimatedDeliveryTimeMax
        ),
        badge: form.badge,
        deliveryMessage:
          form.deliveryMessage.trim(),
        deliveryType: form.deliveryType,
        isOpen: form.isOpen,
        isActive: form.isActive,
        location: {
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
      };

      const response = await api.put(
        `/admin/restaurants/${editingRestaurant._id}`,
        payload
      );

      const updatedRestaurant =
        response.data.data;

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant._id === updatedRestaurant._id
            ? updatedRestaurant
            : restaurant
        )
      );

      setEditingRestaurant(updatedRestaurant);
      setSaveMessage(
        "Restaurant updated successfully."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error: any) {
      console.error(
        "Failed to update restaurant:",
        error
      );

      setSaveError(
        error?.response?.data?.message ||
          "Unable to update restaurant."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-restaurants-page">
        <div className="admin-restaurants-loading">
          Loading restaurants...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-restaurants-page">
        <div className="admin-restaurants-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-restaurants-page">
      <div className="admin-restaurants-header">
        <div>
          <p className="admin-restaurants-eyebrow">
            Restaurant Management
          </p>

          <h1>Restaurants</h1>

          <p className="admin-restaurants-subtitle">
            Manage your partner restaurants and
            their availability.
          </p>
        </div>

        <div className="admin-restaurants-count">
          <Store size={18} />
          <span>
            {restaurants.length} Restaurants
          </span>
        </div>
      </div>

      <div className="admin-restaurants-grid">
        {restaurants.map((restaurant) => (
          <article
            key={restaurant._id}
            className="admin-restaurant-card"
          >
            <div className="admin-restaurant-cover">
              {restaurant.coverImage ? (
                <img
                  src={restaurant.coverImage}
                  alt={restaurant.name}
                />
              ) : (
                <div className="admin-restaurant-cover-placeholder">
                  <Store size={30} />
                </div>
              )}

              <span
                className={`admin-restaurant-open-status ${
                  restaurant.isOpen
                    ? "is-open"
                    : "is-closed"
                }`}
              >
                {restaurant.isOpen
                  ? "Open"
                  : "Closed"}
              </span>
            </div>

            <div className="admin-restaurant-content">
              <div className="admin-restaurant-main">
                <div className="admin-restaurant-logo">
                  {restaurant.logo ? (
                    <img
                      src={restaurant.logo}
                      alt=""
                    />
                  ) : (
                    <Store size={22} />
                  )}
                </div>

                <div className="admin-restaurant-title">
                  <h2>{restaurant.name}</h2>

                  <span>
                    {restaurant.cuisine ||
                      "Restaurant"}
                  </span>
                </div>
              </div>

              <div className="admin-restaurant-info">
                <div>
                  <MapPin size={16} />
                  <span>
                    {restaurant.address}
                  </span>
                </div>

                <div>
                  <Phone size={16} />
                  <span>
                    {restaurant.phone ||
                      "No phone number"}
                  </span>
                </div>
              </div>

              <div className="admin-restaurant-meta">
                <div>
                  <span className="admin-meta-label">
                    Rating
                  </span>

                  <strong>
                    {restaurant.rating.toFixed(1)}
                  </strong>
                </div>

                <div>
                  <span className="admin-meta-label">
                    Delivery
                  </span>

                  <strong>
                    {restaurant.deliveryType ===
                    "free"
                      ? "Free"
                      : formatCurrency(
                          restaurant.deliveryFee
                        )}
                  </strong>
                </div>

                <div>
                  <span className="admin-meta-label">
                    ETA
                  </span>

                  <strong>
                    {
                      restaurant.estimatedDeliveryTimeMin
                    }
                    -
                    {
                      restaurant.estimatedDeliveryTimeMax
                    }
                    min
                  </strong>
                </div>
              </div>

              <div className="admin-restaurant-footer">
                <span
                  className={`admin-restaurant-active-status ${
                    restaurant.isActive
                      ? "active"
                      : "inactive"
                  }`}
                >
                  <span className="status-dot" />

                  {restaurant.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

                <button
                  type="button"
                  className="admin-restaurant-edit-button"
                  onClick={() =>
                    openEditModal(restaurant)
                  }
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingRestaurant && (
        <div
          className="admin-restaurant-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeEditModal();
            }
          }}
        >
          <div className="admin-restaurant-modal">
            <div className="admin-restaurant-modal-header">
              <div>
                <p className="admin-restaurants-eyebrow">
                  Restaurant Management
                </p>

                <h2>Edit Restaurant</h2>

                <p>
                  Update the information for{" "}
                  <strong>
                    {editingRestaurant.name}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                className="admin-restaurant-modal-close"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-restaurant-form"
              onSubmit={handleSave}
            >
              <div className="admin-form-section">
                <h3>Basic Information</h3>

                <div className="admin-form-grid">
                  <label>
                    <span>Restaurant name</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                    />
                  </label>

                  <label>
                    <span>Slug</span>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleInputChange}
                      required
                    />
                  </label>

                  <label>
                    <span>Cuisine</span>
                    <input
                      name="cuisine"
                      value={form.cuisine}
                      onChange={handleInputChange}
                    />
                  </label>

                  <label>
                    <span>Phone</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>

                <label>
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </label>
              </div>

              <div className="admin-form-section">
                <h3>Images</h3>

                <div className="admin-form-grid">
                  <label>
                    <span>Logo URL</span>
                    <input
                      name="logo"
                      value={form.logo}
                      onChange={handleInputChange}
                    />
                  </label>

                  <label>
                    <span>Cover image URL</span>
                    <input
                      name="coverImage"
                      value={form.coverImage}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-form-section">
                <h3>Location</h3>

                <label>
                  <span>Address</span>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <div className="admin-form-grid">
                  <label>
                    <span>Latitude</span>
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={handleInputChange}
                      required
                    />
                  </label>

                  <label>
                    <span>Longitude</span>
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="admin-form-section">
                <h3>Delivery</h3>

                <div className="admin-form-grid">
                  <label>
                    <span>Delivery type</span>
                    <select
                      name="deliveryType"
                      value={form.deliveryType}
                      onChange={handleInputChange}
                    >
                      <option value="fee">
                        Delivery fee
                      </option>
                      <option value="free">
                        Free delivery
                      </option>
                      <option value="fastest">
                        Fastest
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Delivery fee</span>
                    <input
                      name="deliveryFee"
                      type="number"
                      min="0"
                      value={form.deliveryFee}
                      onChange={handleInputChange}
                    />
                  </label>

                  <label>
                    <span>Minimum ETA</span>
                    <input
                      name="estimatedDeliveryTimeMin"
                      type="number"
                      min="1"
                      value={
                        form.estimatedDeliveryTimeMin
                      }
                      onChange={handleInputChange}
                      required
                    />
                  </label>

                  <label>
                    <span>Maximum ETA</span>
                    <input
                      name="estimatedDeliveryTimeMax"
                      type="number"
                      min="1"
                      value={
                        form.estimatedDeliveryTimeMax
                      }
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>Delivery message</span>
                  <input
                    name="deliveryMessage"
                    value={form.deliveryMessage}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="admin-form-section">
                <h3>Restaurant Settings</h3>

                <div className="admin-form-grid">
                  <label>
                    <span>Rating</span>
                    <input
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={handleInputChange}
                    />
                  </label>

                  <label>
                    <span>Badge</span>
                    <select
                      name="badge"
                      value={form.badge}
                      onChange={handleInputChange}
                    >
                      <option value="none">
                        None
                      </option>
                      <option value="topRated">
                        Top Rated
                      </option>
                      <option value="promo">
                        Promo
                      </option>
                    </select>
                  </label>
                </div>

                <div className="admin-form-toggles">
                  <button
                    type="button"
                    className={`admin-form-toggle ${
                      form.isOpen ? "enabled" : ""
                    }`}
                    onClick={() =>
                      handleBooleanChange("isOpen")
                    }
                  >
                    <span>
                      <strong>Restaurant is open</strong>
                      <small>
                        Controls whether customers
                        see the restaurant as open.
                      </small>
                    </span>

                    <span className="toggle-pill">
                      {form.isOpen
                        ? "ON"
                        : "OFF"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`admin-form-toggle ${
                      form.isActive ? "enabled" : ""
                    }`}
                    onClick={() =>
                      handleBooleanChange("isActive")
                    }
                  >
                    <span>
                      <strong>
                        Restaurant is active
                      </strong>
                      <small>
                        Inactive restaurants are
                        hidden from the customer
                        restaurant list.
                      </small>
                    </span>

                    <span className="toggle-pill">
                      {form.isActive
                        ? "ON"
                        : "OFF"}
                    </span>
                  </button>
                </div>
              </div>

              {saveError && (
                <div className="admin-restaurant-form-error">
                  {saveError}
                </div>
              )}

              {saveMessage && (
                <div className="admin-restaurant-form-success">
                  {saveMessage}
                </div>
              )}

              <div className="admin-restaurant-form-actions">
                <button
                  type="button"
                  className="admin-restaurant-cancel-button"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-restaurant-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;