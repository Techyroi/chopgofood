import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import BottomNavigation from "../components/restaurant/layout/BottomNavigation";

function Support() {
  const navigate = useNavigate();

  const handleEmailSupport = () => {
    window.location.href =
      "mailto:halatworld@gmail.com?subject=ChopGo%20Support%20Request";
  };

  const handleCallSupport = () => {
    window.location.href = "tel:+2348166019129";
  };

  return (
    <main className="support-page">
      <header className="page-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h1>Help & Support</h1>

        <div />
      </header>

      <section className="support-content">
        <div className="support-intro">
          <div className="support-intro-icon">
            <ShoppingBag size={28} />
          </div>

          <div>
            <h2>How can we help?</h2>

            <p>
              Need help with your order, payment, or delivery?
              Our support team is here to help.
            </p>
          </div>
        </div>

        <section className="support-section">
          <h3>Contact ChopGo Support</h3>

          <button
            type="button"
            className="support-contact-card"
            onClick={handleEmailSupport}
          >
            <span className="support-contact-left">
              <span className="support-contact-icon">
                <Mail size={20} />
              </span>

              <span>
                <strong>Email Support</strong>
                <small>halatworld@gmail.com</small>
              </span>
            </span>

            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            className="support-contact-card"
            onClick={handleCallSupport}
          >
            <span className="support-contact-left">
              <span className="support-contact-icon">
                <Phone size={20} />
              </span>

              <span>
                <strong>Call Support</strong>
                <small>+234 816 601 9129</small>
              </span>
            </span>

            <ChevronRight size={20} />
          </button>
        </section>

        <section className="support-section">
          <h3>What can we help with?</h3>

          <div className="support-info-card">
            <strong>Order issues</strong>
            <p>
              Contact us if you have a problem with an order,
              including delays or missing items.
            </p>
          </div>

          <div className="support-info-card">
            <strong>Payment issues</strong>
            <p>
              If you experience a payment problem, contact our
              support team for assistance.
            </p>
          </div>

          <div className="support-info-card">
            <strong>Delivery issues</strong>
            <p>
              Contact us if you need help with your delivery or
              have a problem with your delivery location.
            </p>
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}

export default Support;