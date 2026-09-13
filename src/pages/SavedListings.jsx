import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function SavedListings() {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchSavedListings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/v1/saved");

      const results = response.data?.results || [];

      setSavedListings(results);
    } catch (error) {
      console.error("Saved listings error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load saved listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const handleRemove = async (listingId) => {
    try {
      setRemovingId(listingId);

      await api.delete(`/v1/saved/${listingId}`);

      setSavedListings((current) =>
        current.filter(
          (listing) => listing.listing_id !== listingId
        )
      );

      toast.success("Listing removed from saved.");
    } catch (error) {
      console.error("Remove saved listing error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to remove saved listing."
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EE]">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="h-8 w-40 bg-[#E4E1D9] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[#E4E1D9] rounded animate-pulse mt-3" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl overflow-hidden border border-[#DDD9D0]"
              >
                <div className="h-52 bg-[#E4E1D9] animate-pulse" />

                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[#E4E1D9] rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-[#E4E1D9] rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-[#E4E1D9] rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#7B776F]">
              Your collection
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold text-[#252525] mt-2">
              Saved listings
            </h1>

            <p className="text-sm text-[#77736B] mt-2">
              Properties you want to keep an eye on.
            </p>
          </div>

          <div className="hidden sm:block px-4 py-2 rounded-full bg-white border border-[#DDD9D0] text-sm text-[#5F5B54]">
            {savedListings.length} saved
          </div>
        </div>

        {/* Empty State */}
        {savedListings.length === 0 ? (
          <div className="bg-white border border-[#DDD9D0] rounded-2xl px-6 py-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#E8E5DE] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-[#5D7052]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733C11.285 4.876 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-[#252525] mt-5">
              No saved listings yet
            </h2>

            <p className="text-sm text-[#77736B] mt-2 max-w-md mx-auto">
              Browse listings and save the properties you would like
              to revisit later.
            </p>

            <Link
              to="/listings"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-lg bg-[#252525] text-white text-sm font-medium hover:bg-[#3A3936] transition"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          /* Saved Listings */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {savedListings.map((listing) => (
              <div
                key={listing.listing_id}
                className="bg-white border border-[#DDD9D0] rounded-2xl overflow-hidden hover:shadow-md transition"
              >
                {/* Image */}
                <Link
                  to={`/listings/${listing.listing_id}`}
                  className="block"
                >
                  <div className="h-52 overflow-hidden bg-[#E8E5DE]">
                    <img
                      src={`https://images.unsplash.com/photo-${
                        [
                          "1600585154340-be6161a56a0c",
                          "1600607687920-4e2a09cf159d",
                          "1600566753190-17f0baa2a6c3",
                          "1600047509807-ba8f99d2cdde",
                        ][
                          Math.abs(
                            String(listing.listing_id)
                              .split("")
                              .reduce(
                                (sum, char) =>
                                  sum + char.charCodeAt(0),
                                0
                              )
                          ) % 4
                        ]
                      }?auto=format&fit=crop&w=900&q=80`}
                      alt={listing.apartment_name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                  </div>
                </Link>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/listings/${listing.listing_id}`}
                        className="text-lg font-semibold text-[#252525] hover:text-[#5D7052] transition line-clamp-1"
                      >
                        {listing.apartment_name}
                      </Link>

                      <p className="text-sm text-[#77736B] mt-1 capitalize">
                        {listing.locality}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(listing.listing_id)
                      }
                      disabled={
                        removingId === listing.listing_id
                      }
                      title="Remove from saved"
                      className="shrink-0 w-9 h-9 rounded-full bg-[#F4E7E3] text-[#9B5144] flex items-center justify-center hover:bg-[#EBD7D1] transition disabled:opacity-50"
                    >
                      {removingId === listing.listing_id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                        >
                          <path d="M11.645 20.91a.75.75 0 0 0 .71 0C12.71 20.78 21 15.87 21 9.75 21 6.574 18.426 4 15.25 4c-1.71 0-3.28.744-4.25 1.912A5.497 5.497 0 0 0 6.75 4C3.574 4 1 6.574 1 9.75c0 6.12 8.29 11.03 10.645 11.16Z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-4 text-xs text-[#77736B]">
                    <span>{listing.bedroom} BHK</span>

                    <span className="w-1 h-1 rounded-full bg-[#B9B5AC]" />

                    <span>{listing.carpet_area} sq.ft</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E7E3DB]">
                    <p className="text-xl font-semibold text-[#252525]">
                      ₹{Number(listing.price).toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-[#8A867D] mt-1">
                      {listing.furnishing
                        ? listing.furnishing
                        : "Furnishing not specified"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}