// Health check endpoint for Kubernetes readiness and liveness probes
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // You can add more health checks here, like database connectivity
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  // For simple health checks
  return new NextResponse(null, { status: 200 });
}
