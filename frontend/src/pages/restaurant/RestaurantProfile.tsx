import { useEffect, useState } from "react";
import api from "../../services/api";



const RestaurantProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    address: "",
    phone: "",
    logo: "",
    coverImage: "",
    deliveryFee: "",
    estimatedDeliveryTimeMin: "",
    estimatedDeliveryTimeMax: "",
    isOpen: true,
  });

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setFormError("");

        const response = await api.get("/restaurant-dashboard/profile");

        const data = response.data.data;

        setFormData({
          name: data.name || "",
          description: data.description || "",
          cuisine: data.cuisine || "",
          address: data.address || "",
          phone: data.phone || "",
          logo: data.logo || "",
          coverImage: data.coverImage || "",
          deliveryFee:
            data.deliveryFee !== undefined
              ? String(data.deliveryFee)
              : "",
          estimatedDeliveryTimeMin:
            data.estimatedDeliveryTimeMin !== undefined
              ? String(data.estimatedDeliveryTimeMin)
              : "",
          estimatedDeliveryTimeMax:
            data.estimatedDeliveryTimeMax !== undefined
              ? String(data.estimatedDeliveryTimeMax)
              : "",
          isOpen:
            data.isOpen !== undefined
              ? data.isOpen
              : true,
        });
      } catch (error) {
        console.error("Failed to load restaurant profile:", error);

        setFormError(
          "Failed to load your restaurant profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
  };

  const handleToggleOpen = () => {
    setFormData((previous) => ({
      ...previous,
      isOpen: !previous.isOpen,
    }));

    setSuccessMessage("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
await api.put(
        "/restaurant-dashboard/profile",
        {
            name: formData.name.trim(),
            description: formData.description.trim(),
            cuisine: formData.cuisine.trim(),
            address: formData.address.trim(),
            phone: formData.phone.trim(),
            logo: formData.logo.trim(),
            coverImage: formData.coverImage.trim(),
            deliveryFee: Number(formData.deliveryFee),
            estimatedDeliveryTimeMin: Number(
            formData.estimatedDeliveryTimeMin
            ),
            estimatedDeliveryTimeMax: Number(
            formData.estimatedDeliveryTimeMax
            ),
            isOpen: formData.isOpen,
        }
        );

      setSuccessMessage(
        "Restaurant profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update restaurant profile:",
        error
      );

      setFormError(
        "Failed to update your restaurant profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-profile-page">
        <div className="restaurant-profile-loading">
          Loading restaurant profile...
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-profile-page">
      <div className="restaurant-profile-header">
        <div>
          <span className="restaurant-profile-eyebrow">
            Restaurant Settings
          </span>

          <h1>Restaurant Profile</h1>

          <p>
            Manage your restaurant information and
            operating details.
          </p>
        </div>

        <div
          className={`restaurant-profile-status ${
            formData.isOpen ? "open" : "closed"
          }`}
        >
          <span className="restaurant-profile-status-dot" />

          {formData.isOpen
            ? "Currently Open"
            : "Currently Closed"}
        </div>
      </div>

      {formError && (
        <div className="restaurant-profile-message error">
          {formError}
        </div>
      )}

      {successMessage && (
        <div className="restaurant-profile-message success">
          {successMessage}
        </div>
      )}

      <form
        className="restaurant-profile-form"
        onSubmit={handleSubmit}
      >
        <div className="restaurant-profile-card">
          <div className="restaurant-profile-card-header">
            <div>
              <h2>Basic Information</h2>

              <p>
                Information customers see about your
                restaurant.
              </p>
            </div>
          </div>

          <div className="restaurant-profile-grid">
            <div className="restaurant-profile-field">
              <label htmlFor="name">
                Restaurant Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="restaurant-profile-field">
              <label htmlFor="cuisine">
                Cuisine
              </label>

              <input
                id="cuisine"
                name="cuisine"
                type="text"
                value={formData.cuisine}
                onChange={handleChange}
                placeholder="e.g. Nigerian, Fast Food"
              />
            </div>

            <div className="restaurant-profile-field full">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell customers about your restaurant..."
              />
            </div>

            <div className="restaurant-profile-field full">
              <label htmlFor="address">
                Restaurant Address
              </label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="restaurant-profile-field">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="restaurant-profile-card">
          <div className="restaurant-profile-card-header">
            <div>
              <h2>Images</h2>

              <p>
                Update the images used for your restaurant.
              </p>
            </div>
          </div>

          <div className="restaurant-profile-grid">
            <div className="restaurant-profile-field">
              <label htmlFor="logo">
                Logo URL
              </label>

              <input
                id="logo"
                name="logo"
                type="url"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="restaurant-profile-field">
              <label htmlFor="coverImage">
                Cover Image URL
              </label>

              <input
                id="coverImage"
                name="coverImage"
                type="url"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="restaurant-profile-card">
          <div className="restaurant-profile-card-header">
            <div>
              <h2>Operating Information</h2>

              <p>
                Manage delivery settings and restaurant
                availability.
              </p>
            </div>
          </div>

          <div className="restaurant-profile-grid">
            <div className="restaurant-profile-field">
              <label htmlFor="deliveryFee">
                Delivery Fee
              </label>

              <input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                min="0"
                value={formData.deliveryFee}
                onChange={handleChange}
              />
            </div>

            <div className="restaurant-profile-field">
              <label htmlFor="estimatedDeliveryTimeMin">
                Minimum Delivery Time (minutes)
              </label>

              <input
                id="estimatedDeliveryTimeMin"
                name="estimatedDeliveryTimeMin"
                type="number"
                min="1"
                value={
                  formData.estimatedDeliveryTimeMin
                }
                onChange={handleChange}
              />
            </div>

            <div className="restaurant-profile-field">
              <label htmlFor="estimatedDeliveryTimeMax">
                Maximum Delivery Time (minutes)
              </label>

              <input
                id="estimatedDeliveryTimeMax"
                name="estimatedDeliveryTimeMax"
                type="number"
                min="1"
                value={
                  formData.estimatedDeliveryTimeMax
                }
                onChange={handleChange}
              />
            </div>

            <div className="restaurant-profile-toggle-field">
              <div>
                <strong>Restaurant Availability</strong>

                <p>
                  Allow customers to see your restaurant
                  as open.
                </p>
              </div>

              <button
                type="button"
                className={`restaurant-profile-toggle ${
                  formData.isOpen ? "active" : ""
                }`}
                onClick={handleToggleOpen}
                aria-pressed={formData.isOpen}
              >
                <span />
              </button>
            </div>
          </div>
        </div>

        <div className="restaurant-profile-actions">
          <button
            type="submit"
            className="restaurant-profile-save-button"
            disabled={saving}
          >
            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantProfile;