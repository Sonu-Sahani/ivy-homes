import "dotenv/config";
import fs from "fs/promises";

const BASE_URL =
  process.env.VITE_API_BASE_URL || "https://solve.ivy.homes";

const API_KEY = process.env.VITE_IVY_API_KEY;

const LOGIN_EMAIL =
  process.env.IVY_DEMO_EMAIL || "demo1@ivy.homes";

const LOGIN_PASSWORD =
  process.env.IVY_DEMO_PASSWORD;

const API_PAGE_SIZE = 200;

if (!API_KEY) {
  console.error(
    "❌ VITE_IVY_API_KEY is missing from .env"
  );
  process.exit(1);
}

if (!LOGIN_PASSWORD) {
  console.error(
    "❌ IVY_DEMO_PASSWORD is missing from .env"
  );
  process.exit(1);
}

const baseHeaders = {
  "X-API-Key": API_KEY.trim(),
  "Content-Type": "application/json",
};

async function login() {
  console.log("\nLogging in...");

  const response = await fetch(
    new URL("/auth/login", BASE_URL),
    {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify({
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD,
      }),
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error(
      `❌ Login failed: ${response.status} ${response.statusText}`
    );

    console.error(data);

    process.exit(1);
  }

  const token =
    data.token || data.access_token;

  if (!token) {
    console.error(
      "❌ Login succeeded but no authentication token was returned."
    );

    console.error(data);

    process.exit(1);
  }

  console.log("✅ Login successful");

  return token;
}

async function fetchApi(
  path,
  token,
  params = {}
) {
  const url = new URL(path, BASE_URL);

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(
          key,
          value
        );
      }
    }
  );

  console.log(
    `GET ${url.pathname}${url.search}`
  );

  const response = await fetch(url, {
    method: "GET",

    headers: {
      ...baseHeaders,
      Authorization: `Bearer ${token.trim()}`,
    },
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error(
      `❌ ${response.status} ${response.statusText}`
    );

    console.error(data);

    return null;
  }

  console.log(
    `✅ ${response.status}`
  );

  return data;
}

async function fetchAll(
  endpoint,
  token
) {
  console.log(
    `\nFetching ${endpoint}...`
  );

  const firstPage =
    await fetchApi(
      endpoint,
      token,
      {
        page: 1,
        limit: API_PAGE_SIZE,
      }
    );

  if (!firstPage) {
    return [];
  }

  const firstResults =
    Array.isArray(firstPage.results)
      ? firstPage.results
      : [];

  const total =
    Number(firstPage.total) ||
    firstResults.length;

  const pageSize =
    Number(firstPage.page_size) ||
    firstResults.length ||
    API_PAGE_SIZE;

  const totalPages =
    Math.ceil(total / pageSize);

  console.log(
    `${endpoint}: API reports ${total} records`
  );

  console.log(
    `${endpoint}: ${totalPages} API page(s)`
  );

  const allResults = [
    ...firstResults,
  ];

  for (
    let page = 2;
    page <= totalPages;
    page++
  ) {
    const response =
      await fetchApi(
        endpoint,
        token,
        {
          page,
          limit: API_PAGE_SIZE,
        }
      );

    if (!response) {
      break;
    }

    const results =
      Array.isArray(response.results)
        ? response.results
        : [];

    if (results.length === 0) {
      console.log(
        `No results returned for API page ${page}.`
      );

      break;
    }

    allResults.push(
      ...results
    );
  }

  return allResults;
}

function deduplicateById(
  items,
  idField
) {
  return Array.from(
    new Map(
      items
        .filter(
          (item) =>
            item &&
            item[idField] !== undefined &&
            item[idField] !== null
        )
        .map((item) => [
          item[idField],
          item,
        ])
    ).values()
  );
}

async function saveData(
  listings,
  rentals,
  projects
) {
  await fs.mkdir(
    "investigation-data",
    {
      recursive: true,
    }
  );

  const output = {
    fetched_at:
      new Date().toISOString(),

    listings,

    rentals,

    projects,
  };

  await fs.writeFile(
    "investigation-data/api-data.json",
    JSON.stringify(
      output,
      null,
      2
    ),
    "utf8"
  );
}

async function main() {
  console.log(
    "================================="
  );

  console.log(
    "Ivy Homes API Investigation"
  );

  console.log(
    "================================="
  );

  // --------------------------------
  // 1. Login
  // --------------------------------

  const token = await login();

  console.log(
    "\nAuthentication token received."
  );

  // --------------------------------
  // 2. Listings
  // --------------------------------

  console.log(
    "\n---------------------------------"
  );

  const rawListings =
    await fetchAll(
      "/v1/listings",
      token
    );

  const listings =
    deduplicateById(
      rawListings,
      "listing_id"
    );

  console.log(
    `Listings collected: ${rawListings.length}`
  );

  console.log(
    `Unique listings: ${listings.length}`
  );

  // --------------------------------
  // 3. Rentals
  // --------------------------------

  console.log(
    "\n---------------------------------"
  );

  const rawRentals =
    await fetchAll(
      "/v1/rentals",
      token
    );

  const rentals =
    deduplicateById(
      rawRentals,
      "listing_id"
    );

  console.log(
    `Rentals collected: ${rawRentals.length}`
  );

  console.log(
    `Unique rentals: ${rentals.length}`
  );

  // --------------------------------
  // 4. Projects
  // --------------------------------

  console.log(
    "\n---------------------------------"
  );

  const rawProjects =
    await fetchAll(
      "/v1/projects",
      token
    );

  const projects =
    deduplicateById(
      rawProjects,
      "project_id"
    );

  console.log(
    `Projects collected: ${rawProjects.length}`
  );

  console.log(
    `Unique projects: ${projects.length}`
  );

  // --------------------------------
  // 5. Save
  // --------------------------------

  await saveData(
    listings,
    rentals,
    projects
  );

  // --------------------------------
  // 6. Final summary
  // --------------------------------

  console.log(
    "\n================================="
  );

  console.log(
    "Investigation Summary"
  );

  console.log(
    "=================================\n"
  );

  console.log(
    `Listings : ${listings.length}`
  );

  console.log(
    `Rentals  : ${rentals.length}`
  );

  console.log(
    `Projects : ${projects.length}`
  );

  console.log(
    "\n✅ Data saved to:"
  );

  console.log(
    "investigation-data/api-data.json"
  );

  console.log(
    "\nInvestigation completed."
  );
}

main().catch((error) => {
  console.error(
    "\n❌ Investigation failed:"
  );

  console.error(error);

  process.exit(1);
});