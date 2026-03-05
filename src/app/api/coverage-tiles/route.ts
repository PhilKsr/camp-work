import { NextRequest, NextResponse } from 'next/server';

// Configurable coverage tile URL - can be updated when O2 URL is determined
// const COVERAGE_TILE_URL = process.env.COVERAGE_TILE_URL || 'https://demo-tiles.maplibre.org/style.json';

// Simple rate limiting with in-memory store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userRequests.count >= RATE_LIMIT) {
    return false;
  }

  userRequests.count++;
  return true;
}

function createTransparentPng(): Buffer {
  // Create a minimal transparent 256x256 PNG
  const transparentPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x37, 0x6e, 0xf9, 0x24, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x08, 0x1d, 0x01, 0x01, 0x00, 0x00, 0xff,
    0xff, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  return transparentPng;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const z = searchParams.get('z');
    const x = searchParams.get('x');
    const y = searchParams.get('y');
    const tech = searchParams.get('tech') || '4g'; // Default to 4G

    // Validate required parameters
    if (!z || !x || !y) {
      return new NextResponse('Missing required parameters: z, x, y', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Rate limiting by IP
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(clientIP)) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // For now, return a transparent tile as we don't have the actual O2 URL
    // TODO: Replace with actual O2 tile URL when available
    console.log(`Coverage tile request: z=${z}, x=${x}, y=${y}, tech=${tech}`);

    // Simulate different coverage levels based on coordinates
    // This is just for development - replace with actual O2 data
    const isUrbanArea = (parseInt(x) + parseInt(y)) % 3 === 0;

    if (!isUrbanArea) {
      // Return transparent tile for areas without coverage
      const transparentTile = createTransparentPng();

      return new NextResponse(Buffer.from(transparentTile), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // 24h cache
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      });
    }

    // For development: create a simple colored tile based on tech
    // This will be replaced with actual O2 tile proxying
    // const colors: Record<string, string> = {
    //   '5g': '#28A745', // green
    //   '4g': '#E19B53', // warm gold
    //   '3g': '#FFC107', // yellow
    //   '2g': '#DC3545', // red
    // };

    // const color = colors[tech] || colors['4g'];

    // Return transparent tile for now - actual implementation will proxy O2 tiles
    const transparentTile = createTransparentPng();

    return new NextResponse(Buffer.from(transparentTile), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Coverage tiles proxy error:', error);

    // Return transparent tile on error
    const transparentTile = createTransparentPng();

    return new NextResponse(Buffer.from(transparentTile), {
      status: 200, // Don't fail the tile request
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Shorter cache on error
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
