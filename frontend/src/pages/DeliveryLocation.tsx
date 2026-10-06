import { useState } from "react";
import { MapPin, Navigation, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DeliveryLocation() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [error, setError] = useState("");

  const getCurrentLocation = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Location is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        setLoading(false);

        console.log("Customer latitude:", latitude);
        console.log("Customer longitude:", longitude);
      },
      (error) => {
        console.error("Location error:", error);

        setError(
          "Unable to get your location. Please allow location access and try again."
        );

        setLoading(false);
      }
    );
  };

  return (
    <main className="delivery-location-page">

      {/* Header */}

      <header className="delivery-location-header">

        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>

        <h1>
          Delivery Location
        </h1>

        <div />

      </header>


      {/* Content */}

      <section className="delivery-location-content">

        <div className="delivery-location-icon">
          <MapPin size={40} />
        </div>

        <h2>
          Where should we deliver your food?
        </h2>

        <p>
          Use your current location so we can determine your delivery
          location.
        </p>


        {/* Current Location Button */}

        <button
          type="button"
          className="current-location-button"
          onClick={getCurrentLocation}
          disabled={loading}
        >

          <Navigation size={20} />

          {loading
            ? "Getting your location..."
            : "Use my current location"}

        </button>


        {/* Error */}

        {error && (
          <p className="delivery-location-error">
            {error}
          </p>
        )}


        {/* Coordinates */}

        {location && (
          <div className="location-result">

            <h3>
              Location detected
            </h3>

            <p>
              Latitude: {location.latitude}
            </p>

            <p>
              Longitude: {location.longitude}
            </p>

          </div>
        )}

      </section>

    </main>
  );
}

export default DeliveryLocation;