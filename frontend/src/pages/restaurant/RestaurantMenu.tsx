import { useEffect, useState } from "react";
import api from "../../services/api";

interface Restaurant {
  _id: string;
  name: string;
  logo?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category?: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime?: number;
  restaurant?: Restaurant;
  createdAt: string;
  updatedAt: string;
}

const RestaurantMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const [showAddForm, setShowAddForm] = useState(false);
const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
const [submitting, setSubmitting] = useState(false);
const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    price: "",
    category: "",
    isAvailable: true,
    isPopular: false,
    preparationTime: "20",
  });

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/restaurant-dashboard/menu");

      setMenuItems(response.data.data);
    } catch (error) {
      console.error("Failed to load restaurant menu:", error);
      setError("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleToggleChange = (
    field: "isAvailable" | "isPopular"
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleAddMenuItem = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Food name is required.");
      return;
    }

    if (!formData.price || Number(formData.price) < 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    if (
      !formData.preparationTime ||
      Number(formData.preparationTime) < 1
    ) {
      setFormError("Preparation time must be at least 1 minute.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/restaurant-dashboard/menu",
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim(),
          price: Number(formData.price),
          category: formData.category.trim(),
          isAvailable: formData.isAvailable,
          isPopular: formData.isPopular,
          preparationTime: Number(formData.preparationTime),
        }
      );

      setMenuItems((previous) => [
        response.data.data,
        ...previous,
      ]);

      setFormData({
        name: "",
        description: "",
        image: "",
        price: "",
        category: "",
        isAvailable: true,
        isPopular: false,
        preparationTime: "20",
      });

      setShowAddForm(false);
    } catch (error: any) {
      console.error("Failed to create menu item:", error);

      setFormError(
        error?.response?.data?.message ||
          "Failed to create menu item."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMenuItem = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  setFormError("");

  if (!editingItem) {
    return;
  }

  if (!formData.name.trim()) {
    setFormError("Food name is required.");
    return;
  }

  if (!formData.price || Number(formData.price) < 0) {
    setFormError("Please enter a valid price.");
    return;
  }

  if (
    !formData.preparationTime ||
    Number(formData.preparationTime) < 1
  ) {
    setFormError("Preparation time must be at least 1 minute.");
    return;
  }

  try {
    setSubmitting(true);

    const response = await api.put(
      `/restaurant-dashboard/menu/${editingItem._id}`,
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        isAvailable: formData.isAvailable,
        isPopular: formData.isPopular,
        preparationTime: Number(formData.preparationTime),
      }
    );

    setMenuItems((previous) =>
      previous.map((item) =>
        item._id === editingItem._id
          ? response.data.data
          : item
      )
    );

    setEditingItem(null);
    setShowAddForm(false);
    setFormError("");
  } catch (error: any) {
    console.error("Failed to update menu item:", error);

    setFormError(
      error?.response?.data?.message ||
        "Failed to update menu item."
    );
  } finally {
    setSubmitting(false);
  }
};

const handleOpenEditForm = (item: MenuItem) => {
  setEditingItem(item);

  setFormData({
    name: item.name,
    description: item.description || "",
    image: item.image || "",
    price: String(item.price),
    category: item.category || "",
    isAvailable: item.isAvailable,
    isPopular: item.isPopular,
    preparationTime: String(item.preparationTime || 20),
  });

  setFormError("");
  setShowAddForm(true);
};

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setShowAddForm(false);
    setFormError("");

    setFormData({
      name: "",
      description: "",
      image: "",
      price: "",
      category: "",
      isAvailable: true,
      isPopular: false,
      preparationTime: "20",
    });
  };

  if (loading) {
    return (
      <div className="restaurant-menu-page">
        <div className="restaurant-menu-loading">
          Loading menu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-menu-page">
        <div className="restaurant-menu-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-menu-page">
      <div className="restaurant-menu-header">
        <div>
          <h1>Menu</h1>

          <p>
            Manage your restaurant's food items and availability.
          </p>
        </div>

        <div className="restaurant-menu-header-actions">
          <div className="restaurant-menu-count">
            {menuItems.length} items
          </div>

           <button
  type="button"
  className="restaurant-menu-add-button"
  onClick={() => {
    setFormError("");
    setEditingItem(null);

    setFormData({
      name: "",
      description: "",
      image: "",
      price: "",
      category: "",
      isAvailable: true,
      isPopular: false,
      preparationTime: "20",
    });

    setShowAddForm(true);
  }}
>
  + Add Menu Item
</button>
        </div>
      </div>

      {menuItems.length === 0 ? (
        <div className="restaurant-menu-empty">
          <h2>No menu items</h2>

          <p>
            Your restaurant does not have any menu items yet.
          </p>
        </div>
      ) : (
        <div className="restaurant-menu-grid">
          {menuItems.map((item) => (
            <div
              className="restaurant-menu-card"
              key={item._id}
            >
              <div className="restaurant-menu-image">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                  />
                ) : (
                  <div className="restaurant-menu-image-placeholder">
                    No image
                  </div>
                )}
              </div>

              <div className="restaurant-menu-card-content">
                <div className="restaurant-menu-card-top">
                  <div>
                    <h3>{item.name}</h3>

                    {item.category && (
                      <span className="restaurant-menu-category">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <strong>
                    ₦{item.price.toLocaleString()}
                  </strong>
                </div>

                {item.description && (
                  <p className="restaurant-menu-description">
                    {item.description}
                  </p>
                )}

                <div className="restaurant-menu-meta">
                <span
                    className={
                    item.isAvailable
                        ? "menu-status available"
                        : "menu-status unavailable"
                    }
                >
                    {item.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>

                {item.isPopular && (
                    <span className="menu-popular">
                    Popular
                    </span>
                )}

                {item.preparationTime && (
                    <span className="menu-preparation-time">
                    {item.preparationTime} min
                    </span>
                )}
                </div>

                <button
                type="button"
                className="restaurant-menu-edit-button"
                onClick={() => handleOpenEditForm(item)}
                >
                Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

                {showAddForm && (
                    <div className="restaurant-menu-modal-overlay">
                    <div className="restaurant-menu-modal">
                        <div className="restaurant-menu-modal-header">
            <div>
                <h2>
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
                </h2>

                <p>
                {editingItem
                    ? "Update this food item's information."
                    : "Add a new food item to your restaurant menu."}
                </p>
            </div>

            <button
                type="button"
                className="restaurant-menu-modal-close"
                onClick={handleCloseForm}
                disabled={submitting}
            >
                ×
            </button>
            </div>

                    <form
        className="restaurant-menu-form"
        onSubmit={
            editingItem
            ? handleEditMenuItem
            : handleAddMenuItem
        }
        >
              {formError && (
                <div className="restaurant-menu-form-error">
                  {formError}
                </div>
              )}

              <div className="restaurant-menu-form-group">
                <label htmlFor="name">
                  Food Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Jollof Rice with Chicken"
                  required
                />
              </div>

              <div className="restaurant-menu-form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe the food item..."
                  rows={3}
                />
              </div>

              <div className="restaurant-menu-form-row">
                <div className="restaurant-menu-form-group">
                  <label htmlFor="price">
                    Price (₦)
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="4500"
                    required
                  />
                </div>

                <div className="restaurant-menu-form-group">
                  <label htmlFor="category">
                    Category
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleFormChange}
                    placeholder="e.g. Rice"
                  />
                </div>
              </div>

              <div className="restaurant-menu-form-group">
                <label htmlFor="image">
                  Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleFormChange}
                  placeholder="https://example.com/food.jpg"
                />
              </div>

              <div className="restaurant-menu-form-group">
                <label htmlFor="preparationTime">
                  Preparation Time (minutes)
                </label>

                <input
                  id="preparationTime"
                  name="preparationTime"
                  type="number"
                  min="1"
                  value={formData.preparationTime}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="restaurant-menu-form-options">
                <label className="restaurant-menu-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={() =>
                      handleToggleChange("isAvailable")
                    }
                  />

                  <span>
                    Available
                  </span>
                </label>

                <label className="restaurant-menu-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={() =>
                      handleToggleChange("isPopular")
                    }
                  />

                  <span>
                    Popular item
                  </span>
                </label>
              </div>

              <div className="restaurant-menu-form-actions">
                <button
                  type="button"
                  className="restaurant-menu-cancel-button"
                  onClick={handleCloseForm}
                  disabled={submitting}
                >
                  Cancel
                </button>

                        <button
            type="submit"
            className="restaurant-menu-submit-button"
            disabled={submitting}
            >
            {submitting
                ? editingItem
                ? "Saving..."
                : "Adding..."
                : editingItem
                ? "Save Changes"
                : "Add Menu Item"}
            </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;