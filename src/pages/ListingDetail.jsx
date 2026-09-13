import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------
  // Fetch listing details
  // ---------------------------------------------------------

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError("");

      // Actual API route
      const response = await api.get(`/v1/listings/${id}`);

      setListing(response.data);
    } catch (err) {
      console.error("Listing detail error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("ivy_token");
        localStorage.removeItem("ivy_user");

        sessionStorage.removeItem("ivy_token");
        sessionStorage.removeItem("ivy_user");

        window.location.replace("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load this property."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Check whether listing is saved
  // ---------------------------------------------------------

  const checkSavedStatus = async () => {
    try {
      const response = await api.get("/v1/saved");

      const savedListings = response.data?.results || [];

      const isSaved = savedListings.some((item) => {
        const savedId =
          item?.listing_id ??
          item?.id ??
          item;

        return String(savedId) === String(id);
      });

      setSaved(isSaved);
    } catch (err) {
      console.error("Saved status error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("ivy_token");
        localStorage.removeItem("ivy_user");

        sessionStorage.removeItem("ivy_token");
        sessionStorage.removeItem("ivy_user");

        window.location.replace("/login");
      }
    }
  };

  // ---------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------

  useEffect(() => {
    fetchListing();
    checkSavedStatus();
  }, [id]);

  // ---------------------------------------------------------
  // Save / Remove listing
  // ---------------------------------------------------------

  const handleSaveToggle = async () => {
    try {
      setSaving(true);

      if (saved) {
        // Actual DELETE endpoint
        await api.delete(`/v1/saved/${id}`);

        setSaved(false);

        toast.success("Removed from saved listings");
      } else {
        // Actual POST endpoint + required body
        await api.post("/v1/saved", {
          listing_id: id,
        });

        setSaved(true);

        toast.success("Listing saved");
      }
    } catch (err) {
      console.error("Saved listing error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("ivy_token");
        localStorage.removeItem("ivy_user");

        sessionStorage.removeItem("ivy_token");
        sessionStorage.removeItem("ivy_user");

        window.location.replace("/login");
        return;
      }

      toast.error(
        err.response?.data?.detail ||
          "Unable to update saved listing."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // Format helpers
  // ---------------------------------------------------------

  const formatPrice = (price) => {
    const value = Number(price);

    if (!Number.isFinite(value)) {
      return "Price unavailable";
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatArea = (area) => {
    const value = Number(area);

    if (!Number.isFinite(value)) {
      return "N/A";
    }

    return `${value.toLocaleString("en-IN")} sq.ft`;
  };

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] text-[#252525]">
        <Navbar />

        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#D8D5CE] border-t-[#5D7052] rounded-full animate-spin" />

          <p className="text-sm text-[#77736B] mt-4">
            Loading property...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error state
  // ---------------------------------------------------------

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] text-[#252525]">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <div className="bg-white border border-[#E1DED7] rounded-xl p-8 text-center">
            <h1 className="text-xl font-medium">
              Property not found
            </h1>

            <p className="text-sm text-[#77736B] mt-2">
              {error || "This listing could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/listings")}
              className="mt-6 px-5 py-2.5 rounded-lg bg-[#252525] text-white text-sm hover:bg-[#3A3936] transition"
            >
              Back to listings
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Main UI
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#252525]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/listings")}
          className="text-sm text-[#5D7052] hover:text-[#252525] transition mb-6"
        >
          ← Back to listings
        </button>

        {/* Main Property Card */}
        <section className="bg-white border border-[#E1DED7] rounded-2xl overflow-hidden">

          {/* Image */}
          <div className="h-64 sm:h-80 lg:h-96 bg-[#E8E5DE] relative">
            <img
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80"
              alt={listing.apartment_name || "Property"}
              className="w-full h-full object-cover"
            />

            {listing.is_verified && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-medium text-[#5D7052]">
                Verified
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-5 sm:p-8">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#5D7052] mb-2">
                  Property
                </p>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight">
                  {listing.apartment_name || "Property"}
                </h1>

                <p className="text-sm text-[#77736B] mt-2">
                  {listing.locality || "Pune"}
                  {listing.city_id
                    ? ` · ${listing.city_id}`
                    : ""}
                </p>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveToggle}
                disabled={saving}
                className={`shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium border transition ${
                  saved
                    ? "bg-[#5D7052] border-[#5D7052] text-white"
                    : "bg-white border-[#CFCBC2] text-[#4B4944] hover:bg-[#252525] hover:border-[#252525] hover:text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving
                  ? "Updating..."
                  : saved
                  ? "♥ Saved"
                  : "♡ Save listing"}
              </button>
            </div>

            {/* Price */}
            <div className="mt-8 pb-7 border-b border-[#E5E1D9]">
              <p className="text-xs uppercase tracking-[0.15em] text-[#8A867D]">
                Price
              </p>

              <p className="text-3xl font-semibold mt-1">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-7 border-b border-[#E5E1D9]">

              <div>
                <p className="text-xs text-[#8A867D]">
                  Bedrooms
                </p>

                <p className="text-sm font-medium mt-1">
                  {listing.bedroom ?? "N/A"} BHK
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8A867D]">
                  Bathrooms
                </p>

                <p className="text-sm font-medium mt-1">
                  {listing.bathroom ?? "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8A867D]">
                  Carpet Area
                </p>

                <p className="text-sm font-medium mt-1">
                  {formatArea(listing.carpet_area)}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8A867D]">
                  Floor
                </p>

                <p className="text-sm font-medium mt-1">
                  {listing.floor ?? "N/A"}
                  {listing.total_floors
                    ? ` / ${listing.total_floors}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8A867D]">
                  Furnishing
                </p>

                <p className="text-sm font-medium mt-1 capitalize">
                  {listing.furnishing || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8A867D]">
                  Parking
                </p>

                <p className="text-sm font-medium mt-1">
                  {listing.covered_parking
                    ? "Available"
                    : "Not specified"}
                </p>
              </div>

            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-7">

              {/* Description */}
              <div>
                <h2 className="text-lg font-medium">
                  About this property
                </h2>

                <p className="text-sm text-[#77736B] leading-6 mt-3">
                  {listing.description ||
                    "No description is available for this listing."}
                </p>
              </div>

              {/* Property Information */}
              <div>
                <h2 className="text-lg font-medium">
                  Property information
                </h2>

                <div className="mt-4 space-y-3">

                  {listing.property_type && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#8A867D]">
                        Property type
                      </span>

                      <span className="font-medium capitalize">
                        {listing.property_type}
                      </span>
                    </div>
                  )}

                  {listing.facing_direction && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#8A867D]">
                        Facing
                      </span>

                      <span className="font-medium">
                        {listing.facing_direction}
                      </span>
                    </div>
                  )}

                  {listing.super_built_up_area && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#8A867D]">
                        Super built-up area
                      </span>

                      <span className="font-medium">
                        {formatArea(
                          listing.super_built_up_area
                        )}
                      </span>
                    </div>
                  )}

                  {listing.project_id && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#8A867D]">
                        Project ID
                      </span>

                      <span className="font-medium">
                        {listing.project_id}
                      </span>
                    </div>
                  )}

                  {listing.posted_at && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#8A867D]">
                        Posted
                      </span>

                      <span className="font-medium">
                        {new Date(
                          listing.posted_at
                        ).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}