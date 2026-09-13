# Ivy Homes Property Explorer

A responsive React-based property exploration platform built for the Ivy Homes internship assignment.

The application allows authenticated users to browse property listings, rentals and projects, view individual property details, save listings, and explore useful market insights calculated from available API data.

## Features

- Real authentication using Ivy Homes demo accounts
- Persistent authentication session
- Access-token refresh handling
- Property listings with frontend pagination
- Filters for locality, bedrooms, price range and furnishing
- Individual listing detail pages with shareable URLs
- Save and remove listings
- Saved listings persist across reloads and re-login
- Rental browsing with monthly rent and carpet area
- Project browsing with price ranges, area and unit information
- Insights dashboard with calculated statistics
- Responsive UI for desktop, tablet and mobile
- Loading, error and empty states
- Toast notifications

## Tech Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- React Toastify
- JavaScript

## API

Base API:

`https://solve.ivy.homes`

The application communicates with the Ivy Homes API using the required API key header and authenticated bearer tokens.

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPO_URL
cd ivy-homes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://solve.ivy.homes
VITE_IVY_API_KEY=YOUR_API_KEY
IVY_DEMO_EMAIL=YOUR_DEMO_EMAIL
IVY_DEMO_PASSWORD=YOUR_DEMO_PASSWORD
```

Do not commit `.env` or expose credentials in the repository.

### 4. Start the development server

```bash
npm run dev
```

### 5. Create a production build

```bash
npm run build
```

## API Investigation

The API documentation was treated as a hypothesis rather than the source of truth because the assignment states that the documentation may contain inaccuracies.

The documented endpoints were tested against the running API, and the actual responses and returned data were compared with the documentation.

Investigation scripts are available in the `scripts/` directory:

- `investigate-api.js`
- `analyze-data.js`
- `discover-routes.js`
- `test-routes.js`

The investigation collected listing, rental and project data and used that data for consistency and data-quality checks.

## Documentation vs Actual API

### Single Listing Endpoint

Documented:

`GET /v1/listing/{id}`

Actual working endpoint:

`GET /v1/listings/{id}`

The documented route returned `404` for a valid listing.

### Saved Listings

Documented:

`/v1/favourites`

Actual working endpoints:

- `GET /v1/saved`
- `POST /v1/saved`
- `DELETE /v1/saved/{id}`

The documented favourites route returned `404`.

The working POST request requires:

```json
{
  "listing_id": "..."
}
```

instead of the documented `id` field.

### Analytics

Documented:

`GET /v1/analytics/summary`

Actual:

`404 Not Found`

The Insights page therefore calculates useful statistics from the available listings, rentals and projects data.

### Project Listing Counts

The `total_listings` value returned by the projects endpoint was compared against listing records grouped by `project_id`.

The reported count disagreed with the actual listing records for 47 projects.

### Data Quality

Four residential listing records contained implausibly small carpet areas for their stated bedroom counts:

- `MAG-3001035`
- `MAG-3001327`
- `MAG-3001519`
- `MAG-3003434`

### Fraud Signal

One listing contained a suspicious request for an immediate token payment:

- `ZER-3001479`

This was treated as a potential fraudulent listing signal.

## Investigation Results

| Question | Result |
|---|---:|
| Total listing records | 50 |
| Unique properties | 50 |
| Active listings | 40 |
| Total monthly rent | 198100 |
| Average price/sqft for live 2BHK | 10789.96 |
| Costliest project | P30015 |
| Costliest project price | 97.8 |
| Listings in last 7 days | 1 |
| Fake listing IDs | ZER-3001479 |
| Projects with wrong listing count | 47 |

The complete assignment answers and findings are provided in `submission.json`.

## What Was Verified

The following areas were tested against the running API and application:

- Authentication
- Access-token refresh
- Listing retrieval
- Individual listing retrieval
- Saved listing operations
- Rentals
- Projects
- Pagination
- Frontend filtering
- Listing data quality
- Project/listing consistency
- Analytics endpoint behavior
- Session persistence
- Logout behavior

## Frontend Implementation Decisions

Because parts of the API documentation did not match the running API, the frontend was implemented against the behavior actually observed from the API.

### Frontend Filtering

Listings are retrieved and filtered on the frontend so that the required filters remain functional independently of server-side filtering behavior.

### Saved Listings

The application uses the working `/v1/saved` API discovered during investigation instead of the documented `/v1/favourites` endpoint.

### Insights

The documented analytics endpoint was unavailable, so the Insights page calculates useful statistics from listings, rentals and projects data.

## Security

Sensitive credentials are stored using environment variables and should never be committed to Git.

The `.env` file is excluded from version control.

## Project Structure

```text
ivy-homes/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── scripts/
│   ├── investigate-api.js
│   ├── analyze-data.js
│   ├── discover-routes.js
│   └── test-routes.js
├── investigation-data/
├── public/
├── .env
├── .gitignore
├── README.md
├── submission.json
├── package.json
└── vite.config.js
```

## If I Had Two More Days

With two additional days, I would focus on:

1. Adding automated frontend tests for authentication, filtering and saved listings.
2. Adding automated API contract tests for documented versus actual behavior.
3. Improving the Insights dashboard with richer visualizations.
4. Adding stronger validation for suspicious and corrupted listings.
5. Improving accessibility and keyboard navigation.
6. Adding production monitoring and better API error recovery.
7. Improving caching and request deduplication.

## Deployment

GitHub Repository:

`YOUR_GITHUB_REPO_URL`

Live Demo:

`YOUR_DEPLOYED_APP_URL`

## Submission

The final submission contains:

- Working React frontend
- API investigation scripts
- `submission.json` containing assignment answers and findings
- README with setup and investigation details
- Public GitHub repository
- Deployed application
