# Camp Work

A modern progressive web application for finding the perfect camping spots with reliable network coverage. Built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 🗺️ Interactive map with camping locations
- 📶 Network coverage visualization
- 🔍 Advanced search and filtering
- 📱 Progressive Web App (PWA) support
- 🎨 Beautiful brand-consistent UI with shadcn/ui
- 🌙 Dark/light mode support
- 📋 Detailed campground information
- 💾 Offline capability

## Tech Stack

- **Framework**: Next.js 16 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Maps**: MapLibre GL + react-map-gl
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Validation**: Zod
- **PWA**: Serwist
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended)

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
3. Add your MapTiler API key to `.env.local`
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. Run the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_api_key
```

Get a free API key from [MapTiler](https://maptiler.com).

## Development

### Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── layout/         # Layout components
│   ├── map/            # Map-related components
│   ├── cards/          # Card components
│   ├── search/         # Search components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and constants
├── types/              # TypeScript type definitions
├── data/               # Static data and mock content
└── stores/             # Zustand stores
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t camp-work .

# Run container
docker run -p 3000:3000 camp-work

# Or use docker-compose
docker-compose up
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
