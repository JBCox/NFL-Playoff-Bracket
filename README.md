# NFL Playoff Bracket Challenge

A React + TypeScript web app for tracking NFL playoff bracket picks and scores.

**Live Site:** https://corvaerbracket.netlify.app

## Features

- View all participants' bracket picks
- Live score updates from ESPN API
- Mobile-responsive design with expandable bracket cards
- AFC/NFC conference toggle with mirrored bracket layouts
- Real-time leaderboard with score breakdowns

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Netlify (hosting)

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at http://localhost:5173

### Build

```bash
npm run build
```

Build output goes to the `dist/` folder.

## Deployment

The app is hosted on Netlify. Deployments are done manually via the Netlify CLI.

### Deploy to Production

```bash
# Build the app first
npm run build

# Deploy to Netlify (requires netlify-cli)
npx netlify deploy --prod --dir dist --no-build
```

The `--no-build` flag is required because the build is done separately with `npm run build`. Without this flag, Netlify tries to run its own build process which can cause configuration issues.

### Netlify Configuration

The `netlify.toml` file contains:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules (all routes -> index.html)

The `.netlify/state.json` file stores the site ID for CLI deployments.

## Project Structure

```
src/
  components/
    bracket/        # Bracket display components
      Bracket.tsx      # Full bracket page (desktop + mobile views)
      InlineBracket.tsx # Expandable inline bracket for mobile cards
      GameSlot.tsx     # Individual game matchup display
      TeamBox.tsx      # Team display with logo/score
    home/           # Home page components
      HomePage.tsx     # Main page with tabs
      BracketPreview.tsx # Participant card (expandable on mobile)
      GameCard.tsx     # Game display for Games tab
      MiniLeaderboard.tsx # Desktop sidebar leaderboard
  data/
    participants.ts  # Participant picks data
    teams.ts         # Team info and logos
  services/
    espnApi.ts       # ESPN API integration
    scoreCalculator.ts # Score calculation logic
  utils/
    elimination.ts   # Team elimination tracking
    reseeding.ts     # Playoff reseeding logic
    expectedMatchups.ts # Expected opponent calculations
  types.ts          # TypeScript type definitions
```

## Scoring

- Wild Card: 1 point per correct pick
- Divisional: 2 points per correct pick
- Conference: 3 points per correct pick
- Super Bowl: 5 points for correct pick
- **Maximum: 25 points**
