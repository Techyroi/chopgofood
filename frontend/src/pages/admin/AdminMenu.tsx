import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Star,
  X,
} from "lucide-react";

import api from "../../services/api";
import "./AdminMenu.css";

interface Restaurant {
  _id: string;
  name: string;
  logo?: string;
}

interface MenuItem {
  _id: string;
  restaurant: Restaurant;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category?: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
  createdAt: string;
  updatedAt: string;
}

interface MenuFormData {
  restaurant: string;
  name: string;
  description: string;
  image: string;
  price: string;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: string;
}

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState("all");

  const [editingItem, setEditingItem] =
    useState<MenuItem | null>(null);

 const [showAddModal, setShowAddModal] =
  useState(false);

  const [formData, setFormData] =
    useState<MenuFormData>({
      restaurant: "",
      name: "",
      description: "",
      image: "",
      price: "",
      category: "",
      isAvailable: true,
      isPopular: false,
      preparationTime: "20",
    });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] =
    useState("");

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/menu");

      setMenuItems(response.data.data);
    } catch (error) {
      console.error("Failed to load admin menu:", error);

      setError("Unable to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  const restaurants = useMemo(() => {
    const restaurantMap = new Map<string, Restaurant>();

    menuItems.forEach((item) => {
      if (item.restaurant?._id) {
        restaurantMap.set(
          item.restaurant._id,
          item.restaurant
        );
      }
    });

    return Array.from(restaurantMap.values());
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return menuItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.restaurant?.name
          .toLowerCase()
          .includes(search);

      const matchesRestaurant =
        selectedRestaurant === "all" ||
        item.restaurant?._id === selectedRestaurant;

      return matchesSearch && matchesRestaurant;
    });
  }, [
    menuItems,
    searchTerm,
    selectedRestaurant,
  ]);

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString("en-NG")}`;
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);

    setFormData({
      restaurant: item.restaurant?._id || "",
      name: item.name,
      description: item.description || "",
      image: item.image || "",
      price: String(item.price),
      category: item.category || "",
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
      preparationTime: String(item.preparationTime),
    });

    setSaveError("");
    setSaveSuccess("");
  };

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }

    setEditingItem(null);
    setSaveError("");
    setSaveSuccess("");
  };

  const handleFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleUpdate = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const response = await api.put(
        `/menu-items/${editingItem._id}`,
        {
          restaurant: formData.restaurant,
          name: formData.name,
          description: formData.description,
          image: formData.image,
          price: Number(formData.price),
          category: formData.category,
          isAvailable: formData.isAvailable,
          isPopular: formData.isPopular,
          preparationTime: Number(
            formData.preparationTime
          ),
        }
      );

      const updatedItem = response.data.data;

      setMenuItems((currentItems) =>
        currentItems.map((item) =>
          item._id === updatedItem._id
            ? {
                ...item,
                ...updatedItem,
                restaurant:
                  item.restaurant,
              }
            : item
        )
      );

      setSaveSuccess(
        "Menu item updated successfully."
      );

      setTimeout(() => {
        setEditingItem(null);
        setSaveSuccess("");
      }, 1200);
    } catch (error) {
      console.error(
        "Failed to update menu item:",
        error
      );

      setSaveError(
        "Unable to update menu item."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (
  event: React.FormEvent
) => {
  event.preventDefault();

  try {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const response = await api.post(
      "/menu-items",
      {
        restaurant: formData.restaurant,
        name: formData.name,
        description: formData.description,
        image: formData.image,
        price: Number(formData.price),
        category: formData.category,
        isAvailable: formData.isAvailable,
        isPopular: formData.isPopular,
        preparationTime: Number(
          formData.preparationTime
        ),
      }
    );

    const newItem = response.data.data;

    const selectedRestaurantData =
      restaurants.find(
        (restaurant) =>
          restaurant._id === formData.restaurant
      );

    setMenuItems((currentItems) => [
      {
        ...newItem,
        restaurant:
          selectedRestaurantData ||
          newItem.restaurant,
      },
      ...currentItems,
    ]);

    setSaveSuccess(
      "Menu item created successfully."
    );

    setTimeout(() => {
      setShowAddModal(false);
      setSaveSuccess("");
    }, 1200);
  } catch (error) {
    console.error(
      "Failed to create menu item:",
      error
    );

    setSaveError(
      "Unable to create menu item."
    );
  } finally {
    setSaving(false);
  }
};

const handleDelete = async (item: MenuItem) => {
  const confirmed = window.confirm(
    `Are you sure you want to remove "${item.name}" from the menu?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setSaving(true);
    setSaveError("");

    await api.delete(`/menu-items/${item._id}`);

    setMenuItems((currentItems) =>
      currentItems.filter(
        (currentItem) =>
          currentItem._id !== item._id
      )
    );
  } catch (error) {
    console.error(
      "Failed to delete menu item:",
      error
    );

    setSaveError(
      "Unable to delete menu item."
    );
  } finally {
    setSaving(false);
  }
};

const handleOpenAdd = () => {
  setFormData({
    restaurant: restaurants[0]?._id || "",
    name: "",
    description: "",
    image: "",
    price: "",
    category: "",
    isAvailable: true,
    isPopular: false,
    preparationTime: "20",
  });

  setSaveError("");
  setSaveSuccess("");
  setShowAddModal(true);
};

const handleCloseAdd = () => {
  if (saving) {
    return;
  }

  setShowAddModal(false);
  setSaveError("");
  setSaveSuccess("");
};

  if (loading) {
    return (
      <div className="admin-menu-page">
        <div className="admin-menu-loading">
          Loading menu...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-menu-page">
      <div className="admin-menu-header">
        <div>
          <h1>Menu</h1>
          <p>
            Manage food items across all restaurants.
          </p>
        </div>

                    <button
            type="button"
            className="admin-menu-add-button"
            onClick={handleOpenAdd}
            >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {error && (
        <div className="admin-menu-error">
          {error}
        </div>
      )}

      <div className="admin-menu-toolbar">
        <div className="admin-menu-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <select
          className="admin-menu-filter"
          value={selectedRestaurant}
          onChange={(event) =>
            setSelectedRestaurant(event.target.value)
          }
        >
          <option value="all">
            All restaurants
          </option>

          {restaurants.map((restaurant) => (
            <option
              key={restaurant._id}
              value={restaurant._id}
            >
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-menu-summary">
        <span>
          Showing{" "}
          <strong>{filteredItems.length}</strong>{" "}
          of <strong>{menuItems.length}</strong>{" "}
          menu items
        </span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="admin-menu-empty">
          <h3>No menu items found</h3>
          <p>
            Try changing your search or restaurant
            filter.
          </p>
        </div>
      ) : (
        <div className="admin-menu-grid">
          {filteredItems.map((item) => (
            <article
              className="admin-menu-card"
              key={item._id}
            >
              <div className="admin-menu-image-wrapper">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="admin-menu-image"
                  />
                ) : (
                  <div className="admin-menu-image-placeholder">
                    No image
                  </div>
                )}

                {item.isPopular && (
                  <span className="admin-menu-popular">
                    <Star size={13} />
                    Popular
                  </span>
                )}

                <span
                  className={`admin-menu-availability ${
                    item.isAvailable
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {item.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              <div className="admin-menu-card-content">
                <div className="admin-menu-card-top">
                  <div>
                    <h3>{item.name}</h3>

                    <p className="admin-menu-restaurant">
                      {item.restaurant?.name ||
                        "Unknown restaurant"}
                    </p>
                  </div>

                  <strong className="admin-menu-price">
                    {formatPrice(item.price)}
                  </strong>
                </div>

                {item.description && (
                  <p className="admin-menu-description">
                    {item.description}
                  </p>
                )}

                <div className="admin-menu-meta">
                  {item.category && (
                    <span>
                      {item.category}
                    </span>
                  )}

                  <span>
                    <Clock size={14} />
                    {item.preparationTime} min
                  </span>
                </div>

                <div className="admin-menu-actions">
                  <button
                    type="button"
                    className="admin-menu-edit-button"
                    onClick={() =>
                      handleEdit(item)
                    }
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                            <button
            type="button"
            className="admin-menu-delete-button"
            onClick={() => handleDelete(item)}
            disabled={saving}
            >
            <Trash2 size={17} />
            Delete
            </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingItem && (
        <div
          className="admin-menu-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseEdit();
            }
          }}
        >
          <div className="admin-menu-modal">
            <div className="admin-menu-modal-header">
              <div>
                <h2>Edit Menu Item</h2>
                <p>
                  Update the information for this
                  food item.
                </p>
              </div>

              <button
                type="button"
                className="admin-menu-modal-close"
                onClick={handleCloseEdit}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-menu-form"
              onSubmit={handleUpdate}
            >
              <div className="admin-menu-form-group">
                <label htmlFor="restaurant">
                  Restaurant
                </label>

                <select
                  id="restaurant"
                  name="restaurant"
                  value={formData.restaurant}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select restaurant
                  </option>

                  {restaurants.map((restaurant) => (
                    <option
                      key={restaurant._id}
                      value={restaurant._id}
                    >
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-menu-form-row">
                <div className="admin-menu-form-group">
                  <label htmlFor="name">
                    Food name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="admin-menu-form-group">
                  <label htmlFor="category">
                    Category
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="admin-menu-form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>

              <div className="admin-menu-form-group">
                <label htmlFor="image">
                  Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleFormChange}
                />
              </div>

              <div className="admin-menu-form-row">
                <div className="admin-menu-form-group">
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
                    required
                  />
                </div>

                <div className="admin-menu-form-group">
                  <label htmlFor="preparationTime">
                    Preparation time (minutes)
                  </label>

                  <input
                    id="preparationTime"
                    name="preparationTime"
                    type="number"
                    min="1"
                    value={
                      formData.preparationTime
                    }
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-menu-toggle-row">
                <label className="admin-menu-checkbox">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={
                      formData.isAvailable
                    }
                    onChange={handleFormChange}
                  />

                  <span>
                    Available for customers
                  </span>
                </label>

                <label className="admin-menu-checkbox">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={
                      formData.isPopular
                    }
                    onChange={handleFormChange}
                  />

                  <span>
                    Mark as popular
                  </span>
                </label>
              </div>

              {saveError && (
                <div className="admin-menu-form-error">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="admin-menu-form-success">
                  {saveSuccess}
                </div>
              )}

              <div className="admin-menu-modal-actions">
                <button
                  type="button"
                  className="admin-menu-cancel-button"
                  onClick={handleCloseEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-menu-save-button"
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

      {showAddModal && (
  <div
    className="admin-menu-modal-overlay"
    onMouseDown={(event) => {
      if (
        event.target === event.currentTarget
      ) {
        handleCloseAdd();
      }
    }}
  >
    <div className="admin-menu-modal">
      <div className="admin-menu-modal-header">
        <div>
          <h2>Add Menu Item</h2>
          <p>
            Add a new food item to a restaurant.
          </p>
        </div>

        <button
          type="button"
          className="admin-menu-modal-close"
          onClick={handleCloseAdd}
          disabled={saving}
        >
          <X size={20} />
        </button>
      </div>

      <form
        className="admin-menu-form"
        onSubmit={handleAdd}
      >
        <div className="admin-menu-form-group">
          <label htmlFor="add-restaurant">
            Restaurant
          </label>

          <select
            id="add-restaurant"
            name="restaurant"
            value={formData.restaurant}
            onChange={handleFormChange}
            required
          >
            <option value="">
              Select restaurant
            </option>

            {restaurants.map((restaurant) => (
              <option
                key={restaurant._id}
                value={restaurant._id}
              >
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-menu-form-row">
          <div className="admin-menu-form-group">
            <label htmlFor="add-name">
              Food name
            </label>

            <input
              id="add-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Jollof Rice"
              required
            />
          </div>

          <div className="admin-menu-form-group">
            <label htmlFor="add-category">
              Category
            </label>

            <input
              id="add-category"
              name="category"
              type="text"
              value={formData.category}
              onChange={handleFormChange}
              placeholder="e.g. Rice"
            />
          </div>
        </div>

        <div className="admin-menu-form-group">
          <label htmlFor="add-description">
            Description
          </label>

          <textarea
            id="add-description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Describe the food item..."
          />
        </div>

        <div className="admin-menu-form-group">
          <label htmlFor="add-image">
            Image URL
          </label>

          <input
            id="add-image"
            name="image"
            type="url"
            value={formData.image}
            onChange={handleFormChange}
            placeholder="https://..."
          />
        </div>

        <div className="admin-menu-form-row">
          <div className="admin-menu-form-group">
            <label htmlFor="add-price">
              Price (₦)
            </label>

            <input
              id="add-price"
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="4500"
              required
            />
          </div>

          <div className="admin-menu-form-group">
            <label htmlFor="add-preparationTime">
              Preparation time (minutes)
            </label>

            <input
              id="add-preparationTime"
              name="preparationTime"
              type="number"
              min="1"
              value={
                formData.preparationTime
              }
              onChange={handleFormChange}
              required
            />
          </div>
        </div>

        <div className="admin-menu-toggle-row">
          <label className="admin-menu-checkbox">
            <input
              type="checkbox"
              name="isAvailable"
              checked={
                formData.isAvailable
              }
              onChange={handleFormChange}
            />

            <span>
              Available for customers
            </span>
          </label>

          <label className="admin-menu-checkbox">
            <input
              type="checkbox"
              name="isPopular"
              checked={
                formData.isPopular
              }
              onChange={handleFormChange}
            />

            <span>
              Mark as popular
            </span>
          </label>
        </div>

        {saveError && (
          <div className="admin-menu-form-error">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="admin-menu-form-success">
            {saveSuccess}
          </div>
        )}

        <div className="admin-menu-modal-actions">
          <button
            type="button"
            className="admin-menu-cancel-button"
            onClick={handleCloseAdd}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-menu-save-button"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Menu Item"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminMenu;