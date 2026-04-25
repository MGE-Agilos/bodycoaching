# BodyCoaching

A comprehensive triathlon training web application that helps athletes manage their entire training journey — from workout planning and logging to nutrition tracking, goal setting, and performance analytics.

> **100% offline** · No backend required · All data stored locally in your browser

## Features

- **Dashboard** — At-a-glance overview of today's plan, weekly progress, active goals, and calorie intake
- **Training Plan** — Generate adaptive weekly plans based on your fitness level; navigate weeks; mark workouts complete
- **Workout Logging** — Log swim, bike, and run sessions with duration, distance, pace, power, heart rate, and effort rating
- **Nutrition Tracking** — Daily meal logger with a built-in food database, macro breakdowns, and water intake tracking
- **Goals** — Create SMART goals with visual progress bars, deadlines, and completion archiving
- **Analytics** — Trend charts for pace, power, and volume; personal records; intensity distribution
- **Exercise Library** — Browse 60+ exercises categorised by strength, mobility, and technique; save favourites; add to your plan
- **Athlete Profile** — Store fitness metrics (FTP, 5K time, heart rate zones); export/import your data as JSON

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Styling | Tailwind CSS 3 |
| Language | TypeScript 5 |
| Charts | SVG-based SimpleChart component |
| Persistence | `localStorage` (zero backend) |
| Deployment | GitHub Pages |

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
git clone https://github.com/MGE-Agilos/bodycoaching.git
cd bodycoaching
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000/bodycoaching](http://localhost:3000/bodycoaching) in your browser.

### Production Build

```bash
npm run build
```

This generates a fully static site in the `out/` directory that can be served from any static host.

## Project Structure

```
bodycoaching/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Dashboard (/)
│   │   ├── training/        # Weekly training plan
│   │   ├── workouts/        # Workout logging & history
│   │   ├── nutrition/       # Meal logging & macros
│   │   ├── goals/           # Goal management
│   │   ├── analytics/       # Performance charts
│   │   ├── exercises/       # Exercise library
│   │   └── profile/         # Athlete profile & settings
│   ├── components/          # Reusable UI components
│   │   ├── Navigation.tsx
│   │   ├── StatCard.tsx
│   │   ├── GoalProgressBar.tsx
│   │   └── SimpleChart.tsx
│   ├── context/
│   │   └── AppContext.tsx   # Global state backed by localStorage
│   ├── data/
│   │   ├── exercises.ts     # Built-in exercise library (~60 exercises)
│   │   └── foods.ts         # Built-in food database (~100 common foods)
│   ├── lib/
│   │   ├── planGenerator.ts # Adaptive training plan algorithm
│   │   ├── storage.ts       # localStorage helpers
│   │   └── utils.ts         # Date, format, and discipline helpers
│   └── types.ts             # Shared TypeScript interfaces
├── SPEC.md                  # Full technical specification
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Data & Privacy

All data is stored exclusively in your browser's `localStorage`. Nothing is sent to any server. You can export a full JSON backup from **Profile → Export Data** and re-import it on another device.

## Deployment

The app is deployed to GitHub Pages at:  
**https://mge-agilos.github.io/bodycoaching/**

Deployment is fully automated via GitHub Actions. Every push to `main` triggers the workflow at `.github/workflows/deploy.yml`, which:

1. Installs dependencies (`npm ci`)
2. Builds the static export (`npm run build` → `out/`)
3. Publishes the `out/` directory to GitHub Pages

The `next.config.js` sets `basePath` and `assetPrefix` to `/bodycoaching` for correct asset resolution on GitHub Pages.

To build locally:

```bash
npm run build
# Static output is in the out/ directory
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please keep all data handling client-side only — this project intentionally has no backend dependency.

## License

MIT — see [LICENSE](LICENSE) for details.
