import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    version: 'V14.4',
    engines: 30,
    timestamp: new Date().toISOString()
  });
}
