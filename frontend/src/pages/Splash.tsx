import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/home", { replace: true });
      } else {
        navigate("/signin", { replace: true });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <main className="splash-page">
      <div className="splash-scene">

        {/* Main visual background */}
        <img
          src="/splash/splash-bg.png"
          alt=""
          className="splash-background-image"
        />

        {/* Soft overlay */}
        <div className="splash-overlay" />

        {/* Brand */}
        <div className="splash-brand">
          <img
            src="/logo/chopgo-logo-vertical.png"
            alt="ChopGo"
            className="splash-brand-logo"
          />
        </div>

        {/* Delivery scooter */}
        <img
          src="/splash/delivery-scooter.png"
          alt=""
          className="splash-scooter"
        />

        {/* Location pin */}
        <img
          src="/splash/location-pin.png"
          alt=""
          className="splash-location-pin"
        />

        {/* Bottom loading section */}
        <div className="splash-bottom">
          <div className="splash-loader">
            <div className="splash-loader-track">
              <div className="splash-loader-progress" />
            </div>
          </div>

          <p>GOOD FOOD. DELIVERED.</p>
        </div>
      </div>
    </main>
  );
}

export default Splash;