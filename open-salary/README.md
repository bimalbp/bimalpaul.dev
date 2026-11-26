# Open Salary Data

A free, public salary-transparency site and iOS app. Anyone can see salary ranges with no account, no sign-in and no paywall, and every number links back to its public source.

This is the v1 proof of concept from the "Open Salary Data — v1 Sketch" doc: salary data only, read-only, search by company, job title and city.

```
open-salary/
├── web/   Next.js site + public JSON API + data pipeline scripts
└── ios/   SwiftUI app (iOS 17+) that reads the same API
```

## Web app

```bash
cd open-salary/web
npm install
npm run dev            # http://localhost:3000
npm test               # unit tests (normalization, stats, search)
npm run build          # production build
```

Pages:

- `/`: a single search box (company or title) plus an optional city. Each search is a plain URL (`/?q=software+engineer&city=new+york`), so results can be shared and the page works without JavaScript.
- `/company/:slug`: every role and range for one company.
- `/about`: where the data comes from and how to read a result.

Each result is one role at one company in one city, shown with:

- the median
- the middle half (25th–75th percentile, shown only when there are 3 or more records)
- the full low–high range
- the last-updated date
- a **Sources** list where every record links to its public source

Hourly, weekly and monthly pay is converted to a yearly figure at 2,080 hours a year.

No cookies, no login, no email capture.

### Public API

All endpoints are `GET`, need no key, send CORS `*` and are cached for 5 minutes.

| Endpoint | Returns |
| --- | --- |
| `/api/search?q=&city=&limit=50&records=1` | Matching groups with stats. Set `records=0` to leave out the individual records. |
| `/api/companies/:slug` | One company and all its groups |
| `/api/companies?prefix=` | Company name suggestions. With no prefix, the first 40 companies A–Z. |
| `/api/meta` | Dataset date, sources, counts and whether the data is sample data |

## Data

The apps read one file, `web/data/dataset.json`. It is reloaded automatically when it changes. You can point to a different file with `SALARY_DATA_FILE`.

### Sample data

The committed `dataset.json` is **synthetic sample data**:

- the companies are fictional
- every record has `sourceType: "sample"`
- the web and iOS apps show a "Sample data" banner while `isSample` is true

It exists so the apps run before real data is loaded. To regenerate it, run `npm run data:sample`.

### Loading real data (H-1B / LCA disclosures)

1. Download a quarterly **LCA Programs (H-1B, H-1B1, E-3)** disclosure file from the US Department of Labor: <https://www.dol.gov/agencies/eta/foreign-labor/performance>.
2. Put it in `web/raw/`. That folder is git-ignored because the files are over 100 MB.
3. Run the import:

```bash
npm run data:lca -- raw/LCA_Disclosure_Data_FY2025_Q4.xlsx --period "FY2025 Q4"
# add more quarters:
npm run data:lca -- raw/LCA_Disclosure_Data_FY2025_Q3.xlsx --period "FY2025 Q3" --append
```

The importer reads `.xlsx` (streamed) or `.csv` and runs pipeline steps 2–5 from the sketch:

- **Filter:** keeps `Certified` H-1B, H-1B1 and E-3 filings.
- **Parse:** reads the wage, its pay unit and the date.
- **Normalize:**
  - company names, e.g. `GOOGLE LLC` → `Google`
  - titles to a standard role and level, e.g. `Sr. Software Developer` → Senior Software Engineer
- **Dedupe:** one record per case number.
- **Sanity check:** drops wages outside $15K–$2M a year.

Each record's source link is the DOL disclosure page, and its case number is shown next to it. DOL publishes no per-case URL.

## iOS app

SwiftUI, iOS 17+, no third-party dependencies. The project is generated with [XcodeGen](https://github.com/yonaskolb/XcodeGen):

```bash
brew install xcodegen
cd open-salary/ios
xcodegen generate
open OpenSalary.xcodeproj
```

Start the web app (`npm run dev` in `web/`) and run the **OpenSalary** scheme in the simulator. It calls `http://localhost:3000` by default.

For a device or a release build, set `OS_API_BASE_URL` in `project.yml` to the deployed site. App Transport Security allows plain `http` only for local addresses.

Screens:

- **Search:** live, debounced search by company or title, an optional city, and browsing by company.
- **Result:** median, middle half and range, plus every record with a tappable source link and case number.
- **Company:** every role grouped by title, then by city.
- **About the data:** sources, dataset date and how to read the bars.

`OpenSalaryTests` decodes real responses saved from the API (`OpenSalaryTests/Fixtures`), so a change to the API's JSON shape breaks a test.

## Next steps (from the sketch)

- Posting ingestion for one pay-transparency state (New York).
- Move the data to the suggested AWS architecture:
  - Postgres with full-text search, replacing the in-memory index in `web/lib/search.ts`
  - scheduled ingestion Lambdas and the static site, deployed with CDK
- Decide how to show LCA wages (often base pay only) next to posting ranges.
