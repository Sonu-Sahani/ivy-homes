import "dotenv/config";

const BASE_URL = process.env.VITE_API_BASE_URL;
const API_KEY = process.env.VITE_IVY_API_KEY;
const EMAIL = process.env.IVY_DEMO_EMAIL;
const PASSWORD = process.env.IVY_DEMO_PASSWORD;

async function request(path, method = "GET", token = null, body = null) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    status: response.status,
    data,
    allow: response.headers.get("allow"),
  };
}

async function main() {
  console.log("=================================");
  console.log("Ivy Homes Saved Listings Test");
  console.log("=================================\n");

  // ---------------------------------------------------------
  // Login
  // ---------------------------------------------------------

  const login = await request("/auth/login", "POST", null, {
    email: EMAIL,
    password: PASSWORD,
  });

  console.log("Login:", login.status);

  if (login.status !== 200) {
    console.log(login.data);
    return;
  }

  const token =
    login.data.token ||
    login.data.access_token;

  if (!token) {
    console.log("No token received.");
    return;
  }

  console.log("Login successful.\n");

  // ---------------------------------------------------------
  // Get listings
  // ---------------------------------------------------------

  const listings = await request(
    "/v1/listings?limit=1",
    "GET",
    token
  );

  console.log("Listings:", listings.status);

  if (
    listings.status !== 200 ||
    !listings.data?.results?.length
  ) {
    console.log("Could not get a listing.");
    console.log(listings.data);
    return;
  }

  const listing = listings.data.results[0];

  console.log(
    "Test listing ID:",
    listing.listing_id
  );

  // ---------------------------------------------------------
  // GET /v1/saved
  // ---------------------------------------------------------

  console.log("\n--- GET /v1/saved ---");

  const getSaved = await request(
    "/v1/saved",
    "GET",
    token
  );

  console.log("Status:", getSaved.status);
  console.log(
    JSON.stringify(getSaved.data, null, 2)
  );

  // ---------------------------------------------------------
  // POST /v1/saved
  // ---------------------------------------------------------

  console.log("\n--- POST /v1/saved ---");

  const postSaved = await request(
    "/v1/saved",
    "POST",
    token,
    {
      id: listing.listing_id,
    }
  );

  console.log("Status:", postSaved.status);
  console.log(
    "Allow:",
    postSaved.allow || "none"
  );
  console.log(
    JSON.stringify(postSaved.data, null, 2)
  );

  // ---------------------------------------------------------
  // POST /v1/saved with listing_id
  // ---------------------------------------------------------

  console.log("\n--- POST /v1/saved with listing_id ---");

  const postSavedListingId = await request(
    "/v1/saved",
    "POST",
    token,
    {
      listing_id: listing.listing_id,
    }
  );

  console.log(
    "Status:",
    postSavedListingId.status
  );

  console.log(
    "Allow:",
    postSavedListingId.allow || "none"
  );

  console.log(
    JSON.stringify(
      postSavedListingId.data,
      null,
      2
    )
  );

  // ---------------------------------------------------------
  // DELETE /v1/saved/{id}
  // ---------------------------------------------------------

  console.log("\n--- DELETE /v1/saved/{id} ---");

  const deleteSaved = await request(
    `/v1/saved/${listing.listing_id}`,
    "DELETE",
    token
  );

  console.log(
    "Status:",
    deleteSaved.status
  );

  console.log(
    "Allow:",
    deleteSaved.allow || "none"
  );

  console.log(
    JSON.stringify(
      deleteSaved.data,
      null,
      2
    )
  );

  // ---------------------------------------------------------
  // DELETE /v1/saved
  // ---------------------------------------------------------

  console.log("\n--- DELETE /v1/saved ---");

  const deleteSavedRoot = await request(
    "/v1/saved",
    "DELETE",
    token
  );

  console.log(
    "Status:",
    deleteSavedRoot.status
  );

  console.log(
    "Allow:",
    deleteSavedRoot.allow || "none"
  );

  console.log(
    JSON.stringify(
      deleteSavedRoot.data,
      null,
      2
    )
  );

  // ---------------------------------------------------------
  // Final GET
  // ---------------------------------------------------------

  console.log("\n--- FINAL GET /v1/saved ---");

  const finalSaved = await request(
    "/v1/saved",
    "GET",
    token
  );

  console.log(
    "Status:",
    finalSaved.status
  );

  console.log(
    JSON.stringify(
      finalSaved.data,
      null,
      2
    )
  );

  console.log("\n=================================");
  console.log("Test Complete");
  console.log("=================================");
}

main().catch((error) => {
  console.error("\nTest failed:");
  console.error(error);
});