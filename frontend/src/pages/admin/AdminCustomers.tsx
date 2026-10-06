import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  X,
} from "lucide-react";

import api from "../../services/api";
import "./AdminCustomers.css";

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  emailVerified?: boolean;
  createdAt: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/admin/customers"
        );

        setCustomers(response.data.data || []);
      } catch (error) {
        console.error(
          "Failed to load customers:",
          error
        );

        setError(
          "Unable to load customers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.fullName,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(search)
        )
    );
  }, [customers, searchTerm]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="admin-customers-page">
        <div className="admin-customers-loading">
          Loading customers...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      <div className="admin-customers-header">
        <div>
          <span className="admin-customers-eyebrow">
            Customer Management
          </span>

          <h1>Customers</h1>

          <p>
            View and manage registered ChopGoFood
            customers.
          </p>
        </div>

        <div className="admin-customers-count">
          <Users size={20} />
          <span>
            {customers.length} customers
          </span>
        </div>
      </div>

      <div className="admin-customers-toolbar">
        <div className="admin-customers-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <span className="admin-customers-results">
          {filteredCustomers.length}{" "}
          {filteredCustomers.length === 1
            ? "customer"
            : "customers"}
        </span>
      </div>

      {error && (
        <div className="admin-customers-error">
          {error}
        </div>
      )}

      {!error &&
        filteredCustomers.length === 0 && (
          <div className="admin-customers-empty">
            <Users size={36} />

            <h3>No customers found</h3>

            <p>
              Try adjusting your search.
            </p>
          </div>
        )}

      {!error &&
        filteredCustomers.length > 0 && (
          <div className="admin-customers-table-card">
            <div className="admin-customers-table-wrapper">
              <table className="admin-customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Email Status</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (customer) => (
                      <tr key={customer._id}>
                        <td>
                          <div className="admin-customer-name-cell">
                            {customer.profileImage ? (
                              <img
                                src={
                                  customer.profileImage
                                }
                                alt={
                                  customer.fullName
                                }
                              />
                            ) : (
                              <div className="admin-customer-avatar">
                                {customer.fullName
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div>
                              <strong>
                                {
                                  customer.fullName
                                }
                              </strong>

                              <span>
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-customer-contact">
                            <span>
                              <Mail
                                size={14}
                              />
                              {customer.email}
                            </span>

                            <span>
                              <Phone
                                size={14}
                              />
                              {customer.phone ||
                                "No phone"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-customer-address">
                            <MapPin
                              size={15}
                            />

                            <span>
                              {customer.address ||
                                "No address"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-customer-status ${
                              customer.emailVerified
                                ? "verified"
                                : "unverified"
                            }`}
                          >
                            {customer.emailVerified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-customer-date">
                            <CalendarDays
                              size={15}
                            />

                            {formatDate(
                              customer.createdAt
                            )}
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-customer-view-button"
                            onClick={() =>
                              setSelectedCustomer(
                                customer
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {selectedCustomer && (
        <div
          className="admin-customer-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="admin-customer-modal">
            <div className="admin-customer-modal-header">
              <div>
                <span>
                  Customer Details
                </span>

                <h2>
                  {selectedCustomer.fullName}
                </h2>
              </div>

              <button
                type="button"
                className="admin-customer-modal-close"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-customer-modal-body">
              <div className="admin-customer-detail-avatar">
                {selectedCustomer.profileImage ? (
                  <img
                    src={
                      selectedCustomer.profileImage
                    }
                    alt={
                      selectedCustomer.fullName
                    }
                  />
                ) : (
                  selectedCustomer.fullName
                    ?.charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="admin-customer-detail-grid">
                <div>
                  <span>Name</span>
                  <strong>
                    {selectedCustomer.fullName}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {selectedCustomer.email}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {selectedCustomer.phone ||
                      "No phone"}
                  </strong>
                </div>

                <div>
                  <span>Email status</span>
                  <strong>
                    {selectedCustomer.emailVerified
                      ? "Verified"
                      : "Unverified"}
                  </strong>
                </div>

                <div className="full-width">
                  <span>Address</span>
                  <strong>
                    {selectedCustomer.address ||
                      "No address"}
                  </strong>
                </div>

                <div>
                  <span>Joined</span>
                  <strong>
                    {formatDate(
                      selectedCustomer.createdAt
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;