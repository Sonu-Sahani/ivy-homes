import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";

const ITEMS_PER_PAGE = 20;

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    locality: "",
    bedroom: "",
    minPrice: "",
    maxPrice: "",
    furnishing: "",
  });

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: page,
        limit: ITEMS_PER_PAGE,
      };

      if (filters.locality.trim()) {
        params.locality = filters.locality.trim().toLowerCase();
      }

      if (filters.bedroom) {
        params.bhk = filters.bedroom;
      }

      if (filters.minPrice) {
        params.min_price = filters.minPrice;
      }

      if (filters.maxPrice) {
        params.max_price = filters.maxPrice;
      }

      if (filters.furnishing) {
        params.furnishing = filters.furnishing;
      }

      const response = await api.get("/v1/listings", {
        params,
      });

      const results = response.data?.results || [];
      const apiTotal = Number(response.data?.total) || 0;

      setListings(results);
      setTotal(apiTotal);
    } catch (err) {
      console.error("Listings error:", err);

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
          "Unable to load listings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      locality: "",
      bedroom: "",
      minPrice: "",
      maxPrice: "",
      furnishing: "",
    });

    setPage(1);

    toast.success("Filters cleared");
  };

  const handlePrevious = () => {
    if (page <= 1) return;

    setPage((previous) => previous - 1);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (page >= totalPages) return;

    setPage((previous) => previous + 1);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#252525]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#5D7052] mb-2">
            Properties
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
                Explore listings
              </h2>

              <p className="text-sm text-[#77736B] mt-2">
                Browse properties available across Pune.
              </p>
            </div>

            {!loading && !error && (
              <p className="text-sm text-[#77736B]">
                {total.toLocaleString("en-IN")} properties
              </p>
            )}
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white border border-[#E1DED7] rounded-xl p-4 sm:p-5 mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="font-medium text-[#252525]">
                Filter properties
              </h3>

              <p className="text-xs text-[#8A867D] mt-1">
                Narrow down listings based on your requirements.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="self-start sm:self-auto text-sm text-[#5D7052] hover:text-[#252525] transition"
            >
              Clear filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Locality */}
            <div>
              <label className="block text-xs font-medium text-[#5F5B54] mb-2">
                Locality
              </label>

              <input
                type="text"
                name="locality"
                value={filters.locality}
                onChange={handleFilterChange}
                placeholder="e.g. Kharadi"
                className="w-full h-10 px-3 rounded-lg border border-[#D8D5CE] bg-[#FAF9F6] text-sm outline-none focus:border-[#5D7052] focus:ring-1 focus:ring-[#5D7052]"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-medium text-[#5F5B54] mb-2">
                Bedrooms
              </label>

              <select
                name="bedroom"
                value={filters.bedroom}
                onChange={handleFilterChange}
                className="w-full h-10 px-3 rounded-lg border border-[#D8D5CE] bg-[#FAF9F6] text-sm outline-none focus:border-[#5D7052] focus:ring-1 focus:ring-[#5D7052]"
              >
                <option value="">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5 BHK</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-xs font-medium text-[#5F5B54] mb-2">
                Min Price
              </label>

              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="₹ Minimum"
                className="w-full h-10 px-3 rounded-lg border border-[#D8D5CE] bg-[#FAF9F6] text-sm outline-none focus:border-[#5D7052] focus:ring-1 focus:ring-[#5D7052]"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-medium text-[#5F5B54] mb-2">
                Max Price
              </label>

              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="₹ Maximum"
                className="w-full h-10 px-3 rounded-lg border border-[#D8D5CE] bg-[#FAF9F6] text-sm outline-none focus:border-[#5D7052] focus:ring-1 focus:ring-[#5D7052]"
              />
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-xs font-medium text-[#5F5B54] mb-2">
                Furnishing
              </label>

              <select
                name="furnishing"
                value={filters.furnishing}
                onChange={handleFilterChange}
                className="w-full h-10 px-3 rounded-lg border border-[#D8D5CE] bg-[#FAF9F6] text-sm outline-none focus:border-[#5D7052] focus:ring-1 focus:ring-[#5D7052]"
              >
                <option value="">Any</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#D8D5CE] border-t-[#5D7052] rounded-full animate-spin" />

            <p className="text-sm text-[#77736B] mt-4">
              Loading properties...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-[#E5C8C1] bg-[#F7E9E6] px-5 py-5">
            <p className="text-sm text-[#9B5144]">{error}</p>

            <button
              type="button"
              onClick={fetchListings}
              className="mt-4 px-4 py-2 rounded-lg bg-[#252525] text-white text-sm hover:bg-[#3A3936] transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {listings.length === 0 ? (
              <div className="bg-white border border-[#E1DED7] rounded-xl py-20 px-5 text-center">
                <h3 className="text-lg font-medium">
                  No properties found
                </h3>

                <p className="text-sm text-[#77736B] mt-2">
                  Try changing or clearing your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 px-4 py-2 rounded-lg bg-[#252525] text-white text-sm hover:bg-[#3A3936] transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Property Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {listings.map((listing) => (
                    <PropertyCard
                      key={listing.listing_id}
                      listing={listing}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-[#DDD9D0]">
                    <div>
                      <p className="text-sm text-[#77736B]">
                        Showing page{" "}
                        <span className="font-medium text-[#252525]">
                          {page}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-[#252525]">
                          {totalPages}
                        </span>
                      </p>

                      <p className="text-xs text-[#9A968D] mt-1">
                        {ITEMS_PER_PAGE} properties per page
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={page === 1 || loading}
                        className="px-4 py-2 rounded-lg border border-[#CFCBC2] text-sm text-[#4B4944] hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={page === totalPages || loading}
                        className="px-4 py-2 rounded-lg bg-[#252525] text-white text-sm hover:bg-[#3A3936] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}