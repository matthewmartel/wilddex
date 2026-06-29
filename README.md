# WildDex

WildDex is a mobile-first web app where users upload photos of real animals, confirm the species, unlock animals in a numbered Dex, and view their sightings on a personal map.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer installed. Then, in a terminal:

```bash
# 1. Get the code
git clone https://github.com/matthewmartel/wilddex.git
cd wilddex

# 2. Install dependencies
npm install

# 3. Set up your environment variables
#    Copy the template, then open .env.local and fill in your keys.
cp .env.example .env.local      # Windows PowerShell: copy .env.example .env.local

# 4. Start the app
npm run dev
```

Then open **http://localhost:3000** in your browser.

> **Note:** WildDex needs accounts with [Supabase](https://supabase.com), [Mapbox](https://account.mapbox.com), and [Anthropic](https://console.anthropic.com) to be fully functional. Add those keys to `.env.local` (see `.env.example` for the full list). The pages will load without them, but auth, the map, and AI identification won't work until the keys are set.

## Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server at http://localhost:3000 |
| `npm run build` | Build the production bundle |
| `npm run start` | Run the production build (after `npm run build`) |
| `npm run lint` | Check code with ESLint |
| `npm run sprites` | Regenerate pixel-art animal sprites |

## Features

- User accounts and authentication
- Numbered animal Dex with locked / unlocked states
- Photo upload with AI animal identification
- Personal sighting map
- Animal detail pages
- Quests, social feed, and friend activity

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Supabase (auth + database)
- Mapbox (maps)
- Anthropic Claude (AI animal identification)
