import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Rentals from "./pages/Rentals";
import Projects from "./pages/Projects";
import SavedListings from "./pages/SavedListings";
import Insights from "./pages/Insights";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const token =
    localStorage.getItem("ivy_token") ||
    sessionStorage.getItem("ivy_token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={token ? <Navigate to="/listings" replace /> : <Login />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/saved" element={<SavedListings />} />
          <Route path="/insights" element={<Insights />} />
        </Route>

        {/* Default Route */}
        <Route
          path="*"
          element={<Navigate to={token ? "/listings" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;