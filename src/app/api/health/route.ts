import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.2.1',
      buildInfo: {
        buildTime: process.env.BUILD_TIME,
        gitCommit: process.env.GIT_COMMIT?.slice(0, 7),
      },
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
