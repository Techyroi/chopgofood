import { useEffect, useMemo, useState } from "react";
import { Eye, Search, Users } from "lucide-react";
import api from "../../services/api";
import "./AdminRiders.css";

interface Rider {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  emailVerified?: boolean;
  createdAt: string;
}

const AdminRiders = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  useEffect(() => {
    const loadRiders = async () => {
      try {
        const response = await api.get("/admin/riders");

        setRiders(response.data.data || []);
      } catch (error) {
        console.error("Failed to load riders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRiders();
  }, []);

  const filteredRiders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return riders;
    }

    return riders.filter((rider) => {
      return (
        rider.fullName?.toLowerCase().includes(query) ||
        rider.email?.toLowerCase().includes(query) ||
        rider.phone?.toLowerCase().includes(query) ||
        rider.address?.toLowerCase().includes(query)
      );
    });
  }, [riders, search]);

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-riders-page">
      <div className="admin-riders-header">
        <div>
          <h1>Riders</h1>
          <p>Manage delivery riders registered on ChopGoFood.</p>
        </div>

        <div className="admin-riders-count">
          <Users size={18} />
          <span>{riders.length} Riders</span>
        </div>
      </div>

      <div className="admin-riders-toolbar">
        <div className="admin-riders-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search riders..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="admin-riders-card">
        {loading ? (
          <div className="admin-riders-state">
            <p>Loading riders...</p>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="admin-riders-state">
            <div className="admin-riders-empty-icon">
              <Users size={28} />
            </div>

            <h3>
              {search ? "No riders found" : "No riders yet"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Riders will appear here once rider accounts are created."}
            </p>
          </div>
        ) : (
          <div className="admin-riders-table-wrapper">
            <table className="admin-riders-table">
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Email Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredRiders.map((rider) => (
                  <tr key={rider._id}>
                    <td>
                      <div className="admin-rider-person">
                        {rider.profileImage ? (
                          <img
                            src={rider.profileImage}
                            alt={rider.fullName}
                            className="admin-rider-avatar"
                          />
                        ) : (
                          <div className="admin-rider-avatar admin-rider-avatar-placeholder">
                            {rider.fullName
                              ?.charAt(0)
                              .toUpperCase() || "R"}
                          </div>
                        )}

                        <div>
                          <strong>{rider.fullName || "Unknown rider"}</strong>
                          <span>{rider.email || "No email"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-rider-contact">
                        <span>{rider.phone || "No phone"}</span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-rider-address">
                        {rider.address || "No address"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-rider-status ${
                          rider.emailVerified
                            ? "verified"
                            : "unverified"
                        }`}
                      >
                        {rider.emailVerified
                          ? "Verified"
                          : "Unverified"}
                      </span>
                    </td>

                    <td>{formatDate(rider.createdAt)}</td>

                    <td>
                      <button
                        type="button"
                        className="admin-riders-view-button"
                        title="View rider"
                        onClick={() => setSelectedRider(rider)}
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRider && (
        <div
          className="admin-rider-modal-overlay"
          onClick={() => setSelectedRider(null)}
        >
          <div
            className="admin-rider-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-rider-modal-header">
              <div>
                <h2>Rider Details</h2>
                <p>Rider account information</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRider(null)}
                className="admin-rider-modal-close"
              >
                ×
              </button>
            </div>

            <div className="admin-rider-modal-profile">
              {selectedRider.profileImage ? (
                <img
                  src={selectedRider.profileImage}
                  alt={selectedRider.fullName}
                  className="admin-rider-modal-avatar"
                />
              ) : (
                <div className="admin-rider-modal-avatar admin-rider-avatar-placeholder">
                  {selectedRider.fullName
                    ?.charAt(0)
                    .toUpperCase() || "R"}
                </div>
              )}

              <div>
                <h3>{selectedRider.fullName || "Unknown rider"}</h3>
                <p>{selectedRider.email || "No email"}</p>
              </div>
            </div>

            <div className="admin-rider-details">
              <div>
                <span>Phone</span>
                <strong>{selectedRider.phone || "No phone"}</strong>
              </div>

              <div>
                <span>Address</span>
                <strong>
                  {selectedRider.address || "No address"}
                </strong>
              </div>

              <div>
                <span>Email Status</span>
                <strong>
                  {selectedRider.emailVerified
                    ? "Verified"
                    : "Unverified"}
                </strong>
              </div>

              <div>
                <span>Joined</span>
                <strong>
                  {formatDate(selectedRider.createdAt)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiders;