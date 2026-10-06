import { useState } from "react";
import {
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import "./SupportWidget.css";

function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmailSupport = (subject = "ChopGo Support Request") => {
    window.location.href = `mailto:halatworld@gmail.com?subject=${encodeURIComponent(
      subject
    )}`;
  };

  const handleCallSupport = () => {
    window.location.href = "tel:+2348166019129";
  };

  return (
    <div className="support-widget">
      {isOpen && (
        <div className="support-widget-panel">
          <div className="support-widget-header">
            <div className="support-widget-title">
              <div className="support-widget-title-icon">
                <MessageCircle size={18} />
              </div>

              <div>
                <strong>ChopGo Support</strong>
                <span>We're here to help</span>
              </div>
            </div>

            <button
              type="button"
              className="support-widget-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close support"
            >
              <X size={18} />
            </button>
          </div>

          <div className="support-widget-body">
            <p className="support-widget-question">
              What can we help you with?
            </p>

            <button
              type="button"
              className="support-widget-option"
              onClick={() =>
                handleEmailSupport("ChopGo Order Support")
              }
            >
              <span className="support-widget-option-left">
                <span className="support-widget-option-icon">
                  <ShoppingBag size={17} />
                </span>

                <span>
                  <strong>Order issue</strong>
                  <small>Problems with an order</small>
                </span>
              </span>

              <ChevronRight size={17} />
            </button>

            <button
              type="button"
              className="support-widget-option"
              onClick={() =>
                handleEmailSupport("ChopGo Payment Support")
              }
            >
              <span className="support-widget-option-left">
                <span className="support-widget-option-icon">
                  <MessageCircle size={17} />
                </span>

                <span>
                  <strong>Payment issue</strong>
                  <small>Problems with your payment</small>
                </span>
              </span>

              <ChevronRight size={17} />
            </button>

            <button
              type="button"
              className="support-widget-option"
              onClick={() =>
                handleEmailSupport("ChopGo Delivery Support")
              }
            >
              <span className="support-widget-option-left">
                <span className="support-widget-option-icon">
                  <Truck size={17} />
                </span>

                <span>
                  <strong>Delivery issue</strong>
                  <small>Problems with your delivery</small>
                </span>
              </span>

              <ChevronRight size={17} />
            </button>

            <div className="support-widget-divider" />

            <button
              type="button"
              className="support-widget-contact email"
              onClick={() => handleEmailSupport()}
            >
              <Mail size={17} />
              <span>Email support</span>
            </button>

            <button
              type="button"
              className="support-widget-contact call"
              onClick={handleCallSupport}
            >
              <Phone size={17} />
              <span>Call support</span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={
          isOpen
            ? "support-widget-button open"
            : "support-widget-button"
        }
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close support" : "Open support"}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <MessageCircle size={22} />
        )}
      </button>
    </div>
  );
}

export default SupportWidget;