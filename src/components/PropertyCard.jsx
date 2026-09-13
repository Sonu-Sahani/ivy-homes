import { useNavigate } from "react-router-dom";

export default function PropertyCard({ listing }) {
  const navigate = useNavigate();

  const price = Number(listing.price);

  const formattedPrice = Number.isFinite(price)
    ? `₹${price.toLocaleString("en-IN")}`
    : "Price unavailable";

  return (
    <article className="bg-white rounded-xl border border-[#E1DED7] overflow-hidden hover:shadow-md transition duration-200">
      {/* Property Image */}
      <button
        type="button"
        onClick={() => navigate(`/listings/${listing.listing_id}`)}
        className="relative block w-full h-52 bg-[#E8E5DE] overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80"
          alt={listing.apartment_name || "Property"}
          className="w-full h-full object-cover transition duration-300 hover:scale-105"
        />

        {listing.is_verified && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 text-xs font-medium text-[#5D7052]">
            Verified
          </span>
        )}
      </button>

      {/* Property Details */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium text-lg text-[#252525] truncate">
              {listing.apartment_name || "Property"}
            </h3>

            <p className="text-sm text-[#77736B] mt-1 truncate">
              {listing.locality || "Pune"}
            </p>
          </div>
        </div>

        {/* Property Info */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-4 text-sm text-[#5F5B54]">
          <span>{listing.bedroom || "-"} BHK</span>

          <span className="text-[#C2BEB5]">•</span>

          <span>
            {listing.carpet_area
              ? `${Number(listing.carpet_area).toLocaleString("en-IN")} sq.ft`
              : "Area N/A"}
          </span>

          {listing.furnishing && (
            <>
              <span className="text-[#C2BEB5]">•</span>
              <span className="capitalize">{listing.furnishing}</span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between gap-3 mt-5">
          <div>
            <p className="text-xl font-semibold text-[#252525]">
              {formattedPrice}
            </p>

            {listing.property_type && (
              <p className="text-xs text-[#8A867D] mt-1 capitalize">
                {listing.property_type}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/listings/${listing.listing_id}`)}
            className="px-3 py-2 rounded-lg bg-[#F0EEE8] text-xs font-medium text-[#4B4944] hover:bg-[#252525] hover:text-white transition"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}