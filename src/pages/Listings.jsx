import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";

const ITEMS_PER_PAGE = 20;
const API_PAGE_SIZE = 200;

export default function Listings() {
  const [allListings, setAllListings] = useState([]);

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

  // Fetch all available listings from API
  const fetchAllListings = async () => {
    try {
      setLoading(true);
      setError("");

      const firstResponse = await api.get("/v1/listings", {
        params: {
          page: 1,
          limit: API_PAGE_SIZE,
        },
      });

      const firstResults = firstResponse.data?.results || [];

      console.log("First API response:", firstResponse.data);
      console.log(
        "First page listing IDs:",
        firstResults.map((item) => item.listing_id)
      );

      if (firstResults.length === 0) {
        setAllListings([]);
        return;
      }

      const totalFromApi = Number(firstResponse.data?.total) || 0;

      const collectedListings = [...firstResults];

      // Number of pages according to API total
      const totalApiPages = Math.ceil(
        totalFromApi / API_PAGE_SIZE
      );

      // Fetch remaining pages
      for (let currentPage = 2; currentPage <= totalApiPages; currentPage++) {
        const response = await api.get("/v1/listings", {
          params: {
            page: currentPage,
            limit: API_PAGE_SIZE,
          },
        });

        const results = response.data?.results || [];

        console.log(
          `API page ${currentPage} listing IDs:`,
          results.map((item) => item.listing_id)
        );

        if (results.length === 0) {
          break;
        }

        collectedListings.push(...results);
      }

      // Remove duplicate listing records
      const uniqueListings = Array.from(
        new Map(
          collectedListings.map((listing) => [
            listing.listing_id,
            listing,
          ])
        ).values()
      );

      console.log(
        "Total listings collected:",
        uniqueListings.length
      );

      setAllListings(uniqueListings);
      setPage(1);
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
    fetchAllListings();
  }, []);

  // Frontend filtering
  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      // Locality
      if (filters.locality.trim()) {
        const listingLocality = String(
          listing.locality || ""
        ).toLowerCase();

        const selectedLocality = filters.locality
          .trim()
          .toLowerCase();

        if (!listingLocality.includes(selectedLocality)) {
          return false;
        }
      }

      // Bedroom / BHK
      if (filters.bedroom) {
        const listingBedroom = String(
          listing.bedroom ?? ""
        );

        if (listingBedroom !== String(filters.bedroom)) {
          return false;
        }
      }

      // Minimum price
      if (filters.minPrice) {
        const listingPrice = Number(listing.price);
        const minimumPrice = Number(filters.minPrice);

        if (
          !Number.isFinite(listingPrice) ||
          listingPrice < minimumPrice
        ) {
          return false;
        }
      }

      // Maximum price
      if (filters.maxPrice) {
        const listingPrice = Number(listing.price);
        const maximumPrice = Number(filters.maxPrice);

        if (
          !Number.isFinite(listingPrice) ||
          listingPrice > maximumPrice
        ) {
          return false;
        }
      }

      // Furnishing
      if (filters.furnishing) {
        const listingFurnishing = String(
          listing.furnishing || ""
        )
          .toLowerCase()
          .trim();

        const selectedFurnishing = filters.furnishing
          .toLowerCase()
          .trim();

        if (listingFurnishing !== selectedFurnishing) {
          return false;
        }
      }

      return true;
    });
  }, [allListings, filters]);

  // Pagination calculated from filtered results
  const totalPages = Math.max(
    1,
    Math.ceil(filteredListings.length / ITEMS_PER_PAGE)
  );

  // Current page listings
  const currentListings = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredListings.slice(startIndex, endIndex);
  }, [filteredListings, page]);

  // Keep page valid after filtering
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
    if (page === 1) {
      return;
    }

    setPage((previous) => previous - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (page >= totalPages) {
      return;
    }

    setPage((previous) => previous + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const startResult =
    filteredListings.length === 0
      ? 0
      : (page - 1) * ITEMS_PER_PAGE + 1;

  const endResult = Math.min(
    page * ITEMS_PER_PAGE,
    filteredListings.length
  );

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
                {filteredListings.length.toLocaleString("en-IN")}{" "}
                properties
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
                Filters are applied to the listing data.
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

            {/* Bedroom */}
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

            {/* Minimum Price */}
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

            {/* Maximum Price */}
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
                <option value="semi-furnished">
                  Semi Furnished
                </option>
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
              onClick={fetchAllListings}
              className="mt-4 px-4 py-2 rounded-lg bg-[#252525] text-white text-sm hover:bg-[#3A3936] transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {currentListings.length === 0 ? (
              <div className="bg-white border border-[#E1DED7] rounded-xl py-20 px-5 text-center">
                <h3 className="text-lg font-medium text-[#252525]">
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
                {/* Result information */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-[#77736B]">
                    Showing{" "}
                    <span className="font-medium text-[#252525]">
                      {startResult}
                    </span>
                    {" - "}
                    <span className="font-medium text-[#252525]">
                      {endResult}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-[#252525]">
                      {filteredListings.length}
                    </span>
                  </p>
                </div>

                {/* Property Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {currentListings.map((listing) => (
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
                        Page{" "}
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
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-[#CFCBC2] text-sm text-[#4B4944] hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={page === totalPages}
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