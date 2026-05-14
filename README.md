# Serious Crime Watcher

A dashboard application visualizing crime statistics related to foreign nationals in Japan.

## Overview

This project aims to provide objective visualization of "Crime Statistics for Foreign Visitors to Japan" published by the National Police Agency of Japan.

### Key Features

- 📊 Crime statistics visualization by nationality and crime type
- 📈 Time-series trend analysis
- 🗾 Prefecture-level data display
- ⚖️ Comparison with Japanese nationals (population-adjusted)
- 👥 Age-group comparison (statistically fair comparison)

### Project Principles

1. **Objectivity** - Use only publicly available statistical data
2. **Transparency** - Clearly identify all data sources
3. **Fairness** - Always display crime rates per population
4. **Accuracy** - Document all data processing procedures

## Tech Stack

- **Frontend**: React 19 + TypeScript 6 + Vite 8
- **UI**: TailwindCSS 4
- **Charts**: ApexCharts 5
- **Hosting**: Cloudflare Pages (planned)
- **Cost**: Essentially free

## Project Structure

```
serious-crime-watcher/
├── DESIGN.md              # 📘 Detailed design document (in Japanese, must-read)
├── README.md              # This file
├── data/                  # CSV files (gitignored)
│   ├── r04_1-2.csv       # Jan-Feb 2022 data
│   └── r08_1-3.csv       # Jan-Mar 2026 data
├── frontend/              # React application
│   ├── src/
│   │   ├── types/        # TypeScript type definitions
│   │   ├── components/   # React components
│   │   └── App.tsx       # Main app
│   └── package.json
└── scripts/               # Data processing scripts (not yet created)
    └── convert-csv-to-json.js
```

## Setup

### Prerequisites

- Node.js 22+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd serious-crime-watcher

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser

## 📋 Current Progress

### ✅ Completed
- [x] Project initialization
- [x] React project setup with Vite
- [x] TypeScript type definitions
- [x] CSV data acquisition (2 samples)
- [x] Data structure design
- [x] CSV parsing specification
- [x] Data processing script implementation (CSV to JSON converter)
- [x] e-Stat API integration scripts
- [x] Chart implementation (ApexCharts integration)
- [x] Dashboard UI implementation
- [x] Demo data creation and testing

### 🚧 In Progress
- [ ] Real e-Stat data integration
- [ ] Multi-year data collection
- [ ] Filter functionality

### ⏳ Not Started
- [ ] Deployment to Cloudflare Pages

See `DESIGN.md` for details.

## Data Sources

- **e-Stat** (Portal Site of Official Statistics of Japan): https://www.e-stat.go.jp/
- **National Police Agency Crime Statistics**: Crime Statistics for Foreign Visitors to Japan
- **Ministry of Justice**: Foreign Residents Statistics (for crime rate calculation)

## Next Steps

1. **Implement Data Processing Script** (Priority: High)
   - Create `scripts/convert-csv-to-json.js`
   - Convert CSV to JSON

2. **UI/UX Design** (Priority: Medium)
   - Create dashboard wireframes
   - Determine chart placement

3. **Collect Multi-Year Data** (Priority: Medium)
   - Download CSVs for 2021-2024

See `DESIGN.md` Section 4 for detailed implementation plan.

## Handoff to Another PC/AI

This project is designed to be easily continued in different environments.

**Handoff Procedure:**
1. Read `DESIGN.md` thoroughly (especially "Handoff to Another PC/AI" section - in Japanese)
2. Install dependencies (see above)
3. Select high-priority task from "Next Steps"

## License

MIT

## Ethical Considerations

This application takes the following measures to avoid promoting prejudice against specific nationalities:

- Always display crime rates per population
- Fair age-group comparisons
- Ensure data source transparency
- Present data objectively

---

**Development Start**: May 14, 2026  
**Last Updated**: May 14, 2026

## Note

The detailed design document (`DESIGN.md`) is written in Japanese, as the primary data source and target users are Japanese. It contains:
- Complete CSV parsing specifications
- Detailed implementation plans
- Troubleshooting guide
- Handoff instructions for other developers/AI

For non-Japanese speakers working on this project, machine translation tools are recommended for reading `DESIGN.md`.
