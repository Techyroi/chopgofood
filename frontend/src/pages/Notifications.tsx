import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function Notifications() {
  const navigate = useNavigate();

  return (
    <main className="notifications-page">
      <header className="page-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>Notifications</h1>

        <div />
      </header>

      <section className="notifications-content">
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Bell size={36} />
          </div>

          <h2>No notifications yet</h2>

          <p>
            We'll let you know about your orders,
            promotions, and other updates here.
          </p>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}

export default Notifications;