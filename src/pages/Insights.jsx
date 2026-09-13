import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";

const API_PAGE_SIZE = 200;

export default function Insights() {
  const [listings, setListings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [listingsResponse, rentalsResponse, projectsResponse] =
        await Promise.all([
          api.get("/v1/listings", {
            params: {
              page: 1,
              limit: API_PAGE_SIZE,
            },
          }),

          api.get("/v1/rentals", {
            params: {
              page: 1,
              limit: API_PAGE_SIZE,
            },
          }),

          api.get("/v1/projects", {
            params: {
              page: 1,
              limit: API_PAGE_SIZE,
            },
          }),
        ]);

      const listingResults =
        listingsResponse.data?.results || [];

      const rentalResults =
        rentalsResponse.data?.results || [];

      const projectResults =
        projectsResponse.data?.results || [];

      setListings(
        Array.from(
          new Map(
            listingResults.map((item) => [
              item.listing_id,
              item,
            ])
          ).values()
        )
      );

      setRentals(
        Array.from(
          new Map(
            rentalResults.map((item) => [
              item.listing_id,
              item,
            ])
          ).values()
        )
      );

      setProjects(
        Array.from(
          new Map(
            projectResults.map((item) => [
              item.project_id,
              item,
            ])
          ).values()
        )
      );
    } catch (err) {
      console.error("Insights error:", err);

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
          "Unable to load property insights."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const insights = useMemo(() => {
    const liveListings = listings.filter(
      (listing) => listing.is_live === true
    );

    const twoBhkListings = liveListings.filter(
      (listing) => Number(listing.bedroom) === 2
    );

    const twoBhkPricesPerSqft = twoBhkListings
      .filter(
        (listing) =>
          Number(listing.price) > 0 &&
          Number(listing.carpet_area) > 0
      )
      .map(
        (listing) =>
          Number(listing.price) /
          Number(listing.carpet_area)
      );

    const averageTwoBhkPricePerSqft =
      twoBhkPricesPerSqft.length > 0
        ? twoBhkPricesPerSqft.reduce(
            (sum, value) => sum + value,
            0
          ) / twoBhkPricesPerSqft.length
        : null;

    const totalMonthlyRent = rentals.reduce(
      (sum, rental) => {
        const rent = Number(rental.price);

        return Number.isFinite(rent)
          ? sum + rent
          : sum;
      },
      0
    );

    const averageListingPrice =
      listings.length > 0
        ? listings.reduce((sum, listing) => {
            const price = Number(listing.price);

            return Number.isFinite(price)
              ? sum + price
              : sum;
          }, 0) / listings.length
        : null;

    const highestProject = [...projects]
      .filter((project) => Number.isFinite(Number(project.price_max)))
      .sort(
        (a, b) =>
          Number(b.price_max) -
          Number(a.price_max)
      )[0];

    const bedroomCounts = listings.reduce(
      (counts, listing) => {
        const bedroom = listing.bedroom;

        if (
          bedroom !== undefined &&
          bedroom !== null
        ) {
          const key = String(bedroom);

          counts[key] = (counts[key] || 0) + 1;
        }

        return counts;
      },
      {}
    );

    const mostCommonBedroom =
      Object.entries(bedroomCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];

    const furnishingCounts = listings.reduce(
      (counts, listing) => {
        if (listing.furnishing) {
          const key = String(
            listing.furnishing
          ).trim();

          counts[key] = (counts[key] || 0) + 1;
        }

        return counts;
      },
      {}
    );

    const mostCommonFurnishing =
      Object.entries(furnishingCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];

    return {
      totalListings: listings.length,
      liveListings: liveListings.length,
      totalRentals: rentals.length,
      totalProjects: projects.length,
      averageListingPrice,
      averageTwoBhkPricePerSqft,
      totalMonthlyRent,
      highestProject,
      mostCommonBedroom,
      mostCommonFurnishing,
    };
  }, [listings, rentals, projects]);

  const formatNumber = (value) => {
    if (!Number.isFinite(Number(value))) {
      return "N/A";
    }

    return Number(value).toLocaleString("en-IN");
  };

  const formatCurrency = (value) => {
    if (!Number.isFinite(Number(value))) {
      return "N/A";
    }

    return `₹${Number(value).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatPricePerSqft = (value) => {
    if (!Number.isFinite(Number(value))) {
      return "N/A";
    }

    return `₹${Number(value).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }
    )}`;
  };

  const handleRefresh = async () => {
    await fetchAllData();
    toast.success("Insights refreshed");
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#252525]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#5D7052] mb-2">
            Analytics
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">
                Insights
              </h1>

              <p className="text-sm text-[#77736B] mt-2">
                Property market insights calculated from
                live Ivy Homes data.
              </p>
            </div>

            {!loading && !error && (
              <button
                type="button"
                onClick={handleRefresh}
                className="self-start sm:self-auto px-4 py-2 rounded-lg border border-[#CFCBC2] bg-white text-sm text-[#4B4944] hover:bg-[#FAF9F6] transition"
              >
                Refresh data
              </button>
            )}
          </div>
        </section>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#D8D5CE] border-t-[#5D7052] rounded-full animate-spin" />

            <p className="text-sm text-[#77736B] mt-4">
              Calculating insights...
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
              onClick={fetchAllData}
              className="mt-4 px-4 py-2 rounded-lg bg-[#252525] text-white text-sm hover:bg-[#3A3936] transition"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E1DED7] rounded-xl p-5">
                <p className="text-xs uppercase tracking-[0.15em] text-[#8A867D]">
                  Listings
                </p>

                <p className="text-3xl font-semibold mt-3">
                  {formatNumber(
                    insights.totalListings
                  )}
                </p>

                <p className="text-xs text-[#77736B] mt-2">
                  Records retrieved
                </p>
              </div>

              <div className="bg-white border border-[#E1DED7] rounded-xl p-5">
                <p className="text-xs uppercase tracking-[0.15em] text-[#8A867D]">
                  Live listings
                </p>

                <p className="text-3xl font-semibold mt-3">
                  {formatNumber(
                    insights.liveListings
                  )}
                </p>

                <p className="text-xs text-[#77736B] mt-2">
                  Currently marked live
                </p>
              </div>

              <div className="bg-white border border-[#E1DED7] rounded-xl p-5">
                <p className="text-xs uppercase tracking-[0.15em] text-[#8A867D]">
                  Rentals
                </p>

                <p className="text-3xl font-semibold mt-3">
                  {formatNumber(
                    insights.totalRentals
                  )}
                </p>

                <p className="text-xs text-[#77736B] mt-2">
                  Rental records retrieved
                </p>
              </div>

              <div className="bg-white border border-[#E1DED7] rounded-xl p-5">
                <p className="text-xs uppercase tracking-[0.15em] text-[#8A867D]">
                  Projects
                </p>

                <p className="text-3xl font-semibold mt-3">
                  {formatNumber(
                    insights.totalProjects
                  )}
                </p>

                <p className="text-xs text-[#77736B] mt-2">
                  Projects retrieved
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
              <div className="bg-white border border-[#E1DED7] rounded-xl p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-[#5D7052]">
                  Pricing
                </p>

                <h2 className="text-xl font-medium mt-2">
                  Market price signals
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EEEAE2]">
                    <span className="text-sm text-[#77736B]">
                      Average listing price
                    </span>

                    <span className="font-medium text-sm">
                      {formatCurrency(
                        insights.averageListingPrice
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EEEAE2]">
                    <span className="text-sm text-[#77736B]">
                      Average 2BHK price / sq.ft
                    </span>

                    <span className="font-medium text-sm">
                      {formatPricePerSqft(
                        insights.averageTwoBhkPricePerSqft
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-[#77736B]">
                      Total monthly rent
                    </span>

                    <span className="font-medium text-sm">
                      {formatCurrency(
                        insights.totalMonthlyRent
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E1DED7] rounded-xl p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-[#5D7052]">
                  Inventory
                </p>

                <h2 className="text-xl font-medium mt-2">
                  Property patterns
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EEEAE2]">
                    <span className="text-sm text-[#77736B]">
                      Most common bedroom count
                    </span>

                    <span className="font-medium text-sm">
                      {insights.mostCommonBedroom
                        ? `${insights.mostCommonBedroom[0]} BHK`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EEEAE2]">
                    <span className="text-sm text-[#77736B]">
                      Most common furnishing
                    </span>

                    <span className="font-medium text-sm capitalize">
                      {insights.mostCommonFurnishing
                        ? insights.mostCommonFurnishing[0]
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-[#77736B]">
                      Live listing ratio
                    </span>

                    <span className="font-medium text-sm">
                      {insights.totalListings > 0
                        ? `${(
                            (insights.liveListings /
                              insights.totalListings) *
                            100
                          ).toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-5 bg-[#252525] text-white rounded-xl p-6">
              <p className="text-xs uppercase tracking-[0.15em] text-[#AEB8A5]">
                Highest priced project
              </p>

              {insights.highestProject ? (
                <div className="mt-3">
                  <h2 className="text-2xl font-medium">
                    {insights.highestProject.apartment_name ||
                      "Residential project"}
                  </h2>

                  <p className="text-sm text-white/60 mt-2">
                    {insights.highestProject.locality ||
                      "Location unavailable"}
                  </p>

                  <p className="text-2xl font-semibold mt-5">
                    {formatCurrency(
                      insights.highestProject.price_max
                    )}
                  </p>

                  <p className="text-xs text-white/50 mt-1">
                    Maximum listed project price
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white/60 mt-4">
                  Project pricing data unavailable.
                </p>
              )}
            </section>

            <section className="mt-5 bg-white border border-[#E1DED7] rounded-xl p-6">
              <p className="text-xs uppercase tracking-[0.15em] text-[#5D7052]">
                API investigation
              </p>

              <h2 className="text-xl font-medium mt-2">
                Analytics endpoint status
              </h2>

              <p className="text-sm text-[#77736B] mt-3 leading-6">
                The documented analytics endpoint returned
                a 404 response during testing. Therefore this
                screen calculates useful insights directly
                from the listing, rental and project data
                successfully retrieved from the live API.
              </p>

              <div className="mt-5 rounded-lg bg-[#F5F3EE] border border-[#E1DED7] p-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9B5144]" />

                  <span className="text-sm font-medium">
                    /v1/analytics/summary
                  </span>

                  <span className="text-xs px-2 py-1 rounded-full bg-[#F7E9E6] text-[#9B5144]">
                    404 Not Found
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}