import { useEffect, useState } from "react";

import {

  Bike,

  Clock3,

  MapPin,

  Phone,

  Package,

  CheckCircle2,

  LoaderCircle,

  Navigation,

} from "lucide-react";



import api from "../../services/api";

import "./RiderDashboard.css";



interface OrderItem {

  menuItem: string;

  name: string;

  image: string;

  price: number;

  quantity: number;

  subtotal: number;

}



interface Restaurant {

  _id: string;

  name: string;

  logo?: string;

  coverImage?: string;

  address?: string;

  phone?: string;

}



interface Customer {

  _id: string;

  fullName: string;

  email?: string;

  phone?: string;

}



interface DeliveryLocation {

  latitude: number;

  longitude: number;

}



interface Delivery {

  _id: string;

  user: Customer;

  restaurant: Restaurant;

  items: OrderItem[];

  deliveryAddress: string;

  phone: string;

  deliveryLocation: DeliveryLocation;

  deliveryDistanceKm: number;

  subtotal: number;

  deliveryFee: number;

  paymentMethod: string;

  paymentStatus: string;

  orderStatus: string;

  createdAt: string;

}



const RiderDashboard = () => {

    const [deliveries, setDeliveries] = useState<Delivery[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);



  useEffect(() => {

    const loadDeliveries = async () => {

      try {

        setError("");



        const response = await api.get("/rider-dashboard/deliveries");



        setDeliveries(response.data.data || []);

      } catch (error) {

        console.error("Failed to load rider deliveries:", error);



        setError("We could not load your deliveries.");

      } finally {

        setLoading(false);

      }

    };



    loadDeliveries();

  }, []);



  const activeDeliveries = deliveries.filter(

    (delivery) =>

      delivery.orderStatus === "ready" ||

      delivery.orderStatus === "out_for_delivery"

  );



  const completedDeliveries = deliveries.filter(

    (delivery) => delivery.orderStatus === "delivered"

  );



  const formatCurrency = (amount: number) => {

    return `₦${amount.toLocaleString("en-NG")}`;

  };



  const formatDate = (date: string) => {

    return new Date(date).toLocaleDateString("en-NG", {

      day: "numeric",

      month: "short",

      year: "numeric",

    });

  };



  const formatStatus = (status: string) => {

    return status.replaceAll("_", " ");

  };



  const handleNavigateToCustomer = (delivery: Delivery) => {

  const { latitude, longitude } = delivery.deliveryLocation;



  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;



  window.open(mapsUrl, "_blank", "noopener,noreferrer");

};





  const handleDeliveryStatus = async (

  deliveryId: string,

  status: "out_for_delivery" | "delivered"

) => {

  try {

    const response = await api.put(

      `/rider-dashboard/deliveries/${deliveryId}/status`,

      {

        status,

      }

    );



    setDeliveries((currentDeliveries) =>

      currentDeliveries.map((delivery) =>

        delivery._id === deliveryId

          ? {

              ...delivery,

              orderStatus: response.data.data.orderStatus,

            }

          : delivery

      )

    );

  } catch (error: any) {

    console.error(

      "Failed to update delivery status:",

      error

    );



    alert(

      error.response?.data?.message ||

        "Failed to update delivery status."

    );

  }

};



  if (loading) {

    return (

      <div className="rider-dashboard">

        <div className="rider-dashboard-loading">

          <LoaderCircle className="rider-loading-spinner" size={28} />

          <p>Loading your deliveries...</p>

        </div>


      </div>

    );

  }


  return (

    <div className="rider-dashboard">

      <header className="rider-dashboard-header">

        <div>

          <span className="rider-dashboard-eyebrow">

            Rider Dashboard

          </span>



          <h1>Deliveries</h1>



          <p>

            Manage your assigned deliveries and keep customers updated.

          </p>

        </div>



        <div className="rider-header-icon">

          <Bike size={24} />

        </div>

      </header>



      {error && (

        <div className="rider-dashboard-error">

          {error}

        </div>

      )}



      <section className="rider-stats">

        <div className="rider-stat-card">

          <div className="rider-stat-icon">

            <Package size={20} />

          </div>



          <div>

            <span>Assigned</span>

            <strong>{activeDeliveries.length}</strong>

          </div>

        </div>



        <div className="rider-stat-card">

          <div className="rider-stat-icon">

            <Navigation size={20} />

          </div>



          <div>

            <span>Active</span>

            <strong>

              {

                deliveries.filter(

                  (delivery) =>

                    delivery.orderStatus === "out_for_delivery"

                ).length

              }

            </strong>

          </div>

        </div>



        <div className="rider-stat-card">

          <div className="rider-stat-icon">

            <CheckCircle2 size={20} />

          </div>



          <div>

            <span>Delivered</span>

            <strong>{completedDeliveries.length}</strong>

          </div>

        </div>

      </section>



      <section className="rider-deliveries-section">

        <div className="rider-section-heading">

          <div>

            <h2>My Deliveries</h2>

            <p>Orders currently assigned to you.</p>

          </div>

        </div>



        {deliveries.length === 0 ? (

          <div className="rider-empty-state">

            <div className="rider-empty-icon">

              <Bike size={30} />

            </div>



            <h3>No deliveries yet</h3>



            <p>

              Assigned deliveries will appear here when the admin

              assigns an order to you.

            </p>

          </div>

        ) : (

          <div className="rider-delivery-list">

            {deliveries.map((delivery) => (

              <article

                className="rider-delivery-card"

                key={delivery._id}

              >

                <div className="rider-delivery-card-header">

                  <div>

                    <span className="rider-order-label">

                      Order #{delivery._id.slice(-6).toUpperCase()}

                    </span>



                    <h3>{delivery.restaurant.name}</h3>

                  </div>



                  <span

                    className={`rider-delivery-status ${delivery.orderStatus}`}

                  >

                    {formatStatus(delivery.orderStatus)}

                  </span>

                </div>



                <div className="rider-delivery-details">

                  <div className="rider-delivery-detail">

                    <MapPin size={18} />



                    <div>

                      <span>Delivery address</span>

                      <strong>{delivery.deliveryAddress}</strong>

                    </div>

                  </div>



                  <div className="rider-delivery-detail">

                    <Phone size={18} />



                    <div>

                      <span>Customer</span>

                      <strong>{delivery.user.fullName}</strong>

                      <small>{delivery.phone}</small>

                    </div>

                  </div>



                  <div className="rider-delivery-detail">

                    <Navigation size={18} />



                    <div>

                      <span>Distance</span>

                      <strong>

                        {delivery.deliveryDistanceKm.toFixed(1)} km

                      </strong>

                    </div>

                  </div>



                  <div className="rider-delivery-detail">

                    <Clock3 size={18} />



                    <div>

                      <span>Order date</span>

                      <strong>

                        {formatDate(delivery.createdAt)}

                      </strong>

                    </div>

                  </div>

                </div>



                <div className="rider-delivery-footer">

                  <div>

                    <span>Items</span>

                    <strong>

                      {delivery.items.reduce(

                        (total, item) => total + item.quantity,

                        0

                      )}

                    </strong>

                  </div>



                          <div>

            <span>Delivery Fee</span>

            <strong>

              {formatCurrency(delivery.deliveryFee)}

            </strong>

          </div>



                  <div>

                    <span>Payment</span>

                    <strong>

                      {delivery.paymentStatus}

                    </strong>

                  </div>



                      {delivery.orderStatus === "ready" && (

              <button

                type="button"

                onClick={() =>

                  handleDeliveryStatus(

                    delivery._id,

                    "out_for_delivery"

                  )

                }

              >

                Start Delivery

              </button>

            )}



            {delivery.orderStatus === "out_for_delivery" && (

              <button

                type="button"

                onClick={() =>

                  handleDeliveryStatus(

                    delivery._id,

                    "delivered"

                  )

                }

              >

                Mark as Delivered

              </button>



            )}



                  <button

        type="button"

        className="rider-view-delivery-button"

        onClick={() => setSelectedDelivery(delivery)}

      >

        View Delivery

      </button>



                </div>

              </article>

            ))}

          </div>

        )}

      </section>

        {selectedDelivery && (

  <div

    className="rider-modal-overlay"

    onClick={() => setSelectedDelivery(null)}

  >

    <div

      className="rider-delivery-modal"

      onClick={(event) => event.stopPropagation()}

    >

      <div className="rider-modal-header">

        <div>

          <span className="rider-order-label">

            Order #{selectedDelivery._id.slice(-6).toUpperCase()}

          </span>



          <h2>Delivery Details</h2>

        </div>



        <button

          type="button"

          className="rider-modal-close"

          onClick={() => setSelectedDelivery(null)}

          aria-label="Close delivery details"

        >

          ×

        </button>

      </div>



      <div className="rider-modal-status">

        <span

          className={`rider-delivery-status ${selectedDelivery.orderStatus}`}

        >

          {formatStatus(selectedDelivery.orderStatus)}

        </span>

      </div>



      {/* PICKUP */}

      <section className="rider-modal-section">

        <div className="rider-modal-section-heading">

          <Package size={19} />

          <h3>Pickup From</h3>

        </div>



        <div className="rider-modal-info">

          <strong>{selectedDelivery.restaurant.name}</strong>



          {selectedDelivery.restaurant.address && (

            <span>{selectedDelivery.restaurant.address}</span>

          )}



          {selectedDelivery.restaurant.phone && (

            <a

              href={`tel:${selectedDelivery.restaurant.phone}`}

              className="rider-modal-phone"

            >

              <Phone size={16} />

              {selectedDelivery.restaurant.phone}

            </a>

          )}

        </div>

      </section>



      {/* CUSTOMER */}

      <section className="rider-modal-section">

        <div className="rider-modal-section-heading">

          <MapPin size={19} />

          <h3>Deliver To</h3>

        </div>



        <div className="rider-modal-info">

          <strong>{selectedDelivery.user.fullName}</strong>



          <span>{selectedDelivery.deliveryAddress}</span>



          <a

            href={`tel:${selectedDelivery.phone}`}

            className="rider-modal-phone"

          >

            <Phone size={16} />

            {selectedDelivery.phone}

          </a>

        </div>



        <div className="rider-modal-actions">

          <a

            href={`tel:${selectedDelivery.phone}`}

            className="rider-call-button"

          >

            <Phone size={18} />

            Call Customer

          </a>



          <button

            type="button"

            className="rider-navigate-button"

            onClick={() =>

              handleNavigateToCustomer(selectedDelivery)

            }

          >

            <Navigation size={18} />

            Navigate

          </button>

        </div>

      </section>



      {/* DELIVERY INFORMATION */}

      <section className="rider-modal-section">

        <div className="rider-modal-section-heading">

          <Navigation size={19} />

          <h3>Delivery Information</h3>

        </div>



        <div className="rider-modal-stats">

          <div>

            <span>Distance</span>

            <strong>

              {selectedDelivery.deliveryDistanceKm.toFixed(1)} km

            </strong>

          </div>



          <div>

            <span>Items</span>

            <strong>

              {selectedDelivery.items.reduce(

                (total, item) => total + item.quantity,

                0

              )}

            </strong>

          </div>



          <div>

            <span>Delivery Fee</span>

            <strong>

              {formatCurrency(selectedDelivery.deliveryFee)}

            </strong>

          </div>



          <div>

            <span>Payment</span>

            <strong>{selectedDelivery.paymentStatus}</strong>

          </div>

        </div>

      </section>



      <div className="rider-modal-footer">

        <button

          type="button"

          className="rider-modal-close-button"

          onClick={() => setSelectedDelivery(null)}

        >

          Close

        </button>

      </div>

    </div>

  </div>

)}
    </div>

  );

};



export default RiderDashboard;