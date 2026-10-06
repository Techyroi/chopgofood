import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";

import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import Restaurants from "./pages/Restaurants";
import Foods from "./pages/Foods";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Account from "./pages/Account";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import Splash from "./pages/Splash";
import FoodDetail from "./pages/FoodDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Support from "./pages/Support";
import RoleRoute from "./components/RoleRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import RiderDashboard from "./pages/rider/RiderDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminRiders from "./pages/admin/AdminRiders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSupport from "./pages/admin/AdminSupport";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantMenu from "./pages/restaurant/RestaurantMenu";
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";
import RestaurantLayout from "./pages/restaurant/RestaurantLayout";
import RiderLayout from "./pages/rider/RiderLayout";

function App() {
  return (
    <Routes>
      {/* Splash */}
      <Route path="/" element={<Splash />} />

      {/* Public routes */}
      <Route path="/signup" element={<SignUp />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/home" element={<Home />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders/:id" element={<OrderTracking />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/account" element={<Account />} />
            <Route
      path="/food/:id"
      element={<FoodDetail />}
    />
    <Route path="/support" element={<Support />} />
          </Route>
    
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

                      <Route
          path="orders/:id"
          element={<AdminOrderDetails />}
        />
                      <Route
          path="orders"
          element={<AdminOrders />}
        />
                      <Route
          path="restaurants"
          element={<AdminRestaurants />}
        />
              <Route path="menu" element={<AdminMenu />} />

                        <Route
            path="customers"
            element={<AdminCustomers />}
          />
              <Route path="riders" element={<AdminRiders />} />

              <Route path="payments" element={<AdminPayments />} />

              <Route path="support" element={<AdminSupport />} />

            </Route>
          </Route>

 <Route element={<RoleRoute allowedRoles={["restaurant"]} />}>
  <Route
    path="/restaurant-dashboard"
    element={<RestaurantLayout />}
  >
    <Route index element={<RestaurantDashboard />} />

    <Route
      path="orders"
      element={<RestaurantOrders />}
    />

    <Route
      path="menu"
      element={<RestaurantMenu />}
    />

    <Route
      path="profile"
      element={<RestaurantProfile />}
    />
  </Route>
</Route>

          <Route element={<RoleRoute allowedRoles={["rider"]} />}>
  <Route
    path="/rider-dashboard"
    element={<RiderLayout />}
  >
    <Route index element={<RiderDashboard />} />
  </Route>
</Route>

    </Routes>
  );
}

export default App;