import {
  Clock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import "./AdminSupport.css";

const AdminSupport = () => {
  return (
    <div className="admin-support-page">
      <div className="admin-support-header">
        <div>
          <h1>Support</h1>
          <p>
            Manage ChopGoFood customer support and contact channels.
          </p>
        </div>
      </div>

      <div className="admin-support-grid">
        <div className="admin-support-card admin-support-main-card">
          <div className="admin-support-icon">
            <MessageCircle size={24} />
          </div>

          <h2>Customer Support</h2>

          <p>
            Customers can contact the ChopGoFood support team through
            the official support channels below.
          </p>

          <div className="admin-support-contact-list">
            <a
              href="mailto:halatworld@gmail.com"
              className="admin-support-contact"
            >
              <div className="admin-support-contact-icon">
                <Mail size={19} />
              </div>

              <div>
                <span>Email</span>
                <strong>halatworld@gmail.com</strong>
              </div>
            </a>

            <a
              href="tel:+2348166019129"
              className="admin-support-contact"
            >
              <div className="admin-support-contact-icon">
                <Phone size={19} />
              </div>

              <div>
                <span>Phone</span>
                <strong>+2348166019129</strong>
              </div>
            </a>
          </div>
        </div>

        <div className="admin-support-card">
          <div className="admin-support-card-heading">
            <div className="admin-support-small-icon">
              <Clock size={20} />
            </div>

            <div>
              <h3>Support Availability</h3>
              <p>Customer support information</p>
            </div>
          </div>

          <div className="admin-support-info">
            <span>Status</span>

            <div className="admin-support-status">
              <span className="admin-support-status-dot"></span>
              Support channels active
            </div>
          </div>

          <div className="admin-support-info">
            <span>Support email</span>
            <strong>halatworld@gmail.com</strong>
          </div>

          <div className="admin-support-info">
            <span>Support phone</span>
            <strong>+2348166019129</strong>
          </div>
        </div>
      </div>

      <div className="admin-support-card admin-support-notice">
        <div className="admin-support-notice-icon">
          <ShieldCheck size={21} />
        </div>

        <div>
          <h3>Support tickets are not enabled yet</h3>

          <p>
            ChopGoFood currently handles customer support through the
            official email and phone channels. A ticket-management
            system can be added later if the business requires
            in-app support conversations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;