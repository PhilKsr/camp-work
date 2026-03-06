# Camp Work 🏕️📶

Finde Campingplätze in Deutschland mit zuverlässiger O2-Netzabdeckung.
Eine Progressive Web App für digitale Nomaden und Remote Worker.

## Features

- 🗺️ Interaktive Hybridkarte (Satellit + Straßen) mit 1762 Campingplätzen
- 📶 Offizielle O2/Telefónica Netzabdeckung (Quelle: © Bundesnetzagentur)
- 🔍 Suche nach Name und Ort mit Autocomplete
- 🎛️ Filter nach Netzqualität, Typ und Ausstattung
- ❤️ Favoriten mit lokaler Speicherung
- 📱 Progressive Web App – installierbar auf Handy und Desktop
- 🔗 Deep-Links – Kartenposition und Filter in der URL

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui · MapLibre GL ·
Zustand · TanStack Query · Framer Motion · Serwist (PWA)

## Schnellstart

### Voraussetzungen

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- MapTiler API Key (kostenlos: https://cloud.maptiler.com/account/keys/)

### Installation

```bash
git clone https://github.com/PhilKsr/camp-work.git
cd camp-work
pnpm install
cp .env.local.example .env.local
# MapTiler Key in .env.local eintragen
```

### Daten aktualisieren (optional)

```bash
pnpm fetch:campgrounds   # Campingplätze aus OpenStreetMap laden
pnpm fetch:enrich        # Netzabdeckung pro Campingplatz berechnen
pnpm fetch:thumbnails    # Bilder von Campingplatz-Websites laden (dauert lange)
```

### Entwicklung

```bash
pnpm dev                 # Dev-Server starten (http://localhost:3000)
pnpm build               # Production Build
pnpm test                # Tests ausführen
pnpm lint                # Linting
```

## Docker

```bash
# Build
docker build -t camp-work .

# Run
docker run -p 3000:3000 -e NEXT_PUBLIC_MAPTILER_KEY=dein_key camp-work

# Oder mit docker-compose
docker compose up
```

### Raspberry Pi Deployment

Für ARM64 (Raspberry Pi 4/5):

```bash
docker build --platform linux/arm64 -t camp-work .
```

Oder über GitHub Container Registry:

```bash
docker pull ghcr.io/philksr/camp-work:latest
docker run -p 3000:3000 -e NEXT_PUBLIC_MAPTILER_KEY=dein_key ghcr.io/philksr/camp-work:latest
```

### Tailscale (Remote-Zugriff)

1. Tailscale auf dem Pi installieren:

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```

2. Die App ist dann über dein Tailscale-Netz erreichbar:

   ```
   http://raspberrypi:3000
   ```

3. Optional – HTTPS via Tailscale Serve:
   ```bash
   sudo tailscale serve --bg 3000
   # Erreichbar unter: https://raspberrypi.tail1234.ts.net
   ```

## Datenquellen

- **Campingplätze:** OpenStreetMap via Overpass API (monatlich aktualisiert)
- **Netzabdeckung:** © Bundesnetzagentur, Mobilfunk-Monitoring (CC BY-ND 3.0 DE)
- **Karte:** MapTiler Hybrid (Satellit + Straßen)

## Projektstruktur

```
src/
├── app/              # Next.js App Router
├── components/
│   ├── cards/        # CampingCard, CampingList, DetailSheet
│   ├── layout/       # Header, MobileBottomSheet
│   ├── map/          # MapView, CoverageLayer, CampingMarkers
│   ├── search/       # SearchBar, FilterPanel
│   └── ui/           # shadcn/ui + Logo, InstallPrompt, ErrorBoundary
├── hooks/            # useCampgrounds, useGeolocation, useSearch, useUrlState
├── lib/              # brand.ts, coverage.ts, utils.ts
├── stores/           # Zustand: map, coverage, filter, favorite, ui
└── types/            # Zod schemas + TypeScript types
scripts/
├── fetch-osm-campgrounds.ts   # OSM Overpass API
├── enrich-coverage.ts         # Coverage-Enrichment
├── fetch-thumbnails.ts        # Website OG-Image Scraping
└── generate-icons.ts          # PWA Icon Generation
```

## Lizenz

MIT
