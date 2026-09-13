import "dotenv/config";
import fs from "fs/promises";

const DATA_FILE = "./investigation-data/api-data.json";

const REFERENCE = new Date("2026-09-10T00:00:00+05:30");
const SEVEN_DAYS_BEFORE = new Date(
  REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000
);

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isTrue(value) {
  return value === true || normalize(value) === "true";
}

function getListingId(listing) {
  return listing.listing_id ?? listing.id ?? null;
}

function getProjectId(project) {
  return project.project_id ?? project.id ?? null;
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function printSection(title) {
  console.log("\n=================================");
  console.log(title);
  console.log("=================================");
}

function printJson(label, value) {
  console.log(`\n${label}:`);
  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  printSection("Ivy Homes Data Analysis");

  const raw = await fs.readFile(DATA_FILE, "utf8");
  const data = JSON.parse(raw);

  const listings = Array.isArray(data.listings) ? data.listings : [];
  const rentals = Array.isArray(data.rentals) ? data.rentals : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];

  console.log("Listings:", listings.length);
  console.log("Rentals:", rentals.length);
  console.log("Projects:", projects.length);

  // =========================================================
  // Q1
  // =========================================================

  printSection("Q1 - Total Listing Records");

  const totalListingRecords = listings.length;

  console.log("Answer:", totalListingRecords);

  // =========================================================
  // Q2
  // Unique physical properties
  // =========================================================

  printSection("Q2 - Unique Properties");

  /*
    The current listing objects do not expose a separate
    physical property ID.

    Therefore use a normalized physical-property identity
    based on property name + locality + coordinates.
  */

  const propertyKeys = new Set();

  for (const listing of listings) {
    const key = [
      normalize(listing.apartment_name),
      normalize(listing.locality),
      number(listing.latitude),
      number(listing.longitude),
    ].join("|");

    propertyKeys.add(key);
  }

  const uniqueProperties = propertyKeys.size;

  console.log("Answer:", uniqueProperties);

  // =========================================================
  // Q3
  // =========================================================

  printSection("Q3 - Active Listings");

  const activeListings = listings.filter((listing) =>
    isTrue(listing.is_live)
  );

  console.log("Answer:", activeListings.length);

  // =========================================================
  // Q4
  // Corrupt listings
  // =========================================================

  printSection("Q4 - Corrupt Listings");

  /*
    Dataset contains clearly impossible property areas.

    Examples:
    2 BHK -> 73 sqft
    4 BHK -> 137 sqft
    3 BHK -> 110 sqft
    4 BHK -> 144 sqft

    We use a conservative threshold of < 200 sqft for
    non-plot residential listings.
  */

  const corruptListings = [];

  for (const listing of listings) {
    const bedroom = number(listing.bedroom);
    const carpetArea = number(listing.carpet_area);
    const propertyType = normalize(listing.property_type);
    const description = normalize(listing.description);

    const isPlot =
      bedroom === 0 ||
      propertyType.includes("plot") ||
      description.includes("plot");

    if (
      !isPlot &&
      bedroom > 0 &&
      carpetArea !== null &&
      carpetArea < 200
    ) {
      corruptListings.push({
        listing_id: getListingId(listing),
        bedroom,
        carpet_area: carpetArea,
        property_type: listing.property_type,
        apartment_name: listing.apartment_name,
        reason: "Impossible residential carpet area",
      });
    }
  }

  const corruptListingIds = corruptListings
    .map((item) => item.listing_id)
    .filter(Boolean)
    .sort();

  printJson("Corrupt listings", corruptListings);

  console.log("\nAnswer:", corruptListingIds);

  // =========================================================
  // Q5
  // =========================================================

  printSection("Q5 - Total Monthly Rent in Kharadi");

  const kharadiRentals = rentals.filter(
    (rental) => normalize(rental.locality) === "kharadi"
  );

  const totalMonthlyRent = kharadiRentals.reduce((sum, rental) => {
    const rent = number(rental.price);

    return sum + (rent ?? 0);
  }, 0);

  console.log("Kharadi rental records:", kharadiRentals.length);
  console.log("Answer:", totalMonthlyRent);

  // =========================================================
  // Q9
  // Fake listings
  // =========================================================

  printSection("Q9 - Fake Listings");

  /*
    Strong fraud signal found in the dataset:
    listing asks user to pay a token amount immediately
    to block the property.

    We deliberately do NOT classify:
    - unverified listings
    - owner listings
    - missing project_id
    - unusual descriptions

    as fake by themselves.
  */

  const fakeListings = [];

  for (const listing of listings) {
    const description = normalize(listing.description);

    const hasPaymentPressure =
      description.includes("pay a token amount") ||
      description.includes("token amount") ||
      description.includes("pay rs") ||
      description.includes("pay inr") ||
      description.includes("pay ₹");

    if (hasPaymentPressure) {
      fakeListings.push({
        listing_id: getListingId(listing),
        reason: "Requests immediate token payment to block property",
        description: listing.description,
      });
    }
  }

  const fakeListingIds = fakeListings
    .map((item) => item.listing_id)
    .filter(Boolean)
    .sort();

  printJson("Fake listings", fakeListings);

  console.log("\nAnswer:", fakeListingIds);

  // =========================================================
  // Q6
  // Average 2BHK price per sqft
  // =========================================================

  printSection("Q6 - Average 2BHK Price Per Sqft");

  /*
    Exclude Q4 corrupt IDs and Q9 fake IDs.
  */

  const excludedIds = new Set([
    ...corruptListingIds.map(String),
    ...fakeListingIds.map(String),
  ]);

  const validTwoBhkListings = listings.filter((listing) => {
    const id = String(getListingId(listing));
    const bedroom = number(listing.bedroom);
    const price = number(listing.price);
    const carpetArea = number(listing.carpet_area);

    return (
      isTrue(listing.is_live) &&
      bedroom === 2 &&
      price !== null &&
      carpetArea !== null &&
      carpetArea > 0 &&
      !excludedIds.has(id)
    );
  });

  const pricePerSqft = validTwoBhkListings.map((listing) => {
    return number(listing.price) / number(listing.carpet_area);
  });

  const avgPricePerSqft =
    pricePerSqft.length > 0
      ? pricePerSqft.reduce((sum, value) => sum + value, 0) /
        pricePerSqft.length
      : 0;

  console.log(
    "Excluded IDs:",
    [...excludedIds]
  );

  console.log(
    "Valid live 2BHK listings:",
    validTwoBhkListings.length
  );

  console.log(
    "Answer:",
    avgPricePerSqft.toFixed(2)
  );

  // =========================================================
  // Q7
  // =========================================================

  printSection("Q7 - Costliest Project");

  let costliestProject = null;

  for (const project of projects) {
    const priceMax = number(project.price_max);

    if (priceMax === null) continue;

    if (
      !costliestProject ||
      priceMax > costliestProject.price_max
    ) {
      costliestProject = {
        project_id: getProjectId(project),
        price_max: priceMax,
      };
    }
  }

  printJson("Answer", costliestProject);

  // =========================================================
  // Q8
  // =========================================================

  printSection("Q8 - Listings in Last 7 Days");

  const lastSevenDaysListings = listings.filter((listing) => {
    const postedAt = parseDate(listing.posted_at);

    if (!postedAt) return false;

    return (
      postedAt >= SEVEN_DAYS_BEFORE &&
      postedAt < REFERENCE
    );
  });

  console.log(
    "Start:",
    SEVEN_DAYS_BEFORE.toISOString()
  );

  console.log(
    "End:",
    REFERENCE.toISOString()
  );

  console.log(
    "Matching listing IDs:",
    lastSevenDaysListings
      .map(getListingId)
      .filter(Boolean)
  );

  console.log(
    "Answer:",
    lastSevenDaysListings.length
  );

  // =========================================================
  // Q10
  // =========================================================

  printSection("Q10 - Projects With Wrong Listing Count");

  /*
    Count actual listings belonging to each project.
  */

  const listingsByProject = new Map();

  for (const listing of listings) {
    const projectId = listing.project_id;

    if (!projectId) continue;

    const key = String(projectId);

    listingsByProject.set(
      key,
      (listingsByProject.get(key) || 0) + 1
    );
  }

  const wrongProjectCounts = [];

  for (const project of projects) {
    const projectId = getProjectId(project);

    if (!projectId) continue;

    const reportedCount = number(project.total_listings);

    if (reportedCount === null) continue;

    const actualCount =
      listingsByProject.get(String(projectId)) || 0;

    if (reportedCount !== actualCount) {
      wrongProjectCounts.push({
        project_id: projectId,
        reported_count: reportedCount,
        actual_count: actualCount,
        difference: actualCount - reportedCount,
      });
    }
  }

  printJson(
    "Projects with wrong listing counts",
    wrongProjectCounts
  );

  console.log(
    "\nAnswer:",
    wrongProjectCounts.length
  );

  // =========================================================
  // FINAL SUMMARY
  // =========================================================

  printSection("10 QUESTION SUMMARY");

  console.log(
    "Q1 total_listing_records:",
    totalListingRecords
  );

  console.log(
    "Q2 unique_properties:",
    uniqueProperties
  );

  console.log(
    "Q3 active_listings:",
    activeListings.length
  );

  console.log(
    "Q4 corrupt_listing_ids:",
    corruptListingIds
  );

  console.log(
    "Q5 total_monthly_rent:",
    totalMonthlyRent
  );

  console.log(
    "Q6 avg_price_per_sqft_2bhk:",
    Number(avgPricePerSqft.toFixed(2))
  );

  console.log(
    "Q7 costliest_project:",
    costliestProject
  );

  console.log(
    "Q8 listings_last_7_days:",
    lastSevenDaysListings.length
  );

  console.log(
    "Q9 fake_listing_ids:",
    fakeListingIds
  );

  console.log(
    "Q10 projects_with_wrong_listing_count:",
    wrongProjectCounts.length
  );

  // =========================================================
  // SAVE RESULT
  // =========================================================

  const result = {
    reference: "2026-09-10T00:00:00+05:30",

    q1_total_listing_records: totalListingRecords,

    q2_unique_properties: uniqueProperties,

    q3_active_listings: activeListings.length,

    q4_corrupt_listing_ids: corruptListingIds,

    q5_total_monthly_rent_kharadi: totalMonthlyRent,

    q6_avg_price_per_sqft_2bhk: Number(
      avgPricePerSqft.toFixed(2)
    ),

    q7_costliest_project: costliestProject,

    q8_listings_last_7_days:
      lastSevenDaysListings.length,

    q9_fake_listing_ids: fakeListingIds,

    q10_projects_with_wrong_listing_count:
      wrongProjectCounts.length,

    q4_details: corruptListings,

    q9_details: fakeListings,

    q10_details: wrongProjectCounts,
  };

  await fs.writeFile(
    "./investigation-data/analysis-result.json",
    JSON.stringify(result, null, 2)
  );

  console.log(
    "\nSaved: investigation-data/analysis-result.json"
  );
}

main().catch((error) => {
  console.error("\nAnalysis failed:");
  console.error(error);
  process.exit(1);
});