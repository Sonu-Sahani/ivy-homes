import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";

const ITEMS_PER_PAGE = 12;
const API_PAGE_SIZE = 200;

export default function Rentals() {
  const [allRentals, setAllRentals] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    locality: "",
    bedroom: "",
    furnishing: "",
  });

  const fetchAllRentals = async () => {
    try {
      setLoading(true);
      setError("");

      const firstResponse = await api.get("/v1/rentals", {
        params: {
          page: 1,
          limit: API_PAGE_SIZE,
        },
      });

      const firstResults = firstResponse.data?.results || [];
      const totalFromApi = Number(firstResponse.data?.total) || 0;

      const collectedRentals = [...firstResults];

      const totalApiPages = Math.ceil(
        totalFromApi / API_PAGE_SIZE
      );

      for (
        let currentPage = 2;
        currentPage <= totalApiPages;
        currentPage++
      ) {
        const response = await api.get("/v1/rentals", {
          params: {
            page: currentPage,
            limit: API_PAGE_SIZE,
          },
        });

        const results = response.data?.results || [];

        if (results.length === 0) break;

        collectedRentals.push(...results);
      }

      const uniqueRentals = Array.from(
        new Map(
          collectedRentals.map((rental) => [
            rental.listing_id,
            rental,
          ])
        ).values()
      );

      setAllRentals(uniqueRentals);
      setPage(1);
    } catch (err) {
      console.error("Rentals error:", err);

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
          "Unable to load rental properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRentals();
  }, []);

  const filteredRentals = useMemo(() => {
    return allRentals.filter((rental) => {
      if (filters.locality.trim()) {
        const rentalLocality = String(
          rental.locality || ""
        ).toLowerCase();

        const selectedLocality = filters.locality
          .trim()
          .toLowerCase();

        if (!rentalLocality.includes(selectedLocality)) {
          return false;
        }
      }

      if (filters.bedroom) {
        if (
          String(rental.bedroom ?? "") !==
          String(filters.bedroom)
        ) {
          return false;
        }
      }

      if (filters.furnishing) {
        const rentalFurnishing = String(
          rental.furnishing || ""
        )
          .toLowerCase()
          .trim();

        const selectedFurnishing = filters.furnishing
          .toLowerCase()
          .trim();

        if (rentalFurnishing !== selectedFurnishing) {
          return false;
        }
      }

      return true;
    });
  }, [allRentals, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRentals.length / ITEMS_PER_PAGE
    )
  );

  const currentRentals = useMemo(() => {
    const startIndex =
      (page - 1) * ITEMS_PER_PAGE;

    return filteredRentals.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredRentals, page]);

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
      furnishing: "",
    });

    setPage(1);

    toast.success("Filters cleared");
  };

  const formatRent = (price) => {
    const value = Number(price);

    if (!Number.isFinite(value)) {
      return "Rent unavailable";
    }

    return `₹${value.toLocaleString("en-IN")}/month`;
  };

  const formatArea = (area) => {
    const value = Number(area);

    if (!Number.isFinite(value)) {
      return "N/A";
    }

    return `${value.toLocaleString("en-IN")} sq.ft`;
  };

  const handlePrevious = () => {
    if (page === 1) return;

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

  const startResult =
    filteredRentals.length === 0
      ? 0
      : (page - 1) * ITEMS_PER_PAGE + 1;

  const endResult = Math.min(
    page * ITEMS_PER_PAGE,
    filteredRentals.length
  );

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#252525]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#5D7052] mb-2">
            Rentals
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">
                Explore rentals
              </h1>

              <p className="text-sm text-[#77736B] mt-2">
                Browse rental properties available through
                Ivy Homes.
              </p>
            </div>

            {!loading && !error && (
              <p className="text-sm text-[#77736B]">
                {filteredRentals.length.toLocaleString(
                  "en-IN"
                )}{" "}
                rentals
              </p>
            )}
          </div>
        </section>

        <section className="bg-white border border-[#E1DED7] rounded-xl p-4 sm:p-5 mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="font-medium">
                Filter rentals
              </h2>

              <p className="text-xs text-[#8A867D] mt-1">
                Filter the rental data by locality,
                bedrooms and furnishing.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <option value="fully-furnished">
                  Fully Furnished
                </option>
                <option value="semi-furnished">
                  Semi Furnished
                </option>
                <option value="unfurnished">
                  Unfurnished
                </option>
              </select>
            </div>
          </div>
        </section>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#D8D5CE] border-t-[#5D7052] rounded-full animate-spin" />

            <p className="text-sm text-[#77736B] mt-4">
              Loading rentals...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-[#E5C8C1] bg-[#F7E9E6] px-5 py-5">
            <p className="text-sm text-[#9B5144]">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAllRentals}
              className="mt-4 px-4 py-2 rounded-lg bg-[#252525] text-white text-sm hover:bg-[#3A3936] transition"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {currentRentals.length === 0 ? (
              <div className="bg-white border border-[#E1DED7] rounded-xl py-20 px-5 text-center">
                <h2 className="text-lg font-medium">
                  No rentals found
                </h2>

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
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-[#77736B]">
                    Showing{" "}
                    <span className="font-medium text-[#252525]">
                      {startResult}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-[#252525]">
                      {endResult}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-[#252525]">
                      {filteredRentals.length}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {currentRentals.map((rental) => (
                    <article
                      key={rental.listing_id}
                      className="bg-white border border-[#E1DED7] rounded-xl overflow-hidden hover:border-[#C7C2B8] transition"
                    >
                      <div className="h-48 bg-[#E8E5DE]">
                        <img
                          src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=80"
                          alt={
                            rental.apartment_name ||
                            "Rental property"
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-xs uppercase tracking-[0.15em] text-[#5D7052]">
                          {rental.property_type ||
                            "Property"}
                        </p>

                        <h2 className="text-lg font-medium mt-1 line-clamp-1">
                          {rental.apartment_name ||
                            rental.title ||
                            "Rental property"}
                        </h2>

                        <p className="text-sm text-[#77736B] mt-1">
                          {rental.locality || "Pune"}
                        </p>

                        <div className="mt-4 pt-4 border-t border-[#E5E1D9]">
                          <p className="text-lg font-semibold">
                            {formatRent(rental.price)}
                          </p>

                          <div className="flex items-center gap-3 mt-3 text-xs text-[#77736B]">
                            <span>
                              {rental.bedroom ?? "N/A"} BHK
                            </span>

                            <span>•</span>

                            <span>
                              {formatArea(
                                rental.carpet_area
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

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
                        {ITEMS_PER_PAGE} rentals per page
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