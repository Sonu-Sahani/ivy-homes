import "dotenv/config";

const BASE_URL = process.env.VITE_API_BASE_URL;
const API_KEY = process.env.VITE_IVY_API_KEY;
const EMAIL = process.env.IVY_DEMO_EMAIL;
const PASSWORD = process.env.IVY_DEMO_PASSWORD;

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...(options.headers || {}),
    },
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
  console.log("Ivy Homes Route Discovery");
  console.log("=================================\n");

  // ---------------------------------------------------------
  // Login
  // ---------------------------------------------------------

  console.log("Logging in...");

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });

  console.log("Login status:", login.status);

  if (login.status !== 200) {
    console.log("Login failed:");
    console.log(login.data);
    return;
  }

  const token =
    login.data.token ||
    login.data.access_token;

  if (!token) {
    console.log("No token received.");
    console.log(login.data);
    return;
  }

  console.log("Login successful.\n");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------------------------------------------------
  // Candidate API documentation / schema routes
  // ---------------------------------------------------------

  const discoveryRoutes = [
    "/openapi.json",
    "/api/openapi.json",
    "/docs",
    "/redoc",
    "/swagger.json",
    "/api/docs",
    "/v1",
  ];

  console.log("Checking API discovery routes...\n");

  for (const path of discoveryRoutes) {
    const result = await request(path, {
      headers: authHeaders,
    });

    console.log(`${path} -> ${result.status}`);

    if (result.status !== 404) {
      console.log("Response:");
      console.log(
        typeof result.data === "string"
          ? result.data.slice(0, 1000)
          : JSON.stringify(result.data, null, 2).slice(0, 3000)
      );
      console.log();
    }
  }

  // ---------------------------------------------------------
  // Favourites / saved listing candidates
  // ---------------------------------------------------------

  console.log("\n=================================");
  console.log("Saved / Favourite Route Check");
  console.log("=================================\n");

  const candidates = [
    "/v1/favourites",
    "/v1/favorites",
    "/v1/saved",
    "/v1/saved-listings",
    "/v1/saved_listings",
    "/v1/bookmarks",
    "/v1/bookmarked",
    "/v1/wishlist",
    "/v1/wishlists",
    "/v1/user/favourites",
    "/v1/user/favorites",
    "/v1/user/saved",
    "/v1/users/me/favourites",
    "/v1/users/me/favorites",
    "/v1/users/me/saved",
  ];

  for (const path of candidates) {
    const result = await request(path, {
      method: "GET",
      headers: authHeaders,
    });

    console.log(
      `${path.padEnd(30)} -> ${result.status}`
    );

    if (result.status !== 404) {
      console.log(
        JSON.stringify(result.data, null, 2).slice(0, 1500)
      );
      console.log();
    }
  }

  // ---------------------------------------------------------
  // OPTIONS checks
  // ---------------------------------------------------------

  console.log("\n=================================");
  console.log("OPTIONS / Method Discovery");
  console.log("=================================\n");

  const knownRoutes = [
    "/v1/favourites",
    "/v1/favorites",
    "/v1/saved",
    "/v1/saved-listings",
    "/v1/bookmarks",
    "/v1/wishlist",
  ];

  for (const path of knownRoutes) {
    const result = await request(path, {
      method: "OPTIONS",
      headers: authHeaders,
    });

    console.log(
      `${path.padEnd(25)} -> ${result.status} | Allow: ${
        result.allow || "none"
      }`
    );
  }

  console.log("\n=================================");
  console.log("Discovery Complete");
  console.log("=================================");
}

main().catch((error) => {
  console.error("\nRoute discovery failed:");
  console.error(error);
});