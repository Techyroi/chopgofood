import {
  MapPin,
  Bell,
} from "lucide-react";



function RestaurantHeader() {
  return (
    <header className="restaurant-header">
      <div className="restaurant-location">
        <span className="location-icon"><MapPin size={20} /></span>

        <div>
          <span className="location-label">Deliver to</span>
          <strong>Current Location</strong>
        </div>
      </div>

      <div className="restaurant-header-brand">
        <span>ChopGo</span>
      </div>

      <button
        type="button"
        className="notification-button"
        aria-label="Notifications"
      >
        <Bell size={21} />
      </button>
    </header>
  );
}

export default RestaurantHeader;